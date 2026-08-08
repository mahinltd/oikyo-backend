# Admin Frontend API Documentation

## Overview

This document is the source-backed integration contract for the admin frontend. It reflects the mounted Express routes in the current backend and the request/response shapes implemented in controllers, services, validations, and models.

## Base URL and Response Conventions

- Base URL: `/api/v1`
- Protected routes require `Authorization: Bearer <JWT>`.
- Authenticated requests may also send `x-device-id` for session tracking.
- Media upload uses `multipart/form-data` with file field `file`.
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

Auth routes are rate-limited to 10 requests per 15 minutes per IP (configurable via AUTH_RATE_LIMIT_MAX env var).

### POST `/auth/register`

- Auth: Public
- Body:
  - `fullName` required, max 100 chars
  - `mobile` required, 10-15 digits
  - `email` required, valid email format
  - `password` required, minimum 8 characters
- Behavior:
  - Creates the user with `role=customer` by default.
  - Checks for existing email/mobile conflicts before creation.
  - Stores password securely using bcrypt hashing.
  - Sends an email verification token via Resend API to `security@oikyo.me`.
  - Does not return an access token (requires email verification first).
- Response:
  - `201 Created`
  - `ApiResponse` with the created user object in `data` (without password field)
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

## WME and Site Configuration

These routes power both admin configuration screens and the public website's runtime data.

### Website Identity: `/wme/identity`

- `GET /wme/identity`
  - Auth: Public
  - Returns the single global identity document, or the default fallback object when not configured.
  - Fields: `websiteName`, `shortName`, `tagline`, `description`, `defaultLanguage`
- `PUT /wme/identity`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Body:
    - `websiteName` required
    - `shortName` optional
    - `tagline` optional
    - `description` optional
    - `defaultLanguage` optional
  - Response: Updated identity document

### Global Assets: `/wme/assets`

- `GET /wme/assets`
  - Auth: Public
  - Returns the single global asset document, or the default fallback object.
  - Fields include `primaryLogo`, `textLogo`, `footerLogo`, `favicon`, `defaultProductImage`, `defaultAvatar`, `paymentIcons`
- `PUT /wme/assets`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Body:
    - `primaryLogo` URI optional
    - `textLogo` URI optional
    - `footerLogo` URI optional
    - `favicon` URI optional
    - `defaultProductImage` URI optional
    - `defaultAvatar` URI optional
    - `paymentIcons` optional array of `{ name, url, isActive }`
  - Response: Updated assets document

### Theme: `/wme/theme`

- `GET /wme/theme/active`
  - Auth: Public
  - Returns the currently active theme
- `GET /wme/theme/all`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Returns all themes
- `POST /wme/theme/create`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Body:
    - `themeName` required
    - `version` optional
    - `colors` optional object with `primary`, `secondary`, `accent`, `background`, `text`, `border`
    - `typography` optional object with `primaryFont`, `secondaryFont`, `baseFontSize`
    - `components` optional object with `buttonStyle`, `inputStyle`
    - `layout` optional object with `containerMaxWidth`, `gridStyle`
  - Response: Created theme document
- `PUT /wme/theme/update/:id`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Same body as create
  - Response: Updated theme document
- `POST /wme/theme/switch`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Body:
    - `themeId` required
  - Response: Success confirmation

### Navigation: `/wme/navigation`

- `GET /wme/navigation/header`
  - Auth: Public
  - Returns the public header navigation tree
- `GET /wme/navigation/footer`
  - Auth: Public
  - Returns the public footer navigation layout
- `GET /wme/navigation/admin/header`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Returns the admin header navigation list
- `POST /wme/navigation/header`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Body:
    - `title` required
    - `parentId` optional
    - `linkType` required: `custom_url`, `cms_page`, or `catalog_category`
    - `url` optional
    - `referenceId` optional
    - `order` optional
    - `visibility` optional
    - `isMegaMenu` optional
  - Response: Created navigation item
