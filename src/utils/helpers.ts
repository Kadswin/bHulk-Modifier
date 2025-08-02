export function hasFrontmatter(content: string): boolean {
	return getDelimitedBlock(content, "---") !== null;
}

export function hasTemplateR(content: string): boolean {
	return getDelimitedBlock(content, "<%") !== null;
}

export function findFrontmatterRange(content: string): [number, number] | null {
	return getDelimitedBlock(content, "---");
}

export function findTemplateRRange(content: string): [number, number] | null {
	return getDelimitedBlock(content, "<%");
}

// Generalized block finder
function getDelimitedBlock(content: string, delimiter: string): [number, number] | null {
	const escaped = escape(delimiter);
	const regex = new RegExp(`${escaped}\\s*\\n[\\s\\S]*?\\n\\s*${escaped}`, "gm");
	const match = regex.exec(content);
	if (!match) return null;
	const start = match.index;
	const end = start + match[0].length;
	return [start, end];
}

function escape(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
