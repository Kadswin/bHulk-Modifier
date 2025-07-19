import { Modal, App } from "obsidian";

export class FolderSelectModal extends Modal {
	private folders: Set<string>;
	private selected: Set<string>;
	private resolveFn: (folders: string[]) => void;
	private folderCheckboxes: { folder: string; checkbox: HTMLInputElement }[] = [];

	constructor(app: App, resolve: (folders: string[]) => void) {
		super(app);
		this.resolveFn = resolve;

		const allFiles = app.vault.getMarkdownFiles();
		const folderList = allFiles
			.map(f => f.path.split("/").slice(0, -1).join("/"))
			.filter(f => f !== "") // remove empty paths for now (we'll re-add root later)
			.sort((a, b) => a.localeCompare(b)); // alphabetical A-Z

		// Create a unique set of folders
		this.folders = new Set(folderList);
		if (allFiles.some(f => !f.path.includes("/"))) {
			this.folders.add(""); // manually re-add root ("/") if it had files directly
		}

		// Initialize selected folders
		this.selected = new Set();
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h3", { text: "Select folders to include in the bulk mod:" });

		this.folders.forEach(folder => {
			const div = contentEl.createDiv("folder-option");

			const depth = folder === "" ? 0 : folder.split("/").length;
			const checkbox = div.createEl("input", { type: "checkbox" });
			checkbox.addClass("bhulk-check");
			const label = div.createEl("label", { text: folder || "/" });
			label.setAttr("style", `margin-left: ${depth * 10}px;`);

			checkbox.onchange = () => {
				if (checkbox.checked) {
					this.selected.add(folder);
				} else {
					this.selected.delete(folder);
				}
			};

			div.appendChild(label);

			this.folderCheckboxes.push({ folder, checkbox });
		});
		
		const buttonContainer = contentEl.createDiv({ cls: "folder-select-buttons" });
		buttonContainer.setAttr("style", "margin-top: 1em; display: flex; gap: 0.5em;");

		const btnStyle = "flex: 1 1 0; max-width: 80px;";

		const selectAllBtn = buttonContainer.createEl("button", { text: "Select All" });
		selectAllBtn.setAttr("style", btnStyle);
		selectAllBtn.onclick = () => {
			this.folderCheckboxes.forEach(({ folder, checkbox }) => {
				checkbox.checked = true;
				this.selected.add(folder);
			});
		};

		const clearAllBtn = buttonContainer.createEl("button", { text: "Clear All" });
		clearAllBtn.setAttr("style", btnStyle);
		clearAllBtn.onclick = () => {
			this.folderCheckboxes.forEach(({ folder, checkbox }) => {
						checkbox.checked = false;
						this.selected.delete(folder);
					});
		};
		
		const toggleBtn = buttonContainer.createEl("button", { text: "Toggle" });
		toggleBtn.setAttr("style", btnStyle);
		toggleBtn.onclick = () => {
			this.folderCheckboxes.forEach(({ folder, checkbox }) => {
				const newState = !checkbox.checked;
				checkbox.checked = newState;
				if (newState) {
					this.selected.add(folder);
				} else {
					this.selected.delete(folder);
				}
			});
		};

		const submitBtn = contentEl.createEl("button", { 
				text: "Confirm", 
				cls: "bhulk-confirm-button" 
		});
		
		submitBtn.onclick = () => {
			this.close();
			this.resolveFn(Array.from(this.selected));
		};
	}

	onClose() {
		this.contentEl.empty();
	}
}
