import { CloseModalEvent } from "../../shared/events";

export default class ReyPortalComponent extends HTMLElement {
  public static wrap(elem: HTMLElement) {
    const portal = new ReyPortalComponent(elem);
    return portal;
  }

  constructor(elem: HTMLElement) {
    super();
    const shadowRoot = this.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = require("./styles.css");
    shadowRoot.appendChild(style);
    elem.classList.add("content");
    shadowRoot.appendChild(elem);
    elem.addEventListener("click", (ev) => ev.stopPropagation());
    this.addEventListener("click", () =>
      this.dispatchEvent(new CloseModalEvent()));

    this.classList.add("entering");
    this.addEventListener("animationend", () => {
      this.classList.remove("entering");
    });

    // Override the remove action so we can animate the child before actually
    // being removed from the DOM
    this.remove = () => {
      return new Promise<void>((resolve) => {
        this.classList.add("leaving");
        this.addEventListener("animationend", () => {
          this.classList.remove("leaving");
          super.remove();
          resolve();
        });
      });
    };
  }
}
