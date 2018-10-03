import ReyAppNameComponent from "../rey-app-name";

export default function ReyPreface(template: string) {
  return class extends HTMLElement {
    constructor() {
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
    }

    public static get observedAttributes() {
      return ["message-count", "reader", "source", "verifier", "writer"];
    }

    public attributeChangedCallback(name, oldValue, newValue) {
      if (name === "message-count") {
        const msgCountElem: HTMLSpanElement = this.shadowRoot
          .querySelector("#message-count");
        if (msgCountElem) { msgCountElem.innerText = `${newValue}`; }
      } else if (newValue && oldValue !== newValue) {
        const elems = this.shadowRoot
          .querySelectorAll<ReyAppNameComponent>(`rey-app-name.${name}`);
        elems.forEach((e) => e.setAttribute("address", newValue));
      }
    }
  };
}

// tslint:disable:no-var-requires
export const ReyPrefaceOptIn = ReyPreface(require("./templates/opt-in.html"));
export const ReyPrefaceAllowToRun = ReyPreface(require("./templates/allow-to-run.html"));
export const ReyPrefaceSelfRun = ReyPreface(require("./templates/self-run.html"));
