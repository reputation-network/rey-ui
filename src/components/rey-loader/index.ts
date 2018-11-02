export default class ReyLoaderComponent extends HTMLElement {
  constructor(text?: string) {
    super();
    const shadowRoot = this.attachShadow({ mode: "closed" });
    shadowRoot.innerHTML = require("!html-loader!./chip.svg");
    const style = document.createElement("style");
    style.textContent = require("./styles.css");
    shadowRoot.appendChild(style);
    if (text) {
      const span = document.createElement("span");
      span.innerText = text;
      shadowRoot.appendChild(span);
    }
  }
}
