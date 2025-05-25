import { en } from "./locales/en.ts";
import { fr } from "./locales/fr.ts";

const resources = {
  en,
  fr,
};

export function getTranslationFunction(lang: "en" | "fr") {
  return (key: string, params?: Record<string, string>) => {
    const keys = key.split(".");
    let value: unknown = resources[lang];

    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }

    if (typeof value !== "string") return key;

    if (params) {
      return value.replace(
        /\{\{(\w+)\}\}/g,
        (match, param) => params[param] || match,
      );
    }

    return value;
  };
}
