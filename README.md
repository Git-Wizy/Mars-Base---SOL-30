# Mars Base: Sol 30

A browser game for children aged 7–12 (NASA Space Apps Challenge 2026, "Junior Astronaut Mission Trainer").
Run a small Mars base for 30 sols. Pick one job each sol, survive events, and learn why every choice has a trade-off.

## Run it
Open `index.html` in a browser. No build step, no install, no account.

## Files
| File | What it holds |
|---|---|
| `index.html` | Page structure only: scene, bottom band, footer credits, script tags |
| `css/style.css` | All styling: layout, colours, pixel-hand hints, phone-landscape rules |
| `js/data.js` | Saved NASA DONKI record, the 5 daily jobs and their science notes, the 5 story events |
| `js/game.js` | Game state, daily upkeep, win/lose rules, scoring, and drawing each screen |
| `js/nasa.js` | Optional live call to the NASA DONKI API. Falls back to the saved record |
| `assets/images/` | Base picture, Mars background, Buddy robot, astronaut poses, component pictures, pixel hand |

Scripts load in this order: `data.js`, `game.js`, `nasa.js`.

## NASA data
- Real: DONKI solar flare `2024-05-08T04:37:00-FLR-001` (X1.0, Active Region 13664). Link is in `data.js`.
- Real: Curiosity radiation measurement, about 8,100 micrograys on 20 May 2024, as reported by Space.com.
- Simulated: every meter, cost and "radiation game unit" in the game. Labelled as simulated on screen.
- `js/nasa.js` uses a free NASA API key. Visitors can see it. Make a new one at https://api.nasa.gov if it is abused.
- The live call has not been tested yet. The saved record always works.

## Credits
- Metal textures: Magda Ehlers and Damien Wright on Pexels (free to use).
- Characters, base and component artwork: add the artist's name here.
- Mars background photo: add the source here.
- Built with HTML, CSS and JavaScript. Code written with help from Claude, an AI assistant.
- Not an official NASA product.

## Game rules in one minute
- Start: power 80, life support 100, food 100, crew health 100.
- Each sol: solar adds power, the crew uses air, water and food, and the base uses energy.
- Jobs: research, recycle air and water, plant crops (food arrives 5 sols later), sweep solar panels, rest.
- Events at sols 6, 12, 18, 22 and 25. The player chooses by clicking parts of the base.
- Lose if crew health hits 0. Win by reaching sol 30. Good ending needs research of 35 or more.
