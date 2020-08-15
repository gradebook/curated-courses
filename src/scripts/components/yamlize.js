export function yamlize(object, depth = 0) {
	const spaces = ' '.repeat(depth * 4);
	let finalOutput = '';

	if (object.version) {
		finalOutput += `${spaces}version: ${object.version}\n`;
		delete object.version;
	}

	for (let [key, value] of Object.entries(object)) {
		if (Array.isArray(value)) {
			finalOutput += `${spaces}${key}:\n`;
			for (const child of value) {
				finalOutput += `${spaces}-\n`;
				finalOutput += yamlize(child, depth + 1);
			}

			continue;
		} else if (typeof value === 'object') {
			value = '\n' + spaces + yamlize(value, depth + 1);
		} else if (typeof value === 'string') {
			value = `"${value.replace(/"/g, '\\"')}"`;
		}

		finalOutput += `${spaces}${key}: ${value}\n`;
	}

	return finalOutput;
}
