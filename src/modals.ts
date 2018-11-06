import { AppParams, ReadPermission, Session, WritePermission } from "rey-sdk/dist/structs";
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
import { appendChildren } from "./shared/dom-utils";

function buildSignButton(text?: string) {
  const ctaBtn = new ReyCtaButtonComponent(text || "Sign with Metamask");
  ctaBtn.setAttribute("action", "sign");
  return ctaBtn;
}

function buildModal(opts: {
  modal?: () => HTMLElement,
  modalAttributes?: Record<string, string>,
  header?: () => HTMLElement,
  preface: () => HTMLElement,
  labels?: () => HTMLElement[],
  footer?: () => HTMLElement,
}) {
  const modal = opts.modal ? opts.modal() : new ReyModalComponent();
  const header = opts.header ? opts.header() : document.createElement("div");
  const preface = opts.preface();
  const labels = opts.labels ? opts.labels() : [];
  const footer = opts.footer ? opts.footer() : document.createElement("div");

  // Setup shadodom slots
  header.slot = "header";
  preface.slot = "preface";
  labels.forEach((l) => l.slot = "overlay-content");
  footer.slot = "footer";

  // Setup attributes
  return appendChildren(modal, ...[header, preface, ...labels, footer]);
}

function buildOptInModal(writePermission: WritePermission) {
  const writer = writePermission.writer;
  return buildModal({
    header: () => new ReyAppHeaderComponent(writer),
    preface: () => new ReyPrefaceOptIn({ writer, "message-count": "1" }),
    labels: () => [new ReyStructLabelComponent(writePermission)],
    footer: () => buildSignButton(),
  });
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

  return buildModal({
    header: () => new ReyAppHeaderComponent(source),
    preface: () => new ReyPrefaceAllowToRun({
      source, reader, "message-count": structs.length.toString() }),
    labels: () => structs.map((e) => new ReyStructLabelComponent(e)),
    footer: () => buildSignButton(),
  });
}

function buildSelfRunModal(appParams: AppParams) {
  const {
    request,
    request: { session, readPermission },
    extraReadPermissions,
    encryptionKey,
  }  = appParams;
  const structs = [session, readPermission, ...extraReadPermissions, request, encryptionKey];
  const source = readPermission.source;
  return buildModal({
    header: () => new ReyAppHeaderComponent(source),
    preface: () => new ReyPrefaceSelfRun({
      source, "cost": request.value,
      "message-count": structs.length.toString(),
    }),
    labels: () => structs.map((e) => new ReyStructLabelComponent(e)),
    footer: () => buildSignButton("Sign and run app"),
  });
}

function buildErrorModal(error: Error) {
  return buildModal({
    modal: () => {
      const modal = new ReyModalComponent();
      modal.classList.add("light-header");
      return modal;
    },
    preface: () => new ReyErrorComponent(error),
  });
}

export {
  buildAllowToRunModal,
  buildSelfRunModal,
  buildOptInModal,
  buildErrorModal,
};
