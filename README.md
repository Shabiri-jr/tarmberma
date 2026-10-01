# Tamberma — A little escape in Ibadan and Lagos

An independent, immersive 3D website pitch for Tamberma Restaurant & Bar. React, Vite, Three.js and React Three Fiber power a continuous garden restaurant environment.

## Run

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. Production: `npm run build`, then `npm run preview`. The output is a static website in `dist/`; no backend or API key is required.

## Experience

- Visitors choose Ibadan or Victoria Island. A visible location switch changes menus, tax notes, PDF downloads, directions, Instagram, Glovo and table-enquiry contacts together. The selected location is remembered locally and can be shared using `?location=ibadan` or `?location=victoria-island`.
- Native scrolling drives one camera through five views of the same courtyard: welcome, garden, table, bar, and dusk.
- Real geometry includes arches, pergola, palms, planted borders, rattan chairs, tableware, pizza, cocktails, and bottle shelves. Light and sky change toward evening.
- Click numbered chapters to travel directly. Scene hotspots open food and drinks. Look around enables orbit and zoom; Return to journey resumes the guided camera.
- A gentle breeze sways palms and foliage with matching shadows. The renderer pauses behind dialogs and in hidden tabs, and rests when reduced motion disables the breeze. Static environment geometry remains batched by material.
- Licensed jazz ambience starts with Play jazz, with pause, volume, and music-credit controls. The five-minute local MP3 loops and is only requested after playback is selected; playback pauses in hidden tabs. Attribution is in the Music credits dialog and `public/audio/ATTRIBUTION.txt`.
- Reduced motion uses immediate chapter views. A locally rendered still replaces the scene if WebGL is unavailable. No-JavaScript visitors retain PDF and contact links.
- 54 Ibadan and 40 Victoria Island menu selections, category filters, variants, branch-specific tax notes and four complete source PDFs. The VI source menus list 7.5% VAT and 5% consumption tax as extra; Ibadan source menus list 7.5% VAT as extra.
- Table enquiry validates Nigeria date/time, preserves edited drafts, and prepares a WhatsApp link for review. It does not send or store messages.
- Responsive native dialogs, keyboard access, focus restoration, and directions/Instagram/Glovo links.

## Main files

| File                                  | Purpose                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| `src/App.jsx`                         | Journey interface, navigation, menus, enquiries and visit information           |
| `src/experience.css`                  | Full-screen scene interface and responsive composition                          |
| `src/styles.css`                      | Shared controls and dialog styles                                               |
| `src/components/VenueScene.jsx`       | Camera journey, lighting, orbit controls, scene hotspots and rendering fallback |
| `src/components/VenueEnvironment.jsx` | Batched architectural and garden geometry                                       |
| `src/components/DiningDetails.jsx`    | Tableware, food, drinks and tabletop details                                    |
| `src/data/menu.js`                    | Menu selections transcribed from supplied PDFs                                  |
| `src/data/menu-vi.js`                 | Victoria Island selections checked against its bio-linked PDFs                  |
| `src/data/locations.js`               | Separate branch contacts, menus and directions                                  |
| `public/images/venue-preview.jpg`     | Still rendered from this 3D concept for loading and fallback                    |
| `public/menus/`                       | Original PDFs, loaded only on request                                           |

## Concept status

The courtyard is an artistic interpretation, not an exact reconstruction or surveyed digital twin of Tamberma. Business research and source analysis are summarized in `Tamberma-Research-and-3D-Website-Pitch.md`. Working research files and verification screenshots are kept locally and excluded from Git.

Both branches share the illustrative 3D experience. It is not a measured reconstruction of either venue. The VI address and reservation telephone were checked against [its September 16, 2026 Instagram post](https://www.instagram.com/tamberma.vi/p/DdWVlrSscgW/); its WhatsApp, menu PDFs and Glovo destination come from the [VI bio-linked Linktree](https://linktr.ee/tambermavi). Its published reservation phone and WhatsApp destination differ and are intentionally kept separate.

This pitch retains `noindex, nofollow` metadata. The restaurant should approve branding, venue representation, imagery, prices, and business details before publication. Ibadan opening hours are referred to the team because public listings conflict; Victoria Island hours follow its current Instagram bio. Reference food photography comes from the older [Tamberma website](https://tamberma.netlify.app/) and appears only in the Ibadan experience; its current ownership and image rights are unconfirmed. Table enquiries prepare a message for visitors to review and send themselves.
