import DummySign from "rey-sdk/dist/sign-strategies/dummy";
import MetamaskSign from "rey-sdk/dist/sign-strategies/metamask";
import Factory from "rey-sdk/dist/structs/factory";
import registerComponents from "./components";
import { buildAllowToRunModal, buildOptInModal } from "./modals";
import App from "./shared/app";
import { defaultAccount } from "./shared/metamask";

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

async function requestAllowToRunSignature(opts: {
  reader: string,
  source: string,
  verifier: string,
  expiration: Date | number,
  fee: number | string,
  nonce: number | string,
}) {
  await registerComponents();
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

async function requestOptInSignature(opts: {
  writer: string,
}) {
  await registerComponents();

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
