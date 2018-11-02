import { ReadPermission, Request, Session, WritePermission } from "rey-sdk/dist/structs";
import { EncryptionKey } from "rey-sdk/dist/utils";
import ReyAppNameComponent from "../rey-app-name";
import ReyPreComponent from "../rey-pre";

type StructsWithLabel = ReadPermission | Request | Session | WritePermission | EncryptionKey;

export default class ReyStructLabelComponent extends HTMLElement {
  constructor(struct: StructsWithLabel) {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = this._getTemplateForStruct(struct);
    const style = document.createElement("style");
    style.textContent = require("./styles.css");
    shadow.appendChild(style);

    const labelElem = shadow.querySelector("#label");

    const preElem = new ReyPreComponent(struct);
    preElem.classList.add("hidden");
    shadow.appendChild(preElem);

    const detailsAnchor = createDetailsAnchorElement(struct);
    detailsAnchor.addEventListener("click", (ev) => {
      ev.preventDefault(); ev.stopPropagation();
      preElem.classList.toggle("hidden");
      detailsAnchor.innerText =
        preElem.classList.contains("hidden") ? "[+]" : "[-]";
    });
    labelElem.appendChild(detailsAnchor);

    this._setupActorsAddresses(struct);
  }

  private _getTemplateForStruct(struct: StructsWithLabel) {
    if (struct instanceof Session) {
      return require("./templates/session.html");
    } else if (struct instanceof ReadPermission) {
      return require("./templates/read-permission.html");
    } else if (struct instanceof WritePermission) {
      return require("./templates/write-permission.html");
    } else if (struct instanceof Request) {
      return require("./templates/request.html");
    } else if (struct instanceof EncryptionKey) {
      return require("./templates/encryption-key.html");
    }
  }

  private _setupActorsAddresses(struct: StructsWithLabel) {
    if (struct instanceof Request) {
      this._setActorAddress("source", struct.readPermission.source);
      this._setActorAddress("reader", struct.readPermission.reader);
      this._setActorAddress("verifier", struct.session.verifier);
    } else {
      const knownActors = ["reader", "source", "verifier", "writer"];
      knownActors.filter((a) => !!struct[a])
      .forEach((a) => this._setActorAddress(a, struct[a]));
    }
  }

  private _setActorAddress(actor: string, address: string) {
    const elems = this.shadowRoot
    .querySelectorAll<ReyAppNameComponent>(`rey-app-name.${actor}`);
    elems.forEach((e) => e.setAttribute("address", address));
  }
}

export function createDetailsAnchorElement(struct: StructsWithLabel) {
  const detailsAnchor = document.createElement("a");
  detailsAnchor.classList.add("details");
  detailsAnchor.href = "#";
  detailsAnchor.innerText = "[+]";
  return detailsAnchor;
}
