import { ActionEvent } from "../../shared/events";

export default class ReyCtaButtonComponent extends HTMLElement {
  private _btn: HTMLButtonElement;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = require("./styles.css");
    shadowRoot.appendChild(style);

    const btn = this._btn = document.createElement("button");

    this.addEventListener("click", (ev) => {
      ev.preventDefault(); ev.stopPropagation();
      const action = this.getAttribute("action");
      this.dispatchEvent(new ActionEvent(action));
    });

    this.childNodes.forEach((elem) => btn.appendChild(elem));
    shadowRoot.appendChild(btn);
  }

  public get innerText() {
    return super.innerText;
  }

  public set innerText(text: string) {
    super.innerText = text;
    this._btn.innerText = text;
  }
}
