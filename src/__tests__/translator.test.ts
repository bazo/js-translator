import { Translator } from "../";
import IntlMessageFormat from "intl-messageformat";

describe("test", () => {
	const message = `{name}, You have {count, plural,
		=0 {no photos.}
		=1 {one photo.}
		other {# photos.}
	  }`;

	const expected = "Martin, You have 5 photos.";
	const count = 5;

	const params = { name: "Martin" };

	test("message format with IntlMessageFormat", () => {
		const trans = new IntlMessageFormat(message, "en").format({ ...params, count });
		expect(trans).toEqual(expected);
	});

	test("message format with Translator", () => {
		const translator = new Translator("en");
		const trans = translator.translate(message, count, params);
		expect(trans).toEqual(expected);
	});
});

const langs = ["en", "sk"];

const translations = {
	en: {
		test1: "TEST1 in English",
		test2: "{what} in English",
		test3: `{name}, You have {count, plural,
			=0 {no photos.}
			=1 {one photo.}
			other {# photos.}
		  }`,
		test4: `{count, plural,
			=0 {There are no apples}
			=1 {There is one apple}
			other {There are # apples}
		  }.`,
	},
	sk: {
		test1: "TEST1 v Slovencine",
		test2: "{what} v Slovencine",
		test3: `{name}, mas {count, plural,
			=0 {nula fotiek}
			=1 {jednu fotku}
			other {{count} foteciek}
		  }.`,
		  test4: `{count, plural,
			=0 {Jablka nie su}
			=1 {Je jedno jablko}
			other {Je # jablk}
		  }.`,
	},
};

const data = [
	{ id: "test1", en: translations.en.test1, sk: translations.sk.test1, count: null as number, params: {} },
	{
		id: "test2",
		en: "TEST2 in English",
		sk: "TEST2 v Slovencine",
		count: null as number,
		params: { what: "TEST2" },
	},

	{
		id: "test3",
		en: "Martin, You have no photos.",
		sk: "Martin, mas nula fotiek.",
		count: 0,
		params: { name: "Martin" },
	},
	{
		id: "test3",
		en: "Martin, You have one photo.",
		sk: "Martin, mas jednu fotku.",
		count: 1,
		params: { name: "Martin" },
	},

	{
		id: "test3",
		en: "Martin, You have 5 photos.",
		sk: "Martin, mas 5 foteciek.",
		count: 5,
		params: { count: 5, name: "Martin" },
	},

	{
		id: "test4",
		en: "There are no apples.",
		sk: "Jablka nie su.",
		count: null as number,
		params: {},
	},
	{
		id: "test4",
		en: "There is one apple.",
		sk: "Je jedno jablko.",
		count: 1,
		params: {},
	},
	{
		id: "test4",
		en: "There are 5 apples.",
		sk: "Je 5 jablk.",
		count: 5,
		params: {},
	},
];

const addToString = (locale: string) => (data) =>
	Object.assign(data, {
		toString: function () {
			return `${this.id} in ${locale} === ${this[locale]}${this.count ? ` with count = ${this.count}` : ""}${
				Object.keys(this.params).length > 0 ? ` with params ${JSON.stringify(this.params)}` : ""
			}`;
		},
	});

describe.each(langs)("Translator with locale %s", (locale: string) => {
	test(`correctly sets locale ${locale}`, () => {
		const translator = new Translator(locale);
		expect(translator.getLocale()).toEqual(locale);
	});

	test.each(data.map(addToString(locale)))("translate %s", ({ id, count, params, ...strings }) => {
		const translator = new Translator(locale);
		translator.load(locale, translations[locale]);

		expect(translator.translate(id, count, params)).toEqual(strings[locale]);
	});
});
