# Website asset provenance

Prepared 30 September 2026 for a private concept website.

## Reference photography

The following public image URLs were inspected and saved locally. The older Ibadan-branded website associates them with the named dishes. Its current ownership and the image rights are unconfirmed; obtain owner-approved originals before public release. They are reference images, not evidence of current dish presentation.

| Local file | Source | Use |
|---|---|---|
| `public/images/food-chicken.jpg` | https://tamberma.netlify.app/f1.jpeg | Tandoori chicken reference |
| `public/images/food-pizza.jpg` | https://tamberma.netlify.app/f2.jpeg | Chicken suya pizza / pizza category reference |
| `public/images/food-prawns.jpg` | https://tamberma.netlify.app/f3.jpeg | Grilled prawns category reference |
| `public/images/food-noodles.jpg` | https://tamberma.netlify.app/f4.jpeg | Singapore noodles category reference |

The retrieved `r3.jpg`, `r5.jpeg` and `tam.jpg` files are retained as unused references (`garden-wide.jpg`, `dining.jpg`, `legacy-logo.jpg`). Visual inspection showed the first two depict people dining, not a surveyed garden. None is presented as a verified current venue photograph. A previously indexed courtyard URL returned 404 and is not used.

## Original implementation assets

- Cocktail: original procedural meshes, locally generated citrus textures, glass materials, leaves, ice and tablecloth in `CocktailScene.jsx`. No remote model or HDR environment is requested.
- Logo mark: original simplified interpretation for this pitch, with a Tamberma wordmark. Replace with approved vector branding for launch.
- Event graphics and decorative location graphic: CSS/vector compositions. The location illustration is not a geographic map.
- Fonts: DM Sans and Cormorant Garamond from their Fontsource npm packages, hosted locally with the build. Package license files remain in node_modules.
- Icons: Lucide, plus a simple locally defined Instagram outline.

## Menu source documents

The original user-provided PDFs are copied unchanged to `public/menus/tamberma-food.pdf` and `public/menus/tamberma-drinks.pdf`. They match the filenames linked by https://linktr.ee/tamberma . The selected HTML menu uses the visually checked `research/menus/menu-analysis.md` values. Currency is interpreted as NGN from the business context; the source documents state prices exclude 7.5% VAT.

## Immersive rebuild

`VenueEnvironment.jsx` and `DiningDetails.jsx` contain original procedural architecture, planting, furnishings, tableware, food and drink geometry created for this pitch. Canvas textures for plaster, timber, signage, linen and pizza are generated locally. The space is an artistic interpretation rather than measured venue geometry.

`public/images/venue-preview.jpg` is a local screenshot of the rendered courtyard canvas, used as a loading and unsupported-WebGL fallback. It is not a photograph of the real restaurant. The earlier standalone cocktail study remains in source but is no longer imported into the main experience.

## Jazz soundtrack

Jazz Brunch by Kevin MacLeod (incompetech.com), ISRC USUAN1700074. Artist track page: https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700074

The artist lists this recording under Creative Commons Attribution 4.0: https://creativecommons.org/licenses/by/4.0/. Source MP3: https://incompetech.com/music/royalty-free/mp3-royaltyfree/Jazz%20Brunch.mp3

Saved unchanged as public/audio/jazz-brunch-kevin-macleod.mp3 (10,341,722 bytes). Loaded only when playback is requested; looped and played at user-selected volume. Credits are visible in the website and saved alongside the audio in ATTRIBUTION.txt. No AI-generated music is used.

## Welcoming character

BarHost.jsx contains original procedural character geometry with an ivory shirt, olive apron, and a subtle waving arm. BarWelcome.jsx creates the Welcome to Tamberma speech-bubble texture locally. Neither uses an external character model or third-party portrait. The character is illustrative and does not depict a known member of the restaurant staff.
