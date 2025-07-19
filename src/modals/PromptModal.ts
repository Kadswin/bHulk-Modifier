import { App, Modal } from "obsidian";
export class PromptModal extends Modal {
    constructor(
        app: App,
        private promptText: string,
        private placeholder: string,
        private onSubmit: (input: string) => void
    ) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h3", { text: this.promptText });

        const inputEl = contentEl.createEl("input", {
            type: "text",
            placeholder: this.placeholder
        });

        inputEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.onSubmit(inputEl.value);
                this.close();
            }
        });

        inputEl.focus();
    }

    onClose() {
        this.contentEl.empty();
    }
}