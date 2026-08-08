# Public Website API Documentation

## Overview

This document is the source-backed integration contract for the public website frontend. It reflects the mounted Express routes, the actual public DTO projections, and the public runtime configuration endpoints implemented in source.

## Base URL and Response Conventions

- Base URL: `/api/v1`
- Public routes do not require authentication unless explicitly noted.
- Authenticated user requests use `Authorization: Bearer <JWT>`.
- Auth routes are rate-limited to 10 requests per 15 minutes per IP (configurable via AUTH_RATE_LIMIT_MAX env var).
- Most endpoints return `ApiResponse` with `statusCode`, `data`, `message`, and `success`.
- Some legacy controllers return a plain object with `success`, `data` and sometimes `message` or `pagination`; those responses are noted per endpoint.
- Error responses use the global error middleware shape: `success`, `message`, `errors`, and `stack` only in development.

## Operational Health Check

### GET `/api/v1/health`

- Auth: Public
- Purpose:
  - Confirms the backend process is up and responding.
  - Intended for deployment probes and smoke testing.
- Success response:
  - `200`
  - `success: true`
  - `message: "OIKYO Backend Engine is running smoothly."`
  - `timestamp`: ISO string

## Authentication

### POST `/auth/register`

- Auth: Public
- Body:
  - `fullName` required, max 100 chars
  - `mobile` required, 10-15 digits
  - `email` required, valid email format
  - `password` required, minimum 8 characters
- Behavior:
  - Creates the account with `role=customer` by default.
  - Checks for existing email/mobile conflicts before creation.
  - Stores password securely using bcrypt hashing.
  - Sends an email verification token via Resend API to `security@oikyo.me`.
  - Does not return an access token (requires email verification first).
- Response:
  - `201 Created`
  - `ApiResponse` with the created user in `data` (without password field)
  - Success message prompting email verification

### POST `/auth/login`

- Auth: Public
- Body:
  - `identifier` required (email or mobile)
  - `password` required
- Optional header:
  - `x-device-id` (defaults to 'unknown_device' if not provided)
- Behavior:
  - Validates credentials against hashed password in DB
  - Checks user `status=active` and `emailVerified=true`
  - Creates a session record with device info, IP, and user agent
  - Updates `lastLogin` timestamp on user record
  - Generates JWT access token
- Response:
  - `200 OK`
  - `ApiResponse` with `data.user` (without password field) and `data.accessToken`

### POST `/auth/verify-email`

- Auth: Public
- Body:
  - `token` required (JWT verification token sent via email)
- Behavior:
  - Finds valid, unexpired, unused verification token
  - Updates user's `emailVerified` status to `true`
  - Marks token as used to prevent reuse
- Response:
  - `200 OK`
  - Success message confirming email verification

### POST `/auth/forgot-password`

- Auth: Public
- Body:
  - `email` required (must match an existing user)
- Behavior:
  - Finds user by email (returns generic message if not found to prevent enumeration)
  - Generates new password reset token with 24-hour expiry
  - Stores token in DB with type 'password_reset'
  - Sends reset email via Resend API from `security@oikyo.me`
- Response:
  - `200 OK`
  - Generic success message regardless of whether user was found

### POST `/auth/reset-password`

- Auth: Public
- Body:
  - `token` required (JWT reset token)
  - `newPassword` required, minimum 8 characters
- Behavior:
  - Finds valid, unexpired, unused reset token
  - Hashes and updates user's password
  - Updates `passwordChangedAt` timestamp
  - Marks token as used
- Response:
  - `200 OK`
  - Success message confirming password reset

## Public Product APIs

### GET `/public/products`

- Auth: Public
- Cached for 300 seconds
- Query params:
  - `search` optional text search
  - `category` optional category slug
  - `minPrice` optional minimum price filter
  - `maxPrice` optional maximum price filter
  - `inStock` optional boolean, use `true` to restrict to in-stock products
  - `sort` optional, supported values: `price_asc`, `price_desc`, `relevance`
  - `page` optional, default `1`
  - `limit` optional, default `20`
