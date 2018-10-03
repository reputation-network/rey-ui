export default class ReyPortalComponent extends HTMLElement {
  public static wrap(elem: HTMLElement) {
    const portal = new ReyPortalComponent();
    elem.slot = "root";
    portal.appendChild(elem);
    return portal;
  }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = require("./styles.css");
    const root = document.createElement("slot");
    root.name = "root";
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(root);
  }
}
