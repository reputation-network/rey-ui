import { AppParams, ReadPermission, Session, WritePermission } from "rey-sdk/dist/structs";
import {
  ReyAppHeaderComponent,
  ReyCtaButtonComponent,
  ReyErrorComponent,
  ReyModalComponent,
  ReyPortalComponent,
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

async function handleModalActions<T>(
  modal: HTMLElement,
  onSign: () => Promise<T>,
): Promise<T> {
  const portal = ReyPortalComponent.wrap(modal);
  const addPortal = (p: HTMLElement) => {
    window.document.body.style.overflow = "hidden";
    window.document.body.appendChild(p);
  };
  const removePortalAndForward = (result: T) => {
    portal.remove();
    return result;
  };
  const removePortalAndThrow = (error: any) => {
    portal.remove();
    throw error;
  };
  return new Promise<T>((resolve, reject) => {
    const _reject = () => reject(new Error("User rejected signature"));
    portal.addEventListener("close", _reject);
    modal.addEventListener("close", _reject);
    // Allow escape to be used to close the modal
    const escListener = (ev: KeyboardEvent) => {
      if (ev.keyCode === 27) {
        document.removeEventListener("keydown", escListener);
        _reject();
      }
    };
    document.addEventListener("keydown", escListener);
    //
    modal.addEventListener("action:sign", () => {
      modal.querySelectorAll<any>("[slot=footer]")
        .forEach((e) => e.setAttribute("disabled", "disabled"));
      Promise.resolve(onSign()).then(resolve, reject);
    }, { once: true });
    addPortal(portal);
  }).then(removePortalAndForward, removePortalAndThrow);
}

export {
  buildAllowToRunModal,
  buildSelfRunModal,
  buildOptInModal,
  buildErrorModal,
  handleModalActions,
};
