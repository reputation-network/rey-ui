import { ReadPermission, Session, WritePermission } from "rey-sdk/dist/structs";
import {
  ReyAppHeaderComponent,
  ReyModalComponent,
  ReyPortalComponent,
  ReyPrefaceAllowToRun,
  ReyPrefaceOptIn,
  ReyStructLabelComponent,
} from "./components";

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

  modal.appendChild(header);
  modal.appendChild(preface);
  modal.appendChild(label);
  return ReyPortalComponent.wrap(modal);
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

  modal.appendChild(header);
  modal.appendChild(preface);
  labels.forEach((l) => modal.appendChild(l));
  return ReyPortalComponent.wrap(modal);
}

export {
  buildAllowToRunModal,
  buildOptInModal,
};