- `PUT /wme/navigation/header/:id`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Same body as create
  - Response: Updated navigation item
- `DELETE /wme/navigation/header/:id`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Response: Success with `data: null`

### CMS: `/wme/cms`

- `GET /wme/cms/page/:slug`
  - Auth: Public
  - Returns the page by slug
- `GET /wme/cms/admin/pages`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Returns all pages
- `POST /wme/cms/admin/page`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Body matches `createUpdatePageSchema`
  - Response: Created page document
- `PUT /wme/cms/admin/page/:id`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Same body as create
  - Saves the previous version before updating
  - Response: Updated page document
- `DELETE /wme/cms/admin/page/:id`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Response: Success confirmation
- `GET /wme/cms/admin/page/:id/versions`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Returns version history for the page
- `POST /wme/cms/admin/page/:pageId/restore/:versionId`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Restores a previous version of the page
  - Response: Success confirmation

### Catalog: `/wme/catalog`

- `GET /wme/catalog/categories/tree`
  - Auth: Public
  - Returns the multi-level category tree for frontend navigation and product filters
- `GET /wme/catalog/admin/categories`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Returns `flatList` and `tree` representations of categories
- `POST /wme/catalog/admin/categories`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Body follows the Category model:
    - `name` required
    - `slug` required or derived from name
    - `parentId` optional
    - `description` optional
    - `image` optional
    - `icon` optional
    - `status` optional
    - `seo` optional object with `metaTitle` and `metaDescription`
  - Response: Created category document
- `PUT /wme/catalog/admin/categories/:id`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Same body as create
  - Response: Updated category document
- `DELETE /wme/catalog/admin/categories/:id`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Deletes the category and its sub-categories
  - Response: Success confirmation

### SEO: `/wme/seo`

- `GET /wme/seo`
  - Auth: Public
  - Returns the global SEO settings, or default fallback values
- `PUT /wme/seo`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Body:
    - `metaTitle` required
    - `metaDescription` required
    - `keywords` optional string
    - `ogTitle` optional
    - `ogDescription` optional
    - `ogImage` optional URI
    - `twitterHandle` optional
  - Response: Updated SEO settings document

### Contact: `/wme/contact`

- `GET /wme/contact`
  - Auth: Public
  - Returns the global contact settings, or fallback defaults
- `PUT /wme/contact`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Body can include:
    - `supportEmail`
    - `supportPhone`
    - `corporateAddress`
    - `workingHours`
    - `googleMapLink`
    - `socialLinks` array of `{ platform, url, isActive }`
  - Response: Updated contact settings document

### Announcement: `/wme/announcement`

- `GET /wme/announcement/active`
  - Auth: Public
  - Returns `{ isVisible: false }` when inactive or outside schedule
  - When visible, returns `isVisible`, `message`, `link`, `backgroundColor`, `textColor`
- `GET /wme/announcement/admin`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Returns the raw announcement config, or a default inactive object when missing
- `PUT /wme/announcement/admin`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Body:
    - `message` required, max 150 chars
    - `link` optional
    - `backgroundColor` optional HEX
    - `textColor` optional HEX
    - `isActive` optional
    - `schedule` optional object with `startTime` and `endTime`
  - Response: Updated announcement document

### Maintenance: `/wme/maintenance`

- `GET /wme/maintenance/status`
  - Auth: Public
  - Returns the current maintenance state
  - Default fallback fields: `isActive`, `message`, `expectedLiveTime`, `bypassToken`
  - Auto-disables maintenance when `expectedLiveTime` has passed
- `PUT /wme/maintenance/status`
  - Auth: Protected (`super_admin` role only)
  - Body:
    - `isActive` required
    - `message` required
    - `expectedLiveTime` optional future ISO date
    - `bypassToken` optional alphanumeric string
  - Response: Updated maintenance status document