- Visibility rules applied by service:
  - `status` must be `published`
  - `editorState.isHidden` must be `false`
  - `publishing.publishAt` must be `null` or in the past
  - `publishing.unpublishAt` must be `null` or in the future
  - Search results still respect the same visibility rules after the final query fix
- Response shape:
  - `data` is an array of product card DTOs
  - `pagination` is returned alongside `data`
- Product card DTO fields:

```json
{
  "title": "Sample Product",
  "slug": "sample-product",
  "media": {
    "thumbnail": "https://..."
  },
  "pricing": {
    "sellingPrice": 1000,
    "comparePrice": 1200
  },
  "inventory": {
    "stockStatus": "in_stock"
  },
  "badges": {
    "isFeatured": true
  },
  "createdAt": "2026-08-07T00:00:00.000Z"
}
```

### GET `/public/products/:slug`

- Auth: Public
- Cached for 600 seconds
- Path params:
  - `slug` required
- Visibility rules applied:
  - Product must have `status=published`
  - `editorState.isHidden` must be `false`
  - `publishing.publishAt` must be `null` or in the past
  - `publishing.unpublishAt` must be `null` or in the future
- Response DTO fields:
  - `title`
  - `slug`
  - `description`
  - `tags`
  - `category` populated with `name` and `slug`
  - `brand` populated with `name`, `slug`, and `logo`
  - `media`
  - `pricing.sellingPrice`
  - `pricing.comparePrice`
  - `inventory.sku`
  - `inventory.stockStatus`
  - `inventory.stockQuantity`
  - `variants`
  - `seo`
- Business rule:
  - Products that are hidden, unpublished, or outside the publish window are not returned.

## Storefront AI Assistant

### POST `/storefront/assistant/ask`

