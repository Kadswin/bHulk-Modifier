import { App, Modal, Setting } from "obsidian";
import type { AffectedBlock, InsertMethod,  MethodSelection } from "src/utils/types";


export class MethodSelectModal extends Modal {
	private selectedTargets = new Set<AffectedBlock>();
  private selectedMethod: InsertMethod = "after"; // default
  
  constructor(
	  app: App,
		private onSubmit: (method: MethodSelection) => void
	) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;

		const h2 = contentEl.createEl("h2", { text: "Select blocks to modify" });
		h2.addClass("bhulk-header");

		// Create checkboxes for affected blocks
		const regions: AffectedBlock[] = ["frontmatter", "templater"];
		for (const region of regions) {
			const label = contentEl.createEl("label", { text: region });
			label.setAttr("style", "display: block; margin-bottom: 0.5em;");
			const checkbox = contentEl.createEl("input", { type: "checkbox" });
			checkbox.addClass("bhulk-check");
			checkbox.onchange = () => {
				if (checkbox.checked) {
					this.selectedTargets.add(region);
				} else {
					this.selectedTargets.delete(region);
				}
			};
			label.prepend(checkbox);
			contentEl.appendChild(label);
		}

		// Method selection
		//const h2 = 
		contentEl.createEl("h2", { text: "Select insertion method" });
		h2.addClass("bhulk-header");

		const methods: InsertMethod[] = ["before", "after", "overwrite"];
		for (const method of methods) {
			const label = contentEl.createEl("label", { text: method });
      label.addClass("bhulk-label-check");
			const radio = contentEl.createEl("input", { type: "radio" });
			radio.addClass("bhulk-check");
			radio.setAttr("name", "insertMethod");
			radio.checked = method === this.selectedMethod;
			radio.onchange = () => {
				this.selectedMethod = method;
				};
			label.prepend(radio);
			contentEl.appendChild(label);
		}

    // Submit button
    const submitBtn = contentEl.createEl("button", { 
      text: "Confirm", cls: "bhulk-confirm-button" // : activate if spacing issue is present
      });
    submitBtn.onclick = () => {
      this.close();
      this.onSubmit({
        targets: Array.from(this.selectedTargets),
        method: this.selectedMethod
      });
    };
    contentEl.appendChild(submitBtn);
  }

	onClose() {
		this.contentEl.empty();
	}
}
