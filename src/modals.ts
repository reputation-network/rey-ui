import { ReadPermission, Request, Session, WritePermission } from "rey-sdk/dist/structs";
import {
  ReyAppHeaderComponent,
  ReyCtaButtonComponent,
  ReyErrorComponent,
  ReyModalComponent,
  ReyPrefaceAllowToRun,
  ReyPrefaceOptIn,
  ReyPrefaceSelfRun,
  ReyStructLabelComponent,
} from "./components";

function appendChilds(root: HTMLElement, ...childs: HTMLElement[]) {
  childs.forEach((c) => root.appendChild(c));
  return root;
}

function buildOptInModal(writePermission: WritePermission) {
  const writer = writePermission.writer;

  const modal = new ReyModalComponent();

  const header = new ReyAppHeaderComponent(writer);
  header.slot = "header";

  const preface = new ReyPrefaceOptIn();
  preface.setAttribute("writer", writer);
  preface.slot = "preface";

  const label = new ReyStructLabelComponent(writePermission);
  label.slot = "overlay-content";

  return appendChilds(modal, header, preface, label);
}

function buildAllowToRunModal(
  session: Session,
  readPermission: ReadPermission,
  // tslint:disable-next-line:trailing-comma
  ...extraReadPermissions: ReadPermission[]
) {
  const structs = [session, readPermission, ...extraReadPermissions];
  const reader = readPermission.reader;
  const source = readPermission.source;

  const modal = new ReyModalComponent();

  const header = new ReyAppHeaderComponent(source);
  header.slot = "header";

  const preface = new ReyPrefaceAllowToRun();
  preface.slot = "preface";
  preface.setAttribute("source", source);
  preface.setAttribute("reader", reader);
  preface.setAttribute("message-count", structs.length.toString());

  const labels = structs.map((e) => new ReyStructLabelComponent(e));
  labels.forEach((l) => l.slot = "overlay-content");

  return appendChilds(modal, header, preface, ...labels);
}

function buildSelfRunModal(
  request: Request,
  // tslint:disable-next-line:trailing-comma
  ...extraReadPermissions: ReadPermission[]
) {
  const { session, readPermission } = request;
  const structs = [session, readPermission, ...extraReadPermissions, request];
  const source = readPermission.source;

  const modal = new ReyModalComponent();
  const header = new ReyAppHeaderComponent(source);
  header.slot = "header";
  const preface = new ReyPrefaceSelfRun();
  preface.slot = "preface";
  preface.setAttribute("source", source);
  preface.setAttribute("cost", request.value);
  preface.setAttribute("message-count", structs.length.toString());
  const labels = structs.map((e) => new ReyStructLabelComponent(e));
  labels.forEach((l) => l.slot = "overlay-content");
  const ctaBtn = new ReyCtaButtonComponent();
  ctaBtn.innerText = "Sign and run app";
  ctaBtn.slot = "footer";
  ctaBtn.addEventListener("click", () => modal.dispatchEvent(new CustomEvent("sign")));
  return appendChilds(modal, header, preface, ...labels, ctaBtn);
}

function buildErrorModal(error: Error) {
  const modal = new ReyModalComponent();
  modal.classList.add("light-header");

  const preface = new ReyErrorComponent(error);
  preface.slot = "preface";
  const footer = document.createElement("div");
  footer.slot = "footer";

  return appendChilds(modal, preface, footer);
}

export {
  buildAllowToRunModal,
  buildSelfRunModal,
  buildOptInModal,
  buildErrorModal,
};
