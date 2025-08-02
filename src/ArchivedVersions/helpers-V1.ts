export function hasFrontmatter(content: string): boolean {
	return hasDelimitedBlock(content, "---");
}

export function findFrontmatterStart(content: string): number {
	const regex = new RegExp(`${escape("---")}\\n`);
	const match = content.match(regex);
	return match ? match.index ?? -1 : -1;
}

export function findFrontmatterEnd(content: string): number {
	return findDelimitedBlockEnd(content, "---");
}

export function hasTemplateR(content: string): boolean {
	return hasDelimitedBlock(content, "<%");
}

export function findTemplateRStart(content: string): number {
	const regex = new RegExp(`${escape("<%")}\\n`);
	const match = content.match(regex);
	return match ? match.index ?? -1 : -1;
}

export function findTemplateREnd(content: string): number {
	return findDelimitedBlockEnd(content, "%>");
}

function hasDelimitedBlock(content: string, delimiter: string): boolean {
	const regex = new RegExp(`${escape(delimiter)}\\n[\\s\\S]*?\\n${escape(delimiter)}\\n`);
	return regex.test(content);
}

function findDelimitedBlockEnd(content: string, delimiter: string): number {
	const regex = new RegExp(`${escape(delimiter)}\\n[\\s\\S]*?\\n${escape(delimiter)}\\n`);
	const match = content.match(regex);
	return match ? match[0].length : -1;
}

function escape(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
