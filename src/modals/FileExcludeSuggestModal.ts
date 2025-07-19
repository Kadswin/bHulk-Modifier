import { SuggestModal, TFile, App, Notice } from "obsidian";
import { ConfirmModal } from "./ConfirmModal";

// --- Modal for selecting files to exclude
export class FileExcludeSuggestModal extends SuggestModal<TFile> {
	private selectedFiles: Set<string> = new Set();
	private resolveFn: (filenames: string[]) => void;

	constructor(app: App, resolve: (filenames: string[]) => void) {
		super(app);
		this.setPlaceholder("Type to search files to exclude…");
		this.resolveFn = resolve;
	}

	getSuggestions(query: string): TFile[] {
		const allFiles = this.app.vault.getMarkdownFiles();
		return allFiles.filter((f: TFile) => f.name.toLowerCase().includes(query.toLowerCase())
		);
	}

	renderSuggestion(file: TFile, el: HTMLElement) {
		el.createEl("div", { text: file.path });
	}

	onChooseSuggestion(file: TFile, evt: MouseEvent | KeyboardEvent) {
		if (this.selectedFiles.has(file.name)) {
			new Notice(`❌ Removed from exclusion: ${file.name}`);
			this.selectedFiles.delete(file.name);
		} else {
			new Notice(`✅ Exclude: ${file.name}`);
			this.selectedFiles.add(file.name);
		}
	}

	onClose() {
		// Final confirmation
		const confirmModal = new ConfirmModal(this.app, "Done selecting files to exclude?", 
			(ok: boolean) => {
			if (ok) {
				this.resolveFn(Array.from(this.selectedFiles));
			} else {
				this.resolveFn([]);
			}
		});
		confirmModal.open();
	}
}
