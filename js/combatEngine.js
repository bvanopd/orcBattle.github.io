import MapEngine from "./MapEngine.js";
import Entity from "./entity.js";
import TextRevealer from "./textRevealer.js";
import TextConfig from "./textConfigs.js";

export default class CombatEngine {

  constructor(player, enemy) {
    this.battleCanvas = this.createBattleContext(760, 560, '#444', 'battle');
    this.uiContext = this.createBattleContext(750, 120, 'black', 'ui');
    this.player = player;
    this.enemy = enemy;
    const container = document.getElementById('battleContainer');

    //Create some buttons to be used as the battle interface
    this.attackButton = this.createButton('attackButton', 'Attack');
    container.appendChild(this.attackButton);
    this.endButton = this.createButton('endButton', 'End combat');
    container.appendChild(this.endButton);

    //Add event listeners for the buttons and disable the endButton
    this.attackButton.addEventListener("click", this.attack);
    this.endButton.addEventListener("click", this.end);
    document.getElementById('endButton').disabled = true;

    //Add a ui element to show the players hit points and current weapon
    this.playerHitPoints = document.createElement("p");
    this.playerHitPoints.innerHTML = ("Hit Points: " + player.health + "\nWeapon: " + player.weapon);
    this.playerHitPoints.setAttribute("id", 'hp');
    container.appendChild(this.playerHitPoints);
  }

  createBattleContext(width, height, color, context) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
    this.canvas.style.background = color;
    this.canvas.setAttribute("class", context);
    this.canvas.setAttribute("id", context);
    document.getElementById('battleContainer').appendChild(this.canvas);
    return this.context;
  }

  createButton(id, text) {
    let button = document.createElement("button");
    button.setAttribute("id", id);
    button.innerHTML = text;
    return button;
  }

  startBattle() {
    let battleStartText = new TextRevealer(this.enemy);
    battleStartText.init();
  }

  //static end method so that we can call it from click event
  static endBattle() {
    document.getElementById('battleContainer').replaceChildren();
    document.getElementById("consoleText").innerText = "";
  }

  end() {
    CombatEngine.endBattle();
    document.getElementById("consoleText").innerText = "";
  }

  //Anonymous async method attached so we can use 'delay' and still preserve scope
  attack = async () => {

    //set a delay to be used to time enemy attacks
    //https://stackoverflow.com/questions/14226803/wait-5-seconds-before-executing-next-line
    const delay = ms => new Promise(res => setTimeout(res, ms));

    let damage = Math.floor(Math.random() * (this.player.damageMax - this.player.damageMin + 1) + this.player.damageMin);
    this.enemy.health -= damage;

    //End the battle if enemy has 0 or fewer hit points
    if (this.enemy.health <= 0) {
      document.getElementById('attackButton').disabled = true;
      let text = new TextRevealer({ text: 'You attack the ' + this.enemy.name + ' with ' + this.player.weapon + " for " + damage + " damage, slaying it! " });
      text.init();
      await delay(3000);
      document.getElementById('endButton').disabled = false;
    }
    else {
      let text = new TextRevealer({ text: 'You attack the ' + this.enemy.name + ' with ' + this.player.weapon + " for " + damage + " damage. " });
      text.init();
      document.getElementById('attackButton').disabled = true;
      await delay(3000);
      this.enemyAttack();
    }
  }

  enemyAttack = async () => {
    const delay = ms => new Promise(res => setTimeout(res, ms));

    let damage = Math.floor(Math.random() * (this.enemy.damageMax - this.enemy.damageMin + 1) + this.enemy.damageMin);
    this.player.health -= damage;
    this.playerHitPoints.innerHTML = ("Hit Points: " + this.player.health + "\nWeapon: " + this.player.weapon);

    if (this.player.health <= 0) {
      let text = new TextRevealer({ text: this.enemy.name + ' attacks you with ' + this.enemy.weapon + " for " + damage + " damage. \n\nYou are slain... refresh the page to try again." });
      text.init();
      document.getElementById('attackButton').disabled = true;
    } else {
      let text = new TextRevealer({ text: this.enemy.name + ' attacks you with ' + this.enemy.weapon + " for " + damage + " damage." });
      text.init();
      await delay(2000);
      document.getElementById('attackButton').disabled = false;
    }

  }

}


