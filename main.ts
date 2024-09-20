import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

import { hideIDsExtension } from 'extension';

interface MorgenPluginSettings {
	decorateIDs: 'show' | 'hide' | 'replace_with_emoji';
}

const DEFAULT_SETTINGS: MorgenPluginSettings = {
	decorateIDs: 'show',
};

export default class MorgenPlugin extends Plugin {
	settings: MorgenPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerEditorExtension(hideIDsExtension(this.settings));

		this.addSettingTab(new MorgenSettingTab(this.app, this));
	}

	onunload() {}

	async updateSettings(update: Partial<MorgenPluginSettings>) {
		Object.assign(this.settings, update);
		return this.saveSettings();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class MorgenSettingTab extends PluginSettingTab {
	plugin: MorgenPlugin;

	constructor(app: App, plugin: MorgenPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Enabled task ID hiding')
			.setDesc('Hide all IDs in your note to reduce noise')
			.addDropdown((component) => {
				component
					.addOptions({
						replace_with_emoji: 'Replace with emoji',
						hide: 'Hide completely',
						show: 'Show IDs',
					})
					.setValue(this.plugin.settings.decorateIDs)
					.onChange((value: typeof this.plugin.settings.decorateIDs) =>
						this.plugin.updateSettings({ decorateIDs: value }),
					);
			});
	}
}
