import registerComponents, { ReyLoaderComponent, ReyPortalComponent, ReyPreComponent } from "./components";
import { buildAllowToRunModal, buildErrorModal, buildOptInModal, buildSelfRunModal } from "./modals";
import App from "./shared/app";
import { MissingEthProviderAccountError, MissingEthProviderError, UnsupportedEthNetworkError } from "./shared/errors";
import EthereumNetwork from "./shared/ethereum-networks";
import * as metamask from "./shared/metamask";
import {
  buildSignedAppParams,
  buildSignedReadPermission,
  buildSignedSession,
  buildSignedWritePermission,
  buildUnsignedAppParams,
  buildUnsignedReadPermission,
  buildUnsignedSession,
  buildUnsignedWritePermission,
} from "./shared/struct-helpers";

async function handleModalActions<T>(modal: HTMLElement, onSign: () => Promise<T>): Promise<T> {
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

async function showError(error: Error): Promise<never> {
  const modal = buildErrorModal(error);
  return handleModalActions<never>(modal, () => null)
    .catch(() => Promise.reject(error));
}

async function assertEthereumEnabledBrowser() {
  const provider = await metamask.ethereumProvider();
  if (!provider) {
    await showError(new MissingEthProviderError());
  }
  const netId = await metamask.getNetwork();
  if (netId !== EthereumNetwork.RINKEBY) {
    await showError(new UnsupportedEthNetworkError());
  }
  const account = await metamask.defaultAccount();
  if (!account) {
    await showError(new MissingEthProviderAccountError());
  }
}

/**
 * @typedef {object} AllowToRunReturnType
 * @property {Session} session
 * @property {ReadPermission} readPermission
 * @property {ReadPermission[]} extraReadPermissions
 */

/**
 * Presents the user with an "allow-to-run" kind of modal for the provided
 * options. This function returns a promise that is resolved once the user
 * has been informed about what is about to sign and has signed each message.
 *
 * @param {string} opts.reader - Address of who is going to read the
 *  information about the user. This is typically your address.
 * @param {string} opts.source - Address of what REY app reader is requesting
 *  access to.
 * @param {number} opts.expiration - Unix Timestamp of when the user permission
 *  expires (in seconds!).
 * @param {string} opts.nonce - Unique identifier for this data exchange
 * @param {string} opts.verifier - Address of the REY verifier that will
 *  supervise any transaction related with this session. See Session.verifier
 * @returns {AllowToRunReturnType}
 *
 * @see https://rey.readthedocs.io/en/latest/contents/reference/permissions.html#read-permission
 * @see https://rey.readthedocs.io/en/latest/contents/reference/transactions.html#session
 */
async function requestAllowToRunPermissions(opts: {
  reader: string,
  source: string,
  verifier?: string,
  expiration?: number,
  nonce?: number|string,
}) {
  await registerComponents();
  await assertEthereumEnabledBrowser();
  const [_session, [_readPermission, ..._extraReadPermissions]] = await Promise.all([
    buildUnsignedSession(opts),
    buildUnsignedReadPermission(opts),
  ]);
  const modal = buildAllowToRunModal(_session, _readPermission,
    ..._extraReadPermissions);
  return handleModalActions(modal, async () => {
    const [session, [readPermission, extraReadPermissions]] = await Promise.all([
      buildSignedSession(_session),
      buildSignedReadPermission(_readPermission),
    ]);
    return { session, readPermission, extraReadPermissions };
  });
}

/**
 * Presents the user with an "opt-in" kind of modal for the provided
 * options. This function returns a promise that is resolved once the user
 * has been informed about what is about to sign and has signed each message.
 *
 * @param {string} opts.reader - Address of who is going to share the user's
 *  info via REY protocol. This is typically your address.
 * @returns {WritePermission}
 *
 * @see https://rey.readthedocs.io/en/latest/contents/reference/permissions.html#write-permission
 */
async function requestWritePermission(opts: { writer: string }) {
  await registerComponents();
  await assertEthereumEnabledBrowser();

  const app = await App(opts.writer);
  await app.manifest();
  const _writePermission = await buildUnsignedWritePermission(opts);
  const modal = buildOptInModal(_writePermission);
  return handleModalActions(modal, () =>
    buildSignedWritePermission(_writePermission));
}

async function openSelfRunPrompt(opts: { source: string }) {
  await registerComponents();
  await assertEthereumEnabledBrowser();
  const _appParams = await buildUnsignedAppParams(opts);
  const modal = buildSelfRunModal(_appParams);
  return handleModalActions(modal, async () => {
    const appParams = await buildSignedAppParams(opts);
    modal.querySelector("[slot=preface]").remove();
    (modal.querySelector("[slot=footer]") as HTMLElement).style.display = "none";
    const loader = new ReyLoaderComponent("retrieving your data...");
    loader.slot = "preface";
    modal.appendChild(loader);
    try {
      const app = await App(opts.source);
      const result = await app.query(appParams);
      const pre = new ReyPreComponent(result);
      pre.slot = "preface";
      modal.appendChild(pre);
    } catch (e) {
      const pre = new ReyPreComponent(e);
      pre.slot = "preface";
      modal.appendChild(pre);
    } finally {
      loader.remove();
    }
    // Return a promise that never completes, so the modal stays open
    // until closed, which is treated as a thrown error
    return new Promise(() => undefined);
  }).then(() => undefined, () => undefined);
}

export {
  openSelfRunPrompt,
  requestAllowToRunPermissions,
  requestWritePermission,
};
