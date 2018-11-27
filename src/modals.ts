import { createAllowToRunModal, createErrorModal, createOptinModal, createSelfRunModal } from "./components";
import { ReyPortalComponent } from "./customElements";
import { AppParams, ReadPermission, Session, WritePermission } from "./lib/rey-sdk";
import { AppRenderDataRecord } from "./lib/rey-sdk-helpers";

async function handleModalEvents<T>(
  portal: ReyPortalComponent,
  onSign: () => Promise<T>,
) {
  try {
    await new Promise((resolve, reject) => {
      portal.addEventListener("action:sign", () => resolve());
      portal.addEventListener("close", () =>
        reject(new Error("User closed the prompt")));
    });
    const result = await onSign();
    return result;
  } finally {
    await portal.playExitAnimation();
    portal.remove();
  }
}

async function showOptInModal<T>(opts: {
  appRenderDataRecord: AppRenderDataRecord,
  writePermission: WritePermission,
  onSign: () => Promise<T>,
}) {
  const portal = createOptinModal({
    appRenderData: opts.appRenderDataRecord,
    writePermission: opts.writePermission,
  });
  document.body.appendChild(portal);
  return handleModalEvents(portal, opts.onSign);
}

async function showAllowToRunModal<T>(opts: {
  appRenderDataRecord: AppRenderDataRecord,
  session: Session,
  readPermission: ReadPermission,
  extraReadPermissions: ReadPermission[],
  onSign: () => Promise<T>,
}) {
  const portal = createAllowToRunModal({
    appRenderData: opts.appRenderDataRecord,
    session: opts.session,
    readPermission: opts.readPermission,
    extraReadPermissions: opts.extraReadPermissions,
  });
  document.body.appendChild(portal);
  return handleModalEvents(portal, opts.onSign);
}

async function showSelfRunModal<T>(opts: {
  appRenderDataRecord: AppRenderDataRecord,
  appParams: AppParams,
  fetchData: () => Promise<T>,
}) {
  const portal = createSelfRunModal({
    appRenderData: opts.appRenderDataRecord,
    appParams: opts.appParams,
    fetchData: opts.fetchData,
  });
  // Return a promise that never resolves to the modal is not closed
  const onSign = () => new Promise(() => undefined);
  document.body.appendChild(portal);
  return handleModalEvents(portal, onSign);
}

async function showErrorModal(error: Error) {
  const portal = createErrorModal(error);
  document.body.appendChild(portal);
  return handleModalEvents(portal, () => null);
}

export {
  showOptInModal,
  showAllowToRunModal,
  showSelfRunModal,
  showErrorModal,
};
