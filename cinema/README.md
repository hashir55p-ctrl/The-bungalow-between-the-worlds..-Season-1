# The Bungalow Between Worlds - 3D Cinema (Chapter 01: Ordinary Days)

A real-time 3D cinema of Chapter 1, built page by page from the manhwa. It runs entirely in the browser: no build step, no libraries, no downloads. Open `index.html` (or the GitHub Pages link) and press **Begin the chapter**.

About 7 minutes, 11 scenes, every line of dialogue from the 20 pages, with camera work, character acting, lighting changes and a procedural soundtrack (ambience, music and sound effects generated live with WebAudio).

## Scenes

| # | Scene | Pages |
|---|-------|-------|
| 1 | 3:00 AM - the glowing banyan door (cold open) | 1 |
| 2 | Fort Kochi - "I found a place", the booking | 1-2 |
| 3 | The road to Wayanad | 3 |
| 4 | The Whispering Banyan - the frog's pool | 4 |
| 5 | The hall - too clean, the stopped clock, the "talented cat", the master room | 5-7 |
| 6 | Photos, "The Watcher", goodnight, the clock rings | 8-10 |
| 7 | Creak - upstairs | 11 |
| 8 | The corridor and the door at the end | 12 |
| 9 | The study - hot tea, the polaroid, the note | 13-16 |
| 10 | Thud | 16 |
| 11 | The third hour - the door opens | 17-20 |

## Controls

- **Space** play / pause, **left / right** previous / next scene, **M** sound, **F** fullscreen
- Click the progress bar to scrub inside a scene; the numbered buttons jump between scenes.

## How it is built

- `engine.js` - small WebGL renderer (lit, fogged, per-pixel lights, ACES tone mapping)
- `world.js` - helpers and procedural textures (clock faces, the phone listing, sepia photos, the banyan door...)
- `chars.js` - the four friends (Stany, Renjith, Jesvin, Hashir), poseable with facial expressions
- `rooms.js` - the sets: study, hall, corridor, bedroom, Fort Kochi, road and jeep, bungalow exterior
- `story.js` - the eleven scenes: camera moves, blocking, dialogue timing, sound cues
- `audio.js` - ambience, pads and sound effects
- `app.js`, `style.css`, `index.html` - the player

Editing a line or a camera move is a one-line change in `story.js`. Each beat is `beat(camera, lines, act, minSeconds)`.

## Run it locally

Just double-click `index.html`, or serve the folder: `python3 -m http.server` and open `http://localhost:8000/cinema/`.

## Publish on GitHub Pages

Repo **Settings -> Pages -> Build and deployment -> Deploy from a branch -> `main` / `(root)`**. The cinema is then at `https://<user>.github.io/<repo>/cinema/`.
