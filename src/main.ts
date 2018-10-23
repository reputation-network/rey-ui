import DummySign from "rey-sdk/dist/sign-strategies/dummy";
import MetamaskSign from "rey-sdk/dist/sign-strategies/metamask";
import Factory from "rey-sdk/dist/structs/factory";
import registerComponents from "./components";
import { buildAllowToRunModal, buildErrorModal, buildOptInModal } from "./modals";
import App from "./shared/app";
import { MissingEthProviderError, UnsupportedEthNetworkError } from "./shared/errors";
import EthereumNetwork from "./shared/ethereum-networks";
import { defaultAccount, ethereumProvider, getNetwork } from "./shared/metamask";

async function handleModalSign<T>(modal: HTMLElement, onSign: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    modal.addEventListener("close", () =>
      reject(new Error("User rejected signature")));
    modal.addEventListener("sign", () => {
      onSign().then(resolve, reject);
    });
    window.document.body.appendChild(modal);
  }).then(
    (result) => { modal.remove(); return result; },
    (err) => { modal.remove(); throw err; },
  );
}

async function showError(error: Error): Promise<never> {
  const modal = buildErrorModal(error);
  return new Promise<never>((resolve, reject) => {
    modal.addEventListener("close", () => {
      reject(error);
      modal.remove();
    });
    window.document.body.appendChild(modal);
  });
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
 * @param {string} opts.fee - Verification fee that the verifier app will take
 *  (in parts per million).
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
  fee: number|string,
  nonce: number|string,
}) {
  await registerComponents();
  await assertEthereumEnabledBrowser();

  const sourceApp = await App(opts.source);
  const sourceAppManifestEntry = await sourceApp.manifestEntry();

  const subject = await defaultAccount();
  const { reader, source, verifier, expiration, fee, nonce } = opts;
  const manifest = sourceAppManifestEntry.hash;
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
  return handleModalSign(modal, async () => {
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
  return handleModalSign(modal, () =>
    Factory.buildWritePermission(_writePermission, MetamaskSign()));
}

export {
  requestAllowToRunSignature,
  requestOptInSignature,
};
