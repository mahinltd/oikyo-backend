/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

class DynamicMappingResolver {
	resolveField(source, path) {
		if (!source || !path) return null;

		const segments = String(path).split('.');
		let current = source;

		for (const segment of segments) {
			if (current === null || current === undefined) return null;
			current = current instanceof Map ? current.get(segment) : current[segment];
		}

		return current === undefined ? null : current;
	}

	resolveArray(source, path) {
		const value = this.resolveField(source, path);
		return Array.isArray(value) ? value : [];
	}
}

module.exports = new DynamicMappingResolver();
