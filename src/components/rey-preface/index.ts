import { setAttributes } from "../../shared/dom-utils";
import ReyAppNameComponent from "../rey-app-name";

export default function ReyPreface(template: string) {
  return class extends HTMLElement {
    constructor(attributes?: Record<string, string>) {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = template;
      const style = document.createElement("style");
      style.textContent = require("./styles.css");
      shadow.appendChild(style);

      const detailsAnchor = shadow.querySelector("#details");
      detailsAnchor.addEventListener("click", (ev) => {
        ev.preventDefault();
        const detailsEvent = new Event("preface-details", { bubbles: true });
        this.dispatchEvent(detailsEvent);
      });
      setAttributes(this, attributes);
    }

    public static get observedAttributes() {
      return ["cost", "message-count", "reader", "source", "verifier", "writer"];
    }

    public attributeChangedCallback(name, oldValue, newValue) {
      if (!newValue || oldValue === newValue) {
        return;
      }

      if (["reader", "source", "verifier", "writer"].indexOf(name) >= 0) {
        const elems = this.shadowRoot
          .querySelectorAll<ReyAppNameComponent>(`rey-app-name.${name}`);
        elems.forEach((e) => e.setAttribute("address", newValue));
      } else {
        this._setChildrenInnerHtml(`#${name}`, newValue);
        if (name === "message-count") {
          this.shadowRoot.querySelectorAll(`.message-count-suffix`).forEach((s) => {
            s.innerHTML = newValue === "1" ? "message" : "messages";
          });
        }
      }
    }

    private _setChildrenInnerHtml(selector: string, innerHTML: string) {
      this.shadowRoot.querySelectorAll(selector).forEach((e) => {
        e.innerHTML = `${innerHTML}`;
      });
    }
  };
}

// tslint:disable:no-var-requires
export const ReyPrefaceOptIn = ReyPreface(require("./templates/opt-in.html"));
export const ReyPrefaceAllowToRun = ReyPreface(require("./templates/allow-to-run.html"));
export const ReyPrefaceSelfRun = ReyPreface(require("./templates/self-run.html"));
