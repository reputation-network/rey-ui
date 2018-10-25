export default class ReyLoaderComponent extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = require("./styles.css");
    shadowRoot.appendChild(style);
  }
}
