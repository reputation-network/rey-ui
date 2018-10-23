export default class ReyCtaButtonComponent extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = require("./styles.css");
    shadowRoot.appendChild(style);

    const btn = document.createElement("button");
    this.childNodes.forEach((elem) => btn.appendChild(elem));
    shadowRoot.appendChild(btn);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        btn.childNodes.forEach((n) => btn.removeChild(n));
        mutation.addedNodes.forEach((n) => btn.appendChild(n));
      });
    });
    observer.observe(this, { childList: true });
  }
}
