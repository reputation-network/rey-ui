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

    shadowRoot.appendChild(elem);
    elem.addEventListener("click", (ev) => ev.stopPropagation());
    this.addEventListener("click", () =>
      this.dispatchEvent(new CloseModalEvent()));

    elem.classList.add("enter-animation");
    elem.addEventListener("animationend", () => {
      elem.classList.remove("enter-animation");
    });

    // Override the remove action so we can animate the child before actually
    // being removed from the DOM
    this.remove = () => {
      return new Promise<void>((resolve) => {
        elem.classList.add("leave-animation");
        elem.addEventListener("animationend", () => {
          super.remove();
          resolve();
        });
      });
    };
  }
}
