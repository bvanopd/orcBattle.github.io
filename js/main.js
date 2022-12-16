import MapEngine from "./MapEngine.js";
import Map from "./map.js";
import TextRevealer from "./textRevealer.js";
import TextConfig from "./textConfigs.js";
import CombatEngine from "./combatEngine.js";


//draw first map and get things started
//The rest is handled by the engines

let map = new MapEngine('m01', Map.m01.mapMatrix, Map.m01.playerX, Map.m01.playerY);
map.drawMap();

alert(" Welcome to Orc Battle.\n\nUse the arrow keys to move your character.\n" +
  "Press enter to interact with doors, items and enemies.\n" +
  "Press shift to pause and unpause the game.\n" +
  "Press ESC to view this menu again.\n\n" +
  "Doors are brown. Enemies are red. Items you can pick up are gold.")

let startText = new TextRevealer(TextConfig.t01);
startText.init();
TextConfig['m01'].visited = 'true';
