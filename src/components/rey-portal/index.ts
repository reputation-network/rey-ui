import { CloseModalEvent } from "../../shared/events";

export default class ReyPortalComponent extends HTMLElement {
  public static wrap(elem: HTMLElement) {
    const portal = new ReyPortalComponent(elem);
    return portal;
  }

  constructor(...elems: HTMLElement[]) {
    super();
    const shadowRoot = this.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = require("./styles.css");
    shadowRoot.appendChild(style);
    elems.forEach(shadowRoot.appendChild, shadowRoot);
    this.addEventListener("click", (ev) => {
      if (ev.target === this) {
        this.dispatchEvent(new CloseModalEvent());
      }
    });
  }
}