### Feature Toggles: `/wme/features`

- `GET /wme/features/config`
  - Auth: Public
  - Returns a slug-to-status map, for example `{ "guest_checkout": "enabled" }`
- `GET /wme/features/admin`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Returns the raw toggle list
- `POST /wme/features/admin`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Body:
    - `name` required
    - `slug` required
    - `type` required: `feature` or `module`
    - `status` optional: `enabled`, `beta`, `deprecated`, `disabled`
    - `description` optional
  - Response: Created feature toggle document
- `PUT /wme/features/admin/:id`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Same body as create
  - Response: Updated feature toggle document
- `DELETE /wme/features/admin/:id`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Response: Success confirmation

### Localization: `/wme/localization`

- `GET /wme/localization/active`
  - Auth: Public
  - Returns the active language list, not a dictionary object
- `GET /wme/localization/dictionary/:code`
  - Auth: Public
  - Returns `{ languageCode, translations }`
  - Falls back to the default language if the requested code is missing
- `POST /wme/localization/admin`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Body:
    - `languageCode` required
    - `languageName` required
    - `currency` optional object with `code`, `symbol`, `placement`
    - `timezone` optional
    - `format` optional object with `date`, `time`, `numberLocale`
    - `isDefault` optional
    - `isActive` optional
    - `translations` optional object
  - Response: Created localization document
- `PUT /wme/localization/admin/:id`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Same body as create
  - Response: Updated localization document

### Homepage: `/wme/homepage`

- `GET /wme/homepage/layout`
  - Auth: Public
  - Returns the public homepage layout
- `GET /wme/homepage/admin/layout`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Returns the admin layout view
- `POST /wme/homepage/widget`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Body matches `createUpdateWidgetSchema`
  - Required `widgetType`; supported values include `navigation`, `hero_slider`, `shop_by_category`, `trending_products`, `featured_products`, `flash_sale`, `new_arrival`, `best_selling`, `promotional_banner`, `recommended_products`, `brand_showcase`, `customer_review`, `newsletter`, and `custom_html`
  - Response: Created widget document
- `PUT /wme/homepage/widget/:id`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Same body as create
  - Response: Updated widget document
- `DELETE /wme/homepage/widget/:id`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Response: Success confirmation
- `POST /wme/homepage/reorder`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Body:
    - `widgets` array of `{ id, order }`
  - Response: Success confirmation

### Media: `/wme/media`

- `POST /wme/media/folder`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Body:
    - `name` required
    - `description` optional
  - Response: Created media folder document
- `GET /wme/media/folder`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Response: List of media folders
- `POST /wme/media/upload`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Multipart form data with file field `file`
  - Optional body metadata: `folderId`, `title`, `altText`
  - Response: Created media item document
- `GET /wme/media/library`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Query params: `folderId`, `page`, `limit`
  - Response: Paginated list of media items
- `DELETE /wme/media/:id`
  - Auth: Protected (`admin`, `super_admin`, `manager` roles)
  - Response: Success confirmation

### Notification Templates: `/wme/notification-templates`

- Auth: Protected (`admin`, `super_admin` roles)
- `GET /wme/notification-templates/admin`
  - Response: List of notification templates
- `POST /wme/notification-templates/admin`
  - Body:
    - `name` required
    - `type` required: `email`, `push`, or `sms`
    - `templateGroup` required: `authentication`, `orders`, `products`, `marketing`, `system`, `payment`, or `custom`
    - `eventKey` required
    - `subject` required for email templates
    - `body` required
    - `variables` optional array of strings
    - `isActive` optional
  - Business rule: Updates create a version snapshot in `templateVersion`
  - Response: Created notification template document
- `PUT /wme/notification-templates/admin/:id`
  - Same body as create
  - Response: Updated notification template document
- `DELETE /wme/notification-templates/admin/:id`
  - Response: Success confirmation

## Commerce Admin APIs

