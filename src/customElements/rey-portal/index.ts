import { CloseModalEvent } from "../../shared/events";

export default class ReyPortalComponent extends HTMLElement {
  public static wrap(elem: HTMLElement) {
    return new ReyPortalComponent(elem);
  }

  constructor(elem: Element) {
    super();
    const shadowRoot = this.attachShadow({ mode: "closed" });
    // Portal styles: Positioning, enter/leave animations, backdrop...
    const portalStyle = document.createElement("style");
    portalStyle.textContent = require("./portal.css");
    shadowRoot.appendChild(portalStyle);
    // Modal styles itself
    const styles = document.createElement("style");
    styles.textContent = require("./styles.css");
    shadowRoot.appendChild(styles);
    // Close whenever the portal (i.e: the backdrop) is clicked
    this.addEventListener("click", () => this.dispatchEvent(new CloseModalEvent()));
    // Prevent modal clicks to pass through into the portal click handler
    elem.addEventListener("click", (ev) => ev.stopPropagation());

    // Forward events from the ShadowDom into the DOM iteself
    const forwardEvent = (ev) => {
      ev.stopPropagation();
      this.dispatchEvent(new Event(ev.type));
    };
    elem.addEventListener("close", forwardEvent);
    elem.addEventListener("action:sign", forwardEvent);
    // Add the child to the shadow dom
    elem.classList.add("content");
    shadowRoot.appendChild(elem);
  }

  public connectedCallback() {
    // Disable the scroll on the document, since we are a full page intromission
    window.document.body.style.overflow = "hidden";
    // Allow esc keypress to be used to close the portal
    document.addEventListener("keydown", this._escKeyListener);
    this.playEntryAnimation();
  }

  public disconnectedCallback() {
    // Resotore the scroll on the page
    window.document.body.style.overflow = "";
    // Disable the esc key listnener
    document.removeEventListener("keydown", this._escKeyListener);
  }

  public playEntryAnimation = () => {
    return new Promise((resolve) => {
      this.classList.add("entering");
      this.addEventListener("animationend", () => {
        this.classList.remove("entering");
        resolve();
      });
    });
  }

  public playExitAnimation = () => {
    return new Promise<void>((resolve) => {
      this.classList.add("leaving");
      this.addEventListener("animationend", () => {
        this.classList.remove("leaving");
        resolve();
      });
    });
  }

  private _escKeyListener = (ev: KeyboardEvent) => {
    if (ev.keyCode === 27) {
      ev.stopPropagation();
      this.dispatchEvent(new CloseModalEvent());
    }
  }
}
