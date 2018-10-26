import { AppClickEvent } from "../../shared/events";
import manifestCache from "../../shared/manifest-cache";

export default class ReyAppNameComponent extends HTMLElement {
  private _name: HTMLSpanElement;

  constructor(address: string) {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    this._name = shadow.appendChild(document.createElement("span"));

    this._name.addEventListener("click", (ev) => {
      ev.preventDefault(); ev.stopPropagation();
      this.dispatchEvent(new AppClickEvent(this.address));
    }, true);

    if (address) { this.address = address; }
  }

  public get address(): string {
    return this.getAttribute("address");
  }
  public set address(address: string) {
    this.setAttribute("address", address);
  }

  public static get observedAttributes() { return ["address"]; }
  public attributeChangedCallback(name, oldValue, newValue) {
    if (name === "address" && newValue && oldValue !== newValue) {
      const address = newValue;
      const manifest = manifestCache.get(address);
      if (!manifest) { return; }
      this._name.innerText = manifest.name;
    }
  }
}