### Product Editor: `/admin/products`

This workflow is the main admin editing surface for product curation with change detection and review workflows.

- `GET /admin/products/:productId/edit`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Behavior: Acquires a 15 minute lock for the current admin to prevent concurrent edits
  - Response: `423 Locked` if another user holds an unexpired lock, otherwise returns the product draft data
- `PUT /admin/products/:productId/draft`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Body is the draft payload to merge into the product
  - Uses optimistic concurrency with `__v` when present to prevent overwrites
  - `commitMessage` is optional; defaults to `Manual Draft Save`
  - `source` is immutable and is removed from incoming updates before saving
  - Creates a `ProductRevision` snapshot and a `ProductActivityLog` entry
  - Response: Success confirmation with updated draft data
- `POST /admin/products/:productId/submit-review`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Behavior: Marks the product `pending_review`, sets `changeDetection.needsReview=true`, and records a review note
  - Response: Success confirmation

### Review Queue: `/admin/review-queue`

- `POST /admin/review-queue/:productId/approve`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Business rule: `editorState.qualityScore` must be at least `70` to approve
  - Behavior: Sets the product to `published`, clears dirty/review flags, and logs activity
  - Response: Success confirmation
- `POST /admin/review-queue/:productId/ignore`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Behavior: Clears the review flags and keeps existing live data; if the product is `pending_review`, it is returned to `published` status
  - Response: Success confirmation
- `POST /admin/review-queue/bulk-approve`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Body:
    - `productIds` required array of product IDs
  - Response: Data contains `success`, `failed`, and `errors` counts

### Manual Import: `/admin/manual-import`

- `POST /admin/manual-import/single`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Body:
    - `supplierId` required
    - `productData` required (follows unified product schema)
  - Business rule: The supplier must be configured with `importType=manual` to accept manual imports
  - Behavior: Creates a draft product and calculates the initial quality score
  - Response: Created product document with ID
- `POST /admin/manual-import/bulk`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Body:
    - `supplierId` required
    - `productsArray` required array of product data objects
  - Response: Data contains `success`, `failed`, and `errors` counts

### Suppliers: `/admin/suppliers`

- `GET /admin/suppliers`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Behavior: Returns all configured suppliers; the `apiConfig.headers` field is omitted from the response for security
  - Response: Array of supplier documents (with credentials masked)
- `POST /admin/suppliers/:supplierId/sync`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Business rule: The supplier must exist and must have `importType=api` to initiate sync
  - Behavior: Starts the sync in the background and returns immediately
  - Response: Success confirmation message

### Fulfillment: `/admin/fulfillment`

- `GET /admin/fulfillment/tasks`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Query params:
    - `status` optional filter
    - `page` optional, default 1
    - `limit` optional, default 20
  - Behavior: Default filter returns actionable tasks with statuses `pending_supplier_order`, `ordered_from_supplier`, and `received_at_warehouse`
  - Response: Paginated list of fulfillment tasks
- `PATCH /admin/fulfillment/tasks/:taskId/status`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Body:
    - `status` required (valid transitions enforced in service)
    - `supplierReferenceId` optional, but required when moving to `ordered_from_supplier` status
  - Valid status transitions enforced in service:
    - `pending_supplier_order` -> `ordered_from_supplier`, `supplier_out_of_stock`, `cancelled`
    - `ordered_from_supplier` -> `received_at_warehouse`, `shipped_to_customer`, `cancelled`
    - `received_at_warehouse` -> `shipped_to_customer`
    - `shipped_to_customer` -> `delivered`, `cancelled`
    - `supplier_out_of_stock` -> `cancelled`
  - Response: Updated task document

### Taxonomy: `/admin/taxonomy`

This route is protected and matches the controller's use of `req.user` for role-based access control.

