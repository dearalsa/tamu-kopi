import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    id: {
      translation: {
        home: "Beranda",
        menu: "Menu",
        about: "Tentang",
        contact: "Kontak",
      }
    },
    en: {
      translation: {
        home: "Home",
        menu: "Menu",
        about: "About",
        contact: "Contact",
      }
    }
  },
  lng: "id",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
