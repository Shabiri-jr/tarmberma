# Immersive website verification

Checked 30 September 2026 in local Chromium against the Vite server. This supersedes verification of the earlier cocktail-only layout.

## Completed

- Production build succeeds. The built site was also served on port 4173: camera navigation and both projected hotspots rendered, and the food menu opened with all 54 selections. No runtime errors in that production check.
- One real WebGL scene spans all five chapters. Scroll progress was checked at 0, .25, .5, .75 and 1; screenshots confirm changing camera position and composition within the same environment.
- Daylight transitions to darker sky and warm artificial lighting at dusk.
- Look around rotates the scene: before/after canvas captures differ after a drag. Return to journey restores the guided camera. Hidden chapter buttons become inert while exploring.
- Food and bar scene hotspots open the expected menus.
- All 54 selections are available; pizza search returns six. Drinks hotspot selects Drinks.
- Table enquiry builds a reviewable link to the verified 2348075590939 WhatsApp contact. Editing preserves the entered name and draft fields. No message was sent.
- Both menu PDF routes and the local scene fallback image return HTTP 200.
- No horizontal overflow at viewport widths 360, 390, 768, 1024 and 1440.
- Mobile table composition and menu dialog were inspected visually at 390 × 844. Mobile visit information includes the address and outbound actions.
- Reduced-motion browser preference activates the corresponding control and makes chapter navigation cut directly to the exact camera stop.
- With WebGL deliberately disabled, the local still appears and all 54 menu selections remain accessible.
- No JavaScript runtime errors in the completed interaction checks. The renderer dependency emits a Three.Clock deprecation warning.

## Evidence

`immersive-arrival.png`, `immersive-garden.png`, `immersive-table.png`, `immersive-bar.png`, `immersive-dusk.png`, `immersive-mobile.png`, `immersive-mobile-table.png`, `immersive-mobile-menu.png`, and `immersive-look-around.png` capture the rebuilt experience during development.

## Limits

These are browser viewport and functional checks, not measurements on physical phones or field performance data. The lazy 3D dependency chunk exceeds Vite's 500 kB advisory threshold (about 274 kB compressed). The scene uses material batching, demand rendering, a capped pixel ratio, and a static fallback. Architecture is stylised concept geometry, not a verified plan of the real venue. No public launch or outbound message was performed.


## Breeze and jazz — 30 September 2026

- Fixed-camera screenshots 2.5 seconds apart show moving foliage, trunks and shadows (95,580 changed pixels in the isolated browser check). Pots, buildings and furniture remain fixed.
- With reduced motion enabled, screenshots 2.2 seconds apart were identical. No shader compilation or page errors in that check.
- Music is paused on first load, uses preload=none, and starts from Play jazz. The local track decoded to 323.05 seconds, played with currentTime advancing, and started at volume 0.22.
- The volume slider changed the audio volume to 0.37, and Pause jazz stopped playback.
- Simulated document visibility changes paused playback and resumed previously playing audio. Seeking near the end verified the recording loops back to its beginning.
- Music credits are accessible through sound settings and contain the composer and CC BY 4.0 licence links.
- Sound settings were inspected at desktop and 390 × 844. No horizontal overflow at 360, 390, 768 or 1440 pixels.
- Source and attribution: public/audio/ATTRIBUTION.txt; research/jazz-track-source.json. The recording is unchanged; runtime playback adjusts volume and repeats it.

## Seating and welcoming host

The six chairs beside the smaller tables had been facing outward. Chair orientation now derives from the direction to its table centre; all ten dining-chair front vectors align with their tables (dot product 1.0). Desktop garden imagery was inspected after the correction.

Added an original, material-batched 3D host behind the bar, an intermittent welcoming wave, and a camera-facing greeting reading Welcome to Tamberma. The drinks tray/marker and front pendant were repositioned to keep the face and greeting readable. Mobile camera offsets now interpolate between chapter compositions and centre the bar host.

Desktop and 390 × 844 bar screenshots were inspected. The drinks marker still opens the Drinks category. With reduced motion enabled, two bar-scene captures 1.4 seconds apart were identical. The static fallback image was refreshed. No runtime errors were observed in these browser checks. Evidence: host-bar-desktop.png, host-bar-mobile.png, chairs-garden-fixed.png.
