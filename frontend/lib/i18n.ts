import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import bm from "@/locales/bm.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bm: { translation: bm },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
