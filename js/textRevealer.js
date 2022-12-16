/*
Creates an object that takes a textConfig and reveals the string one character at a time to
create a typewriter effect.

Credit for the typewriter logic goes to Drew Conley and his Pizza RPG
 */

export default class TextRevealer {
  constructor(config) {
    this.element = document.querySelector("#consoleText");
    this.text = config.text;
    this.speed = 40;
    this.timeout = null;
  }

  init() {
    document.getElementById("consoleText").innerText = "";
    let characters = [];
    this.text.split("").forEach(character => {
      let span = document.createElement("span");
      span.textContent = character;
      this.element.appendChild(span);
      //Push the updated span-tagged character to the array including the delay
      characters.push({
        span,
        delayAfter: this.speed
      })
    })
    //Send the list of characters to the reveal method
    this.revealCharacter(characters);
  }

  revealCharacter(list) {
    //splice off the first element in the list and add the revealed class to that span
    const next = list.splice(0, 1)[0];
    next.span.classList.add("revealed");

    if (list.length > 0) {
      this.timeout = setTimeout(() => {
        this.revealCharacter(list)
      }, next.delayAfter)
    }
  }
}