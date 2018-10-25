import DummySign from "rey-sdk/dist/sign-strategies/dummy";
import MetamaskSign from "rey-sdk/dist/sign-strategies/metamask";
import Factory from "rey-sdk/dist/structs/factory";
import registerComponents, { ReyLoaderComponent, ReyPortalComponent } from "./components";
import { buildAllowToRunModal, buildErrorModal, buildOptInModal, buildSelfRunModal } from "./modals";
import App from "./shared/app";
import { MissingEthProviderError, UnsupportedEthNetworkError } from "./shared/errors";
import EthereumNetwork from "./shared/ethereum-networks";
import { defaultAccount, ethereumProvider, getNetwork } from "./shared/metamask";

async function handleModalActions<T>(modal: HTMLElement, onSign: () => Promise<T>): Promise<T> {
  const portal = ReyPortalComponent.wrap(modal);
  return new Promise<T>((resolve, reject) => {
    const _reject = () => reject(new Error("User rejected signature"));
    portal.addEventListener("close", _reject);
    modal.addEventListener("close", _reject);
    // Allow escape to be used to close the modal
    document.addEventListener("keydown",
      (ev) => ev.keyCode === 27 && _reject(), { once: true });
    modal.addEventListener("sign", () => {
      Promise.resolve(onSign()).then(resolve, reject);
    }, { once: true });
    window.document.body.appendChild(portal);
  }).then(
    (result) => { portal.remove(); return result; },
    (err) => { portal.remove(); throw err; },
  );
}

async function showError(error: Error): Promise<never> {
  const modal = buildErrorModal(error);
  return handleModalActions<never>(modal, () => null);
}

async function assertEthereumEnabledBrowser() {
  const provider = await ethereumProvider();
  if (!provider) {
    await showError(new MissingEthProviderError());
  }
  const netId = await getNetwork();
  if (netId !== EthereumNetwork.RINKEBY) {
    await showError(new UnsupportedEthNetworkError());
  }
}

async function _<T extends () => Promise<R>, R>(fn: T) {
  await registerComponents();
  await assertEthereumEnabledBrowser();
  return fn();
}

/**
 * @typedef {object} AllowToRunReturnnType
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
 * @returns {AllowToRunReturnnType}
 *
 * @see https://rey.readthedocs.io/en/latest/contents/reference/permissions.html#read-permission
 * @see https://rey.readthedocs.io/en/latest/contents/reference/transactions.html#session
 */
async function requestAllowToRunSignature(opts: {
  reader: string,
  source: string,
  verifier: string,
  expiration: number,
  nonce: number|string,
}) {
  await registerComponents();
  await assertEthereumEnabledBrowser();

  const sourceApp = await App(opts.source);
  const verifierApp = await App(opts.verifier);
  const sourceAppManifestEntry = await sourceApp.manifestEntry();
  const verifierManifest = await verifierApp.manifest();

  const subject = await defaultAccount();
  const { reader, source, verifier, expiration, nonce } = opts;
  const manifest = sourceAppManifestEntry.hash;
  const fee = verifierManifest.verifier_fee || 0;
  const partialExtraReadPermissions = await sourceApp.extraReadPermissions();
  const sign = DummySign();
  const [_session, _readPermission, _extraReadPermissions] = await Promise.all([
    Factory.buildSession({ subject, verifier, fee, nonce }, sign),
    Factory.buildReadPermission({ reader, source, subject, expiration, manifest }, sign),
    Promise.all(partialExtraReadPermissions.map((rp) =>
      Factory.buildReadPermission({ ...rp, subject, expiration }, sign))),
  ]);

  const modal = buildAllowToRunModal(_session, _readPermission,
    ..._extraReadPermissions);
  return handleModalActions(modal, async () => {
    const metaSign = MetamaskSign();
    const [session, readPermission, extraReadPermissions] = await Promise.all([
      Factory.buildSession(_session, metaSign),
      Factory.buildReadPermission(_readPermission, metaSign),
      Promise.all(_extraReadPermissions.map((rp) =>
        Factory.buildReadPermission({ ...rp, subject, expiration }, metaSign))),
    ]);
    return { session, readPermission, extraReadPermissions };
  });
}

async function requestSelfRunSignature(opts: {
  source: string,
  verifier: string,
  fee: number | string,
  nonce: number | string,
}) {
  await registerComponents();
  await assertEthereumEnabledBrowser();

  const sourceApp = await App(opts.source);
  const sourceAppManifestEntry = await sourceApp.manifestEntry();

  const subject = await defaultAccount();
  const reader = subject;
  const expiration = Math.floor(Date.now() / 1000) + 60 * 5;
  const { source, verifier, fee, nonce } = opts;
  const manifest = sourceAppManifestEntry.hash;
  const value = 0; // FIXME: Where do we take this value from?
  const partialExtraReadPermissions = await sourceApp.extraReadPermissions();
  const sign = DummySign();
  const [_session, _readPermission, _extraReadPermissions] = await Promise.all([
    Factory.buildSession({ subject, verifier, fee, nonce }, sign),
    Factory.buildReadPermission({ reader, source, subject, expiration, manifest }, sign),
    Promise.all(partialExtraReadPermissions.map((rp) =>
      Factory.buildReadPermission({ ...rp, subject, expiration }, sign))),
  ]);
  const _request = await Factory.buildRequest({
    readPermission: _readPermission,
    session: _session,
    value,
    counter: Date.now(),
  }, sign);
  const modal = buildSelfRunModal(_request, ..._extraReadPermissions);
  return handleModalActions(modal, async () => {
    const metaSign = MetamaskSign();
    const appParams = await Factory.buildAppParams({
      request: _request,
      extraReadPermissions: _extraReadPermissions,
    }, metaSign);
    const loader = new ReyLoaderComponent();
    loader.slot = "preface";
    modal.querySelector("[slot=preface]").remove();
    modal.appendChild(loader);
    const result = await sourceApp.query(appParams);
    loader.remove();
    const pre = document.createElement("pre");
    pre.innerText = JSON.stringify(result, null, 2);
    pre.slot = "preface";
    loader.remove();
    modal.appendChild(pre);
    return new Promise(() => null);
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
async function requestOptInSignature(opts: {
  writer: string,
}) {
  await registerComponents();
  await assertEthereumEnabledBrowser();

  const subject = await defaultAccount();
  const writer = opts.writer;
  const _writePermission = await Factory.buildWritePermission(
    { subject, writer }, DummySign());

  const modal = buildOptInModal(_writePermission);
  return handleModalActions(modal, () =>
    Factory.buildWritePermission(_writePermission, MetamaskSign()));
}

export {
  requestAllowToRunSignature,
  requestSelfRunSignature,
  requestOptInSignature,
};
