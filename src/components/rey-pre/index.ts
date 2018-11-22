export default class ReyPreComponent extends HTMLElement {
  constructor(obj: any) {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = require("./styles.css");
    const pre = document.createElement("pre");
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(pre);
    pre.innerHTML = json(obj);
    if (obj instanceof Error) {
      pre.classList.add("error");
    }
    if (obj && obj.response && obj.response.status === 404) {
      // FIXME: THIS IS AWFUL!
      pre.innerHTML = "No data found.";
    }
  }
}

export function json(data: any, omitSignature: boolean = true): string {
  const space = 2;
  const replacer = (key: string, value: any) =>
    key === "signature" ? undefined : value;
  return JSON.stringify(data, omitSignature ? replacer : null, space);
}
