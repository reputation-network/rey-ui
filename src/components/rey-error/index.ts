import {
  MissingEthProviderAccountError,
  MissingEthProviderError,
  UnsupportedEthNetworkError,
} from "../../shared/errors";

export default class ReyErrorComponent extends HTMLElement {
  constructor(error: Error) {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = this._getTemplateForError(error);

    const style = document.createElement("style");
    style.textContent = require("./styles.css");
    shadow.appendChild(style);

    const messageElem = shadow.querySelector<HTMLParagraphElement>("#message");
    if (messageElem) {
      messageElem.innerText = error.message || "Unkown error";
    }
  }

  private _getTemplateForError(error: Error) {
    if (error instanceof MissingEthProviderError) {
      return require("./templates/missing-provider.html");
    } else if (error instanceof UnsupportedEthNetworkError) {
      return require("./templates/unsupported-network.html");
    } else if (error instanceof MissingEthProviderAccountError) {
      return require("./templates/missing-account.html");
    } else {
      return require("./templates/generic.html");
    }
  }
}
