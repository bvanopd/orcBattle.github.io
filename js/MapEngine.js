import Map from "./map.js";
import Text from "./textRevealer.js";
import TextRevealer from "./textRevealer.js";
import TextConfig from "./textConfigs.js";
import CombatEngine from "./combatEngine.js";
import Entity from "./entity.js";

export default class MapEngine {
  constructor(mapRef, mapMatrix, playerX, playerY) {
    this.mapRef = mapRef;
    //The mapMatrix is the blueprint for everything on the map. Configurations held in map.js
    this.mapMatrix = mapMatrix;
    this.mapCanvas = this.createAreaContext(760, 560, '#444');
    this.tileSize = 40;
    //give the player a location in the matrix and color the square they are in
    this.player = { x: playerX, y: playerY, color: '#87b21b' };
    this.mapMatrix[playerY][playerX] = 2;

    //add an event listener to handle keyboard input
    document.addEventListener("keydown", this.keyPress);
    this.listening = true;
  }


  //A dedicated method for creating the canvas context just in case I want to make multiple canvas layers later
  createAreaContext(width, height, color) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.background = color;
    this.canvas.setAttribute("class", "map");
    this.canvas.setAttribute("id", "currentMap");

    //add the canvas to the document
    document.body.appendChild(this.canvas);
    //return the canvas to constructor
    return this.context;
  }

  drawMap() {
    //the mapMatrix is a 2d array. Iterate through it and color the tiles based on their value
    for (let row = 0; row < this.mapMatrix.length; row++) {
      for (let column = 0; column < this.mapMatrix[row].length; column++) {
        let tile = this.mapMatrix[row][column];
        let tileColor = '#000';

        //wall
        if (tile === 1) {
          tileColor = "#18769c";
        }
        //player
        else if (tile === 2) {
          tileColor = this.player.color;
        }
        //item
        else if (tile >= 100 && tile < 200) {
          tileColor = 'Gold';
        }
        //enemy
        else if (tile >= 200 && tile < 300) {
          tileColor = 'red';
        }
        //empty space
        else if (tile >= 300 && tile < 400) {
          tileColor = '#7C4700';
        }

        //draw the tile
        this.mapCanvas.fillStyle = tileColor;
        this.mapCanvas.fillRect((column * this.tileSize), (row * this.tileSize), (this.tileSize), (this.tileSize));
      }
    }
  }

  //key press events. Anonymous arrow function to preserve scope so that we can use 'this'
  keyPress = ({ keyCode }) => {

    //prevent movement if "not listening"
    if (this.listening) {

      //up
      if (keyCode === 38) {
        let directionX = 0;
        let directionY = -1;
        this.movePlayer(directionX, directionY);
        //console.log('up');
      }
      //down
      if (keyCode === 40) {
        let directionX = 0;
        let directionY = 1;
        this.movePlayer(directionX, directionY);
        //console.log('down');
      }
      //left
      if (keyCode === 37) {
        let directionX = -1;
        let directionY = 0;
        this.movePlayer(directionX, directionY);
        //console.log('left');
      }
      //right
      if (keyCode === 39) {
        let directionX = 1;
        let directionY = 0;
        this.movePlayer(directionX, directionY);
        //console.log('right');
      }
      //enter
      if (keyCode === 13) {
        this.interactWithObject();
        //console.log('enter');
      }
    }
    //Esc
    if (keyCode === 27) {
      alert("Use the arrow keys to move your character.\n" +
        "Press enter to interact with items on the map.\n" +
        "Press shift to pause and unpause the game.\n" +
        "Press ESC to view this menu again.\n\n" +
        "Doors are brown. Enemies are red. Items you can pick up are gold.")
    }
    //Shift
    if (keyCode === 16) {
      this.pauseGame();
    }
  }

  //This is really only used to prevent movement during a battle
  pauseGame() {
    if (this.listening) {
      this.listening = false;
      const pauseScreen = document.createElement('h1');
      pauseScreen.setAttribute('id', 'paused')
      pauseScreen.innerHTML = "Paused";
      document.body.appendChild(pauseScreen);
    } else {
      this.listening = true;
      document.getElementById('paused').remove();
    }
  }

  interactWithObject() {
    /*This method is a big one. All interactions with stuff on the grid.

    */

    //Put the adjacent tile values in to an array so we can sort through them
    let adjacentTiles = [
      this.mapMatrix[this.player.y + 1][this.player.x],//down
      this.mapMatrix[this.player.y - 1][this.player.x],//up
      this.mapMatrix[this.player.y][this.player.x + 1],//right
      this.mapMatrix[this.player.y][this.player.x - 1]];//left

    let adjObject = {
      value: 0,
      location: 0
    }

    //Loop over the array, identify the most relevant item, and find out where it is.
    for (let i = 0; i < adjacentTiles.length; i++) {
      if (adjacentTiles[i] > adjObject.value) {
        adjObject.value = adjacentTiles[i];
      }
      if (adjacentTiles[i] == adjObject.value) {
        adjObject.location = i;
      }
    }

    //Make decisions based on adjObject
    switch (true) {

      //Adjacent object is a door so we need to change the map
      case adjObject.value > 300 && adjObject.value < 400:

        //Convert the matrix value of the tile to a reference to the map config object
        let ref = "m0" + (adjObject.value - 300).toString();

        //m05 is the victory map, only accessible after defeating the orc. Else resolve the normal map change
        if (ref === 'm05') {
          this.createVictoryCanvas();
          let victoryText = new TextRevealer({ text: "You squint in the daylight. Green hillsides stretch as far as you can see. Freedom is yours." });
          victoryText.init();
          this.listening = false;
        }
        else {
          this.setMap(ref);

          //Display different text if the player has visited this area already
          if (TextConfig[ref].visited === 'false') {
            let text = new TextRevealer(TextConfig[ref]);
            text.init();
            TextConfig[ref].visited = 'true';
          } else {
            let altText = TextConfig[ref].altText;
            let text = new TextRevealer({ text: altText });
            text.init();
            TextConfig[ref].visited = 'true';
          }

          //move the player opposite the direction of the door they're going through
          if (adjObject.location === 0) {
            this.movePlayer(0, -11);
          } else if (adjObject.location === 1) {
            this.movePlayer(0, 11);
          } else if (adjObject.location === 2) {
            this.movePlayer(-16, 0);
          } else if (adjObject.location === 3) {
            this.movePlayer(16, 0);
          }
        }
        break;


      //Adjacent object is a monster
      case adjObject.value > 200 && adjObject.value < 300:

        this.pauseGame();
        let monsterRef = "e0" + (adjObject.value - 200).toString();

        //Create a new battle and start it, passing the player and enemy entities
        let battle = new CombatEngine(Entity["e01"], Entity[monsterRef]);
        battle.startBattle();


        //TODO refactor into a function, duplicated code.
        //Erase the enemy from the map when you engage it
        if (adjObject.location === 0) {
          this.updateMapMatrix(this.player.y + 1, this.player.x, 0);
        } else if (adjObject.location === 1) {
          this.updateMapMatrix(this.player.y - 1, this.player.x, 0);
        } else if (adjObject.location === 2) {
          this.updateMapMatrix(this.player.y, this.player.x + 1, 0);
        } else if (adjObject.location === 3) {
          this.updateMapMatrix(this.player.y, this.player.x - 1, 0);
        }
        this.drawMap();
        break;

      //Adjacent object is an item
      case adjObject.value > 100 && adjObject.value < 200:

        let itemRef = "e0" + (adjObject.value - 100).toString();

        //The healing potion has a unique effect of restoring health. The other items are all weapons to equip.
        if (itemRef === 'e07') {
          Entity["e01"].health += Entity[itemRef].health;
        }

        //Equip the weapon
        else {
          Entity["e01"].weapon = Entity[itemRef].weapon;
          Entity["e01"].damageMin = Entity[itemRef].damageMin;
          Entity["e01"].damageMax = Entity[itemRef].damageMax;
        }
        let itemText = new TextRevealer({ text: Entity[itemRef].text });
        itemText.init();


        if (adjObject.location === 0) {
          this.updateMapMatrix(this.player.y + 1, this.player.x, 0);
        } else if (adjObject.location === 1) {
          this.updateMapMatrix(this.player.y - 1, this.player.x, 0);
        } else if (adjObject.location === 2) {
          this.updateMapMatrix(this.player.y, this.player.x + 1, 0);
        } else if (adjObject.location === 3) {
          this.updateMapMatrix(this.player.y, this.player.x - 1, 0);
        }
        this.drawMap();
        break;
      default:
    }
  }

  //Check if the player can move the direction of the keypress
  isNotBlocked(x, y) {
    if (this.mapMatrix[this.player.y + y][this.player.x + x] === 0) {
      console.log('not blocked');
      return true;
    }
    console.log('blocked');
    return false;
  }

  movePlayer(directionX, directionY) {
    if (this.isNotBlocked(directionX, directionY)) {
      this.updateMapMatrix(this.player.y, this.player.x, 0);
      this.updateMapMatrix(this.player.y + directionY, this.player.x + directionX, 2);
      this.player.x += directionX;
      this.player.y += directionY;
      this.drawMap();
    }
  }

  //Update the current matrix and the object literal to keep track of changes before redrawing
  updateMapMatrix(y, x, value) {
    this.mapMatrix[y][x] = value;
    Map[this.mapRef].mapMatrix[y][x] = value;
  }

  //empty the player's tile and then change the map
  setMap(mapRef, playerX, playerY) {
    this.updateMapMatrix(this.player.y, this.player.x, 0);
    this.mapMatrix = Map[mapRef].mapMatrix;
    this.mapRef = mapRef;
    this.drawMap();

  }

  createVictoryCanvas() {
    let victoryCanvas = document.createElement('canvas');
    let victoryContext = victoryCanvas.getContext('2d');
    victoryCanvas.width = 760;
    victoryCanvas.height = 560;
    victoryCanvas.style.background = 'Black';
    victoryCanvas.setAttribute("class", "victory");
    victoryContext.font = ' 48px gameFont';
    victoryContext.fillStyle = 'Wheat';
    victoryContext.fillText("Victory!", 200, 300);
    document.body.appendChild(victoryCanvas);
  }

}