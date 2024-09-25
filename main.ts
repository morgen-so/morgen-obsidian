import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

import { hideIDsExtension } from 'extension';

import { MorgenTasksPostProcessor } from 'postProcessor';
import { MorgenPluginSettings } from 'settings';

const DEFAULT_SETTINGS: MorgenPluginSettings = {
	decorateIDs: 'show',
};

export default class MorgenPlugin extends Plugin {
	settings: MorgenPluginSettings;
	postProcessor: MorgenTasksPostProcessor;

	async onload() {
		await this.loadSettings();

		/*
		 * Explanation of how the ID hiding works:
		 *
		 * There are two modes to consider:
		 *  - editing mode (handled entirely by a CodeMirror Editor extension (hideIDsExtension)
		 *  - reading mode
		 *    - read-only view, which can be enabled whilst viewing any note in Obsidian
		 *    - also enabled for cards visible in the Kanban plugin board view
		 *
		 * Editing mode: see extension.ts. This is a CodeMirror extension that
		 * uses a decorator to effectively replace any text that matches the ID
		 * Regex with an emoji or nil. This is the one that gets a nicer
		 * tooltip on hover.
		 *
		 * Reading mode: A lot of the work is done by style.css, which hides
		 * elements by matching the appropriate elements created by markdown
		 * post-processing that already happened in the Kanban and Tasks
		 * plugins. There are some cases where task IDs do not have an obvious
		 * containing span element that can be easily replaced/hidden. These
		 * are handled by the MorgenTasksPostProcessor:
		 *   - Tasks plugin has a bug that causes IDs that have text after them
		 *     in the line to NOT get a container span, which is normally handled
		 *     by the style.css rules
		 *   - Kanban plugin by default shows tasks in "inline" mode, which is
		 *     an alternative to "Move task data to card footer". It does not
		 *     wrap the ID in a containing span.
		 */
		this.registerEditorExtension(hideIDsExtension(this.settings));
		this.postProcessor = new MorgenTasksPostProcessor(this.settings);
		this.registerMarkdownPostProcessor((element) => {
			try {
				this.postProcessor.postProcess(element);
			} catch (e: unknown) {
				console.error('MorgenPlugin: Error whilst post processing markdown', e);
			}
		});

		this.addSettingTab(new MorgenSettingTab(this.app, this));
	}

	onunload() {}

	async updateSettings(update: Partial<MorgenPluginSettings>) {
		Object.assign(this.settings, update);
		document.documentElement.style.setProperty(
			'--morgen-tasks-decorate-ids',
			this.settings.decorateIDs,
		);
		return this.saveSettings();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		document.documentElement.style.setProperty(
			'--morgen-tasks-decorate-ids',
			this.settings.decorateIDs,
		);
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
