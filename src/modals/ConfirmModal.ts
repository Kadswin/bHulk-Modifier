import { App, Modal } from "obsidian";

export class ConfirmModal extends Modal {
    constructor(
        app: App,
        private message: string,
        private onConfirm: (result: boolean) => void
    ) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h3", { text: this.message });

        const btnYes = contentEl.createEl("button", { text: "Yes" });
        const btnNo = contentEl.createEl("button", { text: "No" });

        btnYes.onclick = () => {
            this.onConfirm(true);
            this.close();
        };
        btnNo.onclick = () => {
            this.onConfirm(false);
            this.close();
        };
    }

    onClose() {
        this.contentEl.empty();
    }
}