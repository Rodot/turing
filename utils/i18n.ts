import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../locales/en/common.json";
import fr from "../locales/fr/common.json";

const resources = {
  en: {
    common: en,
  },
  fr: {
    common: fr,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    defaultNS: "common",

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    // Disable loading resources dynamically since we're doing a static build
    load: "languageOnly",
    cleanCode: true,
  });

export default i18n;
