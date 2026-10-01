import { menuItems } from "./menu";
import { viMenuItems, viMenuNotes } from "./menu-vi";

export const locations = [
  {
    id: "ibadan",
    name: "Ibadan",
    city: "Ibadan",
    neighborhood: "Iyaganku GRA",
    address: "1 Oba Aleshinloye Crescent",
    tagline: "Good food. Warm company. A little escape.",
    instagram: "https://www.instagram.com/tamberma_ibadan/",
    whatsapp: "https://wa.me/2348075590939",
    phone: "+234 807 559 0939",
    phoneHref: "tel:+2348075590939",
    directions:
      "https://www.google.com/maps/search/?api=1&query=Tamberma+Restaurant+Bar+1+Oba+Aleshinloye+Crescent+Iyaganku+Ibadan",
    glovo:
      "https://glovoapp.com/en/ng/ringroad-ibadan-challenge/stores/tamberma-ibadan-rch",
    foodPdf: "/menus/tamberma-food.pdf",
    drinksPdf: "/menus/tamberma-drinks.pdf",
    menuItems,
    menuNote: "Prices exclude 7.5% VAT.",
    hours: null,
  },
  {
    id: "victoria-island",
    name: "Victoria Island",
    city: "Lagos",
    neighborhood: "Victoria Island",
    address: "23A Saka Tinubu Street",
    tagline: "Your little escape in the heart of Lagos.",
    instagram: "https://www.instagram.com/tamberma.vi/",
    // WhatsApp is the current bio-linked Linktree destination. The reservation
    // telephone is separately published by @tamberma.vi on 16 September 2026.
    whatsapp: "https://wa.me/2347059773758",
    phone: "+234 807 559 2227",
    phoneHref: "tel:+2348075592227",
    directions:
      "https://www.google.com/maps/search/?api=1&query=Tamberma+23A+Saka+Tinubu+Street+Victoria+Island+Lagos",
    glovo: "https://glovoapp.com/ng/en/lagos/tamberma-restaurant-bar-los/",
    foodPdf: "/menus/tamberma-vi-food.pdf",
    drinksPdf: "/menus/tamberma-vi-drinks.pdf",
    menuItems: viMenuItems,
    menuNote: viMenuNotes,
    hours: "Mon–Thu: 11am–11pm · Fri–Sun: 8am–11pm",
  },
];

export const locationById = Object.fromEntries(
  locations.map((location) => [location.id, location]),
);
export const LOCATION_STORAGE_KEY = "tamberma.location";

export function readLocation() {
  const query = new URLSearchParams(window.location.search).get("location");
  if (Object.hasOwn(locationById, query)) return locationById[query];
  try {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    return Object.hasOwn(locationById, saved) ? locationById[saved] : null;
  } catch {
    return null;
  }
}
