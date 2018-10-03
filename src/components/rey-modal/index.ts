import { AppClickEvent, CloseModalEvent, SignModalEvent } from "../../shared/events";

export default class ReyModalComponent extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = require("./template.html");
    const style = document.createElement("style");
    style.textContent = require("./styles.css");
    shadowRoot.appendChild(style);

    // Handle click events on app names on any child element
    this.addEventListener("app-click", (ev: AppClickEvent) => {
      ev.preventDefault(); ev.stopPropagation();
      window.open(`https://explorer.reputation.network/app/${ev.appAddress}`);
    });

    // Handle structs details clicks
    const overlay = shadowRoot.querySelector("#overlay");
    const overlayBackBtn = shadowRoot.querySelector("#overlay #back");
    overlayBackBtn.addEventListener("click", (ev) => {
      overlay.classList.add("hidden");
    });
    this.addEventListener("preface-details", (ev) => {
      ev.preventDefault();
      overlay.classList.remove("hidden");
    });

    // Handle modal button actions
    const handleBtnClick = (btn: HTMLElement, EventClazz: any) => {
      btn.addEventListener("click", (ev) => {
        ev.preventDefault(); ev.stopPropagation();
        this.dispatchEvent(new EventClazz());
      });
    };
    handleBtnClick(shadowRoot.querySelector("#sign"), SignModalEvent);
    handleBtnClick(shadowRoot.querySelector("#close"), CloseModalEvent);
  }
}
