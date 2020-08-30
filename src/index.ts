import IntlMessageFormat from "intl-messageformat";

interface StringsObject {
	[key: string]: string;
}

interface Messages {
	[locale: string]: StringsObject | object;
}

interface WindowWithTranslator extends Window {
	_?: any;
}

export class Translator {
	locale: string;
	defaultDomain: string | null;
	messages = {} as Messages;

	constructor(locale: string, defaultDomain: string | null = null) {
		this.setLocale(locale);
		this.defaultDomain = defaultDomain;
	}

	setLocale = (locale: string) => {
		this.locale = locale;
	};

	getLocale = (): string => {
		return this.locale;
	};

	hasLocale = (locale: string): boolean => {
		return this.messages.hasOwnProperty(locale);
	};

	load = (locale: string, translations: StringsObject | object) => {
		this.messages[locale] = translations;
	};

	private hasMessage = (messages: StringsObject | object, domain: string, id: string) => {
		if (!domain) {
			if (messages[id] === undefined) {
				return false;
			}
		} else {
			if (messages[domain] === undefined) {
				return false;
			}

			if (messages[domain][id] === undefined) {
				return false;
			}
		}

		return true;
	};

	private extractDomain = (id: string): [string, string] => {
		const split = id.split(".");

		if (split.length === 1) {
			return [this.defaultDomain, id];
		}

		const domain = split.shift();
		return [domain, split.join(".")];
	};

	private getMessage = (id: string, domain: string | null, locale: string): string => {
		if (id === null || id === undefined) {
			return "";
		}

		if (!domain) {
			return this.messages[locale][id];
		}

		return this.messages[locale][domain][id];
	};

	translate = (
		id: string,
		number: number | null = 0,
		parameters = {},
		domain: string | null = null,
		locale: string | null = null
	): string => {
		number = number === null ? 0 : number;
		const _locale = locale ? locale : this.locale;

		let message = id;

		if (this.hasLocale(_locale)) {
			const messages = this.messages[_locale];

			if (!domain) {
				[domain, id] = this.extractDomain(id);
			}

			if (this.hasMessage(messages, domain, id)) {
				message = this.getMessage(id, domain, _locale);
			}
		}

		if (!parameters.hasOwnProperty("count")) {
			parameters["count"] = number;
		}

		message = new IntlMessageFormat(message, _locale).format(parameters) as string;

		return message;
	};

	static register = (window: WindowWithTranslator, translator: Translator) => {
		window._ = (
			id: string,
			number: number,
			parameters: object,
			domain: string | null = null,
			locale: string | null = null
		): string => {
			return translator.translate(id, number, parameters, domain, locale);
		};
	};
}

export function _(
	id: string,
	number: number | undefined = undefined,
	parameters: object = {},
	domain: string | null = null,
	locale: string | null = null
): string {
	return (window as WindowWithTranslator)._(id, number, parameters, domain, locale);
}