- `POST /admin/taxonomy/categories`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Body follows the Category model:
    - `name` required
    - `slug` required or derived from name
    - `parentId` optional
    - `description` optional
    - `image` optional
    - `icon` optional
    - `status` optional
    - `seo` optional object with `metaTitle` and `metaDescription`
  - Response: Created category document
- `GET /admin/taxonomy/categories`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Response: List of category documents
- `PUT /admin/taxonomy/categories/:id`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Response: Updated category document
- `POST /admin/taxonomy/brands`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Body follows the Brand model:
    - `name` required
    - `slug` required or derived from name
    - `logo` optional
    - `status` optional
    - `seo` optional object with `metaTitle` and `metaDescription`
  - Response: Created brand document
- `GET /admin/taxonomy/brands`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Response: List of brand documents
- `PUT /admin/taxonomy/brands/:id`
  - Auth: Protected (`admin`, `super_admin` roles)
  - Response: Updated brand document

### AI Editor Assistant: `/admin/ai-editor`

- `POST /admin/ai-editor/execute-task`
  - Auth: Protected (requires authentication + admin role)
  - Body:
    - `taskType` required (e.g., 'editor_seo_generate')
    - `productContext` required object with `title`, `description`, and `categoryName`
  - Behavior: Uses the AI Gateway with configured providers to execute the task using template-driven prompts
  - Response: The template-driven AI output; if the template expects JSON, the assistant parses and returns an object; otherwise it returns `{ result: string }`

### AI Providers: `/admin/ai-providers`

- `GET /admin/ai-providers`
  - Auth: Protected (`super_admin` role only)
  - Behavior: Returns all configured AI providers with masked credentials for security
  - Response: Array of AI provider documents (with credentials masked)
- `POST /admin/ai-providers`
  - Auth: Protected (`super_admin` role only)
  - Body:
    - `providerName` required
    - `providerCode` required (unique identifier)
    - `apiVersion` optional
    - `baseUrl` optional but required for OpenAI-compatible providers to function in the gateway
    - `credentials` required object, typically including `apiKey` (will be encrypted)
    - `models` required array with at least one model definition
    - `status` optional: `active`, `inactive`, `maintenance`
    - `isEnabled` optional
    - `priority` optional (for load balancing/failover)
  - Behavior: Encrypts credentials before persistence using AES-256
  - Response: Created AI provider document (with credentials masked)
- `PUT /admin/ai-providers/:id`
  - Auth: Protected (`super_admin` role only)
  - Same body as create
  - Behavior: Updates provider details, invalidates AI provider cache to refresh configuration
  - Response: Updated AI provider document (with credentials masked)

### Notification Preferences: `/notifications/preferences`

- `GET /notifications/preferences`
  - Auth: Protected (authenticated user only)
  - Behavior: Creates a default preferences document if one does not exist for the user
  - Response: Current user notification preferences document
- `PATCH /notifications/preferences`
  - Auth: Protected (authenticated user only)
  - Body:
    - `eventName` required (the event to configure)
    - `channels` required object with channel booleans such as `email`, `push`, and `inApp`
  - Behavior: Merges the channels for the selected event instead of replacing the whole preference document
  - Response: Updated preferences document

## Runtime Notes

- The backend entrypoint is `src/server.js`.
- The repo includes an `npm start` script that runs that file directly.
- The server requires `MONGO_URI` to start successfully.
- `JWT_SECRET` is required for auth middleware functionality.
- Redis, Cloudinary, Resend, and Firebase are optional or feature-dependent, but the associated routes/services will fail gracefully if their environment variables are missing and the feature is used.
- All API responses follow a consistent `ApiResponse` structure with `success`, `data`, `message`, and `statusCode` fields.
- The system implements comprehensive logging via Morgan for HTTP requests and custom logging for business operations and errors.
- Rate limiting is implemented on authentication routes to prevent brute-force attacks.
- The application uses Helmet for security headers and CORS for cross-origin resource sharing configuration based on the `CORS_ORIGIN` environment variable.