import { Notice, Plugin, TFile } from "obsidian";
import { hasFrontmatter, findFrontmatterStart, findFrontmatterEnd, hasTemplateR, findTemplateRStart , findTemplateREnd } from "./utils/helpers"; //#1.Keep this Update with modifications
import { InsertMethod, AffectedBlock, MethodSelection } from "./utils/types"; // Assuming you have a types file for these enums

// --- Basic prompt modal
import { PromptModal } from "./modals/PromptModal";
// --- Confirmation modal
//#2. if new modals, import { NewModal } from "./modals/NewModal"  
import { MethodSelectModal } from "./modals/MethodSelectModal";
import { ConfirmModal } from "./modals/ConfirmModal";
import { FileExcludeSuggestModal } from "./modals/FileExcludeSuggestModal";
import { FolderSelectModal } from "./modals/FolderSelectModal";

export default class bHulkModifier extends Plugin {
	async onload() {
		this.addCommand({
			id: "hulk-bulk-insert-template",
			name: "Hulk: Bulk Insert Current Template",
			callback: async () => {
				const templateFile = this.app.workspace.getActiveFile();
				if (!templateFile) {
					new Notice("⚠️ Open a template note first!");
					return;
				}

				// Read template content
				const templateContent = await this.app.vault.read(templateFile); //# 3.should accept empty files with titles as valid entries and content to use

				// Confirm vault backup
				const confirmed = await this.confirmModal("Have you backed up your vault?");
				if (!confirmed) return;

//# 4.Add confirm method here?
				// Prompt for method and target selection using MethodSelectModal
				const methodSelection = await new Promise<MethodSelection>((resolve) => {
					new MethodSelectModal(this.app, (result) => resolve(result)).open();
				});

				if (!methodSelection) {
					new Notice("⚠️ No method selected, aborting.");
					return;
				}

				// Prompt user to select folders
				const selectedFolders: string[] = await this.promptFolders();

				// Prompt for file exclusions
				const excludeFilenames = await this.promptExcludeFiles();


				// Get all .md files
				const allFiles = this.app.vault.getMarkdownFiles();

				let processed = 0;
				for (const file of allFiles) {
					// Skip excluded folders
					if (
						selectedFolders.length > 0 &&
						!selectedFolders.some((folder) => file.path.startsWith(folder))
					)
						continue;

					// Skip excluded filenames
					if (
						excludeFilenames.some(
							(name) => name.toLowerCase() === file.name.toLowerCase()
						)
					)
						continue;

					await this.processFile(file, templateContent, methodSelection.method, methodSelection.targets);
					processed++;
				}

				new Notice(`✅ Hulk_Happy Mod executed on ${processed} notes.`);
			},
		});
		//isolate testing of MethodSelectModal
		this.addCommand({
		id: "test-method-select-modal",
		name: "Test MethodSelectModal",
		callback: () => {
			new MethodSelectModal(this.app, (result) => {
				console.log("Modal result:", result);
				new Notice(`Selected: ${result.targets.join(", ")} / ${result.method}`);
			}).open();
	},
});

	}

	onunload(): void {

	}

	async processFile(file: TFile, template: string, method: InsertMethod, targets: AffectedBlock[]) {
	const content = await this.app.vault.read(file);
	let newContent = content;

		for (const target of targets) {
			let start = 0;
			let end = 0;
			let hasBlock = false;

			if (target === "frontmatter") {
				hasBlock = hasFrontmatter(content);
				start = findFrontmatterStart(content);
				end = findFrontmatterEnd(content);
			} else if (target === "templater") {
				hasBlock = hasTemplateR(content);
				start = findTemplateRStart(content);
				end = findTemplateREnd(content);
			}

console.log("Target:", target, "Has block?", hasBlock, "Start:", start, "End:", end);
			if (!hasBlock) {
				// If block not found, fallback logic depending on method
				if (method === "before" || method === "overwrite") {
					newContent = template + "\n\n" + newContent;
				} else if (method === "after") {
					newContent = newContent + "\n\n" + template;
				}
				continue;
			}

			switch (method) {
				case "before":
					newContent = newContent.slice(0, start) + template + "\n" + newContent.slice(start);
					break;
				case "after":
					newContent = newContent.slice(0, end) + "\n" + template + newContent.slice(end);
					break;
				case "overwrite":
					newContent = newContent.slice(0, start) + template + newContent.slice(end);
					break;
			}
}


	await this.app.vault.modify(file, newContent);
}


	async promptUser(promptText: string, placeholder: string = ""): Promise<string> {
		return new Promise((resolve) => {
			new PromptModal(this.app, promptText, placeholder, resolve).open();
		});
	}

	async confirmModal(message: string): Promise<boolean> {
		return new Promise((resolve) => {
			new ConfirmModal(this.app, message, resolve).open();
		});
	}

	async promptExcludeFiles(): Promise<string[]> {
		return new Promise((resolve) => {
			new FileExcludeSuggestModal(this.app, resolve).open();
		});
	}

	async promptFolders(): Promise<string[]> {
		return new Promise((resolve) => {
			new FolderSelectModal(this.app, resolve).open();
		});
	}
}
