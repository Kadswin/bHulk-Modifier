import ("./styles.css");
import { Notice, Plugin, TFile } from "obsidian";
import { hasFrontmatter, findFrontmatterEnd, hasTemplateR, findTemplateREnd } from "./utils/helpers"; //#1.Keep this Update with modifications

import { readFile } from "fs/promises";
import * as path from "path";

// --- Basic prompt modal
import { PromptModal } from "./modals/PromptModal";
// --- Confirmation modal
//#2. if new modals, import { NewModal } from "./modals/NewModal"  
import { MethodSelectModal } from "./modals/MethodSelectModal";
import { ConfirmModal } from "./modals/ConfirmModal";
import { FileExcludeSuggestModal } from "./modals/FileExcludeSuggestModal";
import { FolderSelectModal } from "./modals/FolderSelectModal";

export default class bHulkModifier extends Plugin {
	private styleEl: HTMLStyleElement | null = null;
	
	/** Returns the full path to the plugin's folder */
	private getPluginFilePath(relativePath: string): string {
		return path.join(this.manifest.dir, relativePath);
	}

	/** Loads the CSS file as a string */
	async loadStyles(): Promise<string> {
		const fullPath = this.getPluginFilePath("styles.css");
		return await readFile(fullPath, "utf8");
	}

	async onload() {
		// Inject plugin-specific CSS for confirm button margin
		const css = await this.loadStyles();
		this.styleEl = document.createElement("style");
		this.styleEl.textContent = css;
		document.head.appendChild(this.styleEl); 

		this.addCommand({
			id: "hulk-bulk-insert-template",
			name: "Hulk: Bulk Insert Template",
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

					await this.processFile(file, templateContent);
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

	onunload() {
		// Remove injected style when plugin unloads
		if (this.styleEl && this.styleEl.parentElement) {
			this.styleEl.parentElement.removeChild(this.styleEl);
		}
		this.styleEl = null;
	}

	async processFile(file: TFile, template: string) {
		const content = await this.app.vault.read(file);

//# 5.here is where I should place the new logic? 

		if (hasFrontmatter(content)) {
			const insertPos = findFrontmatterEnd(content);
			const newContent =
				content.slice(0, insertPos) + "\n" + template + "\n" + content.slice(insertPos);
			await this.app.vault.modify(file, newContent);
		} else {
			const newContent = template + "\n\n" + content;
			await this.app.vault.modify(file, newContent);
		}
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