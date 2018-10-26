import { AppClickEvent } from "../../shared/events";
import manifestCache from "../../shared/manifest-cache";
import ReyAppNameComponent from "../rey-app-name";

export default class ReyAppHeaderComponent extends HTMLElement {
  private _name: ReyAppNameComponent;
  private _description: HTMLParagraphElement;
  private _icon: HTMLImageElement;

  constructor(address: string) {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = require("./template.html");
    const style = document.createElement("style");
    style.textContent = require("./styles.css");
    shadow.appendChild(style);

    this._name = shadow.querySelector("rey-app-name");
    this._description = shadow.querySelector("p");
    this._icon = shadow.querySelector("img");

    const handleClick = (ev) => {
      ev.preventDefault(); ev.stopPropagation();
      this.dispatchEvent(new AppClickEvent(address));
    };
    this._icon.addEventListener("click", handleClick, true);
    shadow.querySelector("a").addEventListener("click", handleClick, true);

    this._setAddress(address);
  }

  private _setAddress(address: string) {
    this.setAttribute("address", address);
    const manifest = manifestCache.get(address);
    if (!manifest) { return; } // FIXME: The UI should reflect hits change
    this._name.setAttribute("address", manifest.address);
    this._description.innerText = manifest.description;
    this._setIconUrl(manifest.picture_url);
  }

  private _setIconUrl(iconUrl: string) {
    const img = new Image();
    img.src = iconUrl;
    img.addEventListener("load", () => this._icon.src = iconUrl);
  }
}
