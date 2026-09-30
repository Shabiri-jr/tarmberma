# Tamberma — A little escape in Ibadan

An independent, immersive 3D website pitch for Tamberma Restaurant & Bar. React, Vite, Three.js and React Three Fiber power a continuous garden restaurant environment.

## Run

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. Production: `npm run build`, then `npm run preview`. The output is a static website in `dist/`; no backend or API key is required.

## Experience

- Native scrolling drives one camera through five views of the same courtyard: welcome, garden, table, bar, and dusk.
- Real geometry includes arches, pergola, palms, planted borders, rattan chairs, tableware, pizza, cocktails, and bottle shelves. Light and sky change toward evening.
- Click numbered chapters to travel directly. Scene hotspots open food and drinks. Look around enables orbit and zoom; Return to journey resumes the guided camera.
- A gentle breeze sways palms and foliage with matching shadows. The renderer pauses behind dialogs and in hidden tabs, and rests when reduced motion disables the breeze. Static environment geometry remains batched by material.
- Licensed jazz ambience starts with Play jazz, with pause, volume, and music-credit controls. The five-minute local MP3 loops and is only requested after playback is selected; playback pauses in hidden tabs. Attribution is in the About dialog and `public/audio/ATTRIBUTION.txt`.
- Reduced motion uses immediate chapter views. A locally rendered still replaces the scene if WebGL is unavailable. No-JavaScript visitors retain PDF and contact links.
- 54 searchable menu selections, category filters, size variants, VAT note, and both complete source PDFs.
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
| `public/images/venue-preview.jpg`     | Still rendered from this 3D concept for loading and fallback                    |
| `public/menus/`                       | Original PDFs, loaded only on request                                           |

## Concept status

The courtyard is an artistic interpretation, not an exact reconstruction or surveyed digital twin of Tamberma. Business research and source analysis are summarized in `Tamberma-Research-and-3D-Website-Pitch.md`. Working research files and verification screenshots are kept locally and excluded from Git.

This remains a local pitch with `noindex, nofollow` metadata. The restaurant should approve branding, venue representation, imagery, prices, and business details before publication. Opening hours are referred to the team because public listings conflict. Reference food photography comes from the older [Tamberma website](https://tamberma.netlify.app/); its current ownership and image rights are unconfirmed. No public deployment, booking, order, or external message was made.