- Auth: Public
- Body:
  - `message` required (the user's query)
  - `chatHistory` optional array of `{ role, content }` objects for context
- Success response:
  - `200 OK`
  - `ApiResponse` with `data.success=true` and `data.reply` containing the AI-generated response
- Failure response:
  - `503 Service Unavailable`
  - `ApiResponse` with `data.success=false` and a fallback reply message
- Behavior:
  - The assistant is domain-restricted to OIKYO commerce topics only.
  - It uses the AI gateway with configured providers, implementing failover mechanisms.
  - It applies rate limiting and content moderation to prevent abuse.
- Response DTO:
  - `success`: boolean indicating if the request was processed
  - `reply`: string containing the AI-generated response
  - `sources`: array of sources used (if applicable)

## Public Website Configuration APIs

These endpoints are public reads used by the storefront to build layout, content, and metadata at runtime.

### Website Identity: `/wme/identity`

- `GET /wme/identity`
  - Auth: Public
  - Returns the global identity document or fallback defaults
  - Fields: `websiteName`, `shortName`, `tagline`, `description`, `defaultLanguage`

### Global Assets: `/wme/assets`

- `GET /wme/assets`
  - Auth: Public
  - Returns the global asset document or fallback defaults
  - Fields: `primaryLogo`, `textLogo`, `footerLogo`, `favicon`, `defaultProductImage`, `defaultAvatar`, `paymentIcons`

### Theme: `/wme/theme`

- `GET /wme/theme/active`
  - Auth: Public
  - Returns the currently active theme with all styling properties

### Navigation: `/wme/navigation`

- `GET /wme/navigation/header`
  - Auth: Public
  - Returns the public header navigation tree with links and menu structure
- `GET /wme/navigation/footer`
  - Auth: Public
  - Returns the public footer layout with links and sections

### CMS: `/wme/cms`

- `GET /wme/cms/page/:slug`
  - Auth: Public
  - Returns the page content by slug with rendered HTML and metadata
  - Response DTO includes `title`, `content`, `seo`, and `updatedAt`

### Catalog: `/wme/catalog`

- `GET /wme/catalog/categories/tree`
  - Auth: Public
  - Returns the multi-level category tree used for menus and filters
  - Includes category names, slugs, icons, images, and child categories

### SEO: `/wme/seo`

- `GET /wme/seo`
  - Auth: Public
  - Returns the global SEO settings or fallback defaults
  - Fields: `metaTitle`, `metaDescription`, `keywords`, `ogTitle`, `ogDescription`, `ogImage`, `twitterHandle`

### Contact: `/wme/contact`

- `GET /wme/contact`
  - Auth: Public
  - Returns the global contact settings or fallback defaults
  - Fields: `supportEmail`, `supportPhone`, `corporateAddress`, `workingHours`, `socialLinks`

### Announcement: `/wme/announcement`

- `GET /wme/announcement/active`
  - Auth: Public
  - Returns the active announcement payload when visible, otherwise `{ isVisible: false }`
  - When visible, includes `message`, `link`, `backgroundColor`, `textColor`

### Maintenance: `/wme/maintenance`

- `GET /wme/maintenance/status`
  - Auth: Public
  - Returns the current maintenance state
  - Default fallback fields: `isActive`, `message`, `expectedLiveTime`, `bypassToken`
  - Automatically disables maintenance when `expectedLiveTime` has passed

### Feature Toggles: `/wme/features`

- `GET /wme/features/config`
  - Auth: Public
  - Returns a slug-to-status map for runtime UI gating
  - Example: `{ "guest_checkout": "enabled", "reviews": "beta" }`

### Localization: `/wme/localization`

- `GET /wme/localization/active`
  - Auth: Public
  - Returns the active language list with codes and names
- `GET /wme/localization/dictionary/:code`
  - Auth: Public
  - Returns `{ languageCode, translations }` for the requested locale
  - Falls back to default language if requested code is not available

### Homepage: `/wme/homepage`

- `GET /wme/homepage/layout`
  - Auth: Public
  - Returns the public homepage widget layout with component types and configuration
  - Includes widgets like hero sliders, featured products, categories, etc.

## Shared Authenticated User API

### GET `/notifications/preferences`

- Auth: Required (valid JWT token)
- Behavior: Creates a default preferences document if missing for the user
- Response: The current user notification preferences document
- Response DTO:
  - `email`: boolean for email notifications
  - `push`: boolean for push notifications
  - `inApp`: boolean for in-app notifications
  - Per-event settings under `events` property

### PATCH `/notifications/preferences`

- Auth: Required (valid JWT token)
- Body:
  - `eventName` required (the specific event to configure)
  - `channels` required object with booleans such as `email`, `push`, and `inApp`
- Behavior:
  - Merges the channels for the selected event instead of replacing the whole preference document
  - Validates that at least one channel is enabled for the event
- Response: Updated preferences document with changes applied

## Runtime Dependencies and Integrations

- **Database**: MongoDB with Mongoose ODM for data persistence
- **Authentication**: JWT-based with refresh token support
- **Email**: Resend API for transactional emails from `security@oikyo.me`
- **AI Services**: Configurable AI providers with gateway for LLM interactions
- **File Storage**: Cloudinary for image and media hosting
- **Caching**: Upstash Redis for performance optimization
- **Security**: Helmet.js for security headers, rate limiting, and input validation
- **Logging**: Morgan for HTTP request logging and custom application logging

## Notes for Frontend Integration

- Public product list pages should use the card DTO projection, not the detail DTO.
- The product detail page should expect populated `category` and `brand` objects, not raw IDs.
- Public configuration endpoints can return fallback defaults when the admin has not configured them yet; the storefront should render safely against those defaults.
- The public assistant returns a `reply` field, not an `answer` field.
- The API implements caching on public endpoints to improve performance.
- All public endpoints are designed to be resilient and return graceful fallbacks if optional services are unavailable.