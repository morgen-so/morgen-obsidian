import { MarkdownPostProcessor } from 'obsidian';
import { MorgenPluginSettings } from 'settings';

const taskIdRegex = /[a-zA-Z0-9-_]+/;
const IDRegex = new RegExp('🆔 *(' + taskIdRegex.source + ')', 'iu');

interface PostProcessor {
	postProcess: MarkdownPostProcessor;
}

export class MorgenTasksPostProcessor implements PostProcessor {
	private settings: MorgenPluginSettings;

	constructor(settings: MorgenPluginSettings) {
		this.settings = settings;
	}

	postProcess(element: HTMLElement) {
		if (this.settings.decorateIDs === 'show') return;

		const getReplacement = (id: string) => {
			switch (this.settings.decorateIDs) {
				case 'replace_with_emoji':
					return element.createSpan({
						text: '▫️',
						title: id,
					});
				default:
					return null;
			}
		};

		const elementsWithIds: [HTMLElement, RegExpMatchArray][] = element
			.findAll('p, span, li')
			.map((container): [HTMLElement, RegExpMatchArray | null] => [
				container,
				container.innerText.match(IDRegex),
			])
			.filter((args) => args[1]) as [HTMLElement, RegExpMatchArray][];

		for (const [el, match] of elementsWithIds) {
			if (
				// Task is rendered by the Tasks plugin by a query block. If
				// the ID isn't the last item in the text, it will sometimes
				// fail to give the ID its own span (which would normally be
				// replaced by style.css). This is a work-around for that.
				el.parentElement?.parentElement?.parentElement?.hasClass('tasks-list-text') ||
				// Task is rendered inline by the Kanban plugin, which means
				// the ID is present in an element containing the rest of the
				// task description.
				el.parentElement?.hasClass('kanban-plugin__markdown-preview-view')
			) {
				const [before, after] = el.innerText.split(match[0]);
				const replacement = getReplacement(match[0]);

				const replacementElement = element.createEl(
					el.tagName as keyof HTMLElementTagNameMap,
				);
				replacementElement.className = el.className;
				replacementElement.appendText(before);
				if (replacement) {
					replacementElement.appendChild(replacement);
				}
				replacementElement.appendText(after);
				el.replaceWith(replacementElement);
			}
		}
	}
}
