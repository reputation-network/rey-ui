import * as metamaskAddon from "./metamask-addon";
import { ReySdk } from "./rey-sdk";
import { DummySign, EncryptionKey, Factory, SignStrategy, toChecksumAddress } from "./rey-sdk";

interface ReySdkHelpersConfig {
  sdk: ReySdk;
  signStrategy: SignStrategy;
  defaultVerifier?: string;
}

function createReySdkHelpers(config: ReySdkHelpersConfig) {
  const defaults = {
    _expiration(opts: Pick<IReadPermissionOpts, "expiration">) {
      if (!opts.expiration) {
        const hours = 1;
        return Math.floor(Date.now() / 1000 + hours * 3600);
      }
      return opts.expiration;
    },

    _nonce(opts: Pick<ISessionOpts, "nonce">) {
      // FIXME: This is not a good nonce :(
      return opts.nonce || Date.now();
    },

    _verifier(opts: Pick<ISessionOpts, "verifier">) {
      return opts.verifier
        || config.defaultVerifier
        || "0xd91f44fee5e3b81f61b4e7ab7fddf3f4caab1220";
    },

    _subject(opts: Pick<IReadPermissionOpts, "subject">) {
      return (opts.subject || metamaskAddon.defaultAccount());
    },

    _counter(opts: Pick<IRequestOpts, "counter">) {
      return opts.counter || Date.now();
    },

    async _value(opts: IRequestOpts & Pick<IReadPermissionOpts, "source">) {
      const manifest = await config.sdk.getAppManifest(opts.source);
      return manifest.app_reward || 0;
    },
  };
  const helpers = {
    async buildReadPermission(opts: IReadPermissionOpts, sign: SignStrategy) {
      const { reader, source } = opts;
      const subject = await defaults._subject(opts);
      const expiration = defaults._expiration(opts);
      const [manifestHash, extraReadPermissions] = await Promise.all([
        config.sdk.getAppManifestEntry(source)
          .then((manifestEntry) => manifestEntry.hash),
        config.sdk.getAppExtraReadPermissions(source)
          .then((extraRp) => extraRp.map((rp) =>
            Factory.buildReadPermission({...rp, subject, expiration}, DummySign()))),
      ]);
      return Promise.all([
        Factory.buildReadPermission({
          reader, source, subject, expiration,
          manifest: manifestHash,
        }, sign),
        ...extraReadPermissions,
      ]);
    },

    async buildSession(opts: ISessionOpts, sign: SignStrategy) {
      const verifier = defaults._verifier(opts);
      const nonce = defaults._nonce(opts);
      const subject = await defaults._subject(opts);
      const fee = await config.sdk.getAppManifest(verifier).then((m) => m.verifier_fee);
      return Factory.buildSession({ subject, nonce, verifier, fee }, sign);
    },

    async buildWritePermission(opts: IWritePermissionOpts, sign: SignStrategy) {
      const { writer } = opts;
      const subject = await defaults._subject(opts);
      return Factory.buildWritePermission({ subject, writer }, sign);
    },

    async buildEncryptionKey(opts: AppParamsOpts, sign: SignStrategy) {
      if (!opts.encryptionKey) {
        const encryptionKey = new EncryptionKey();
        await encryptionKey.createPair();
        return Factory.buildEncryptionKey(encryptionKey, sign);
      } else {
        return Factory.buildEncryptionKey(opts.encryptionKey, sign);
      }
    },

    async buildAppParams(opts: AppParamsOpts, sign: SignStrategy) {
      const subject = await defaults._subject(opts);
      const reader = subject;
      const value = await defaults._value(opts);
      const counter = defaults._counter(opts);
      const [session, [readPermission, ...extraReadPermissions], encryptionKey] = await Promise.all([
        helpers.buildSession(opts, sign),
        helpers.buildReadPermission({ ...opts, reader } as IReadPermissionOpts, sign),
        helpers.buildEncryptionKey(opts, sign),
      ]);
      return Factory.buildAppParams({
        request: { readPermission, session, value, counter },
        extraReadPermissions,
        encryptionKey,
      }, sign);
    },
  };
  const signHelpers = {
    buildUnsignedSession: unsigned(helpers.buildSession),
    buildUnsignedReadPermission: unsigned(helpers.buildReadPermission),
    buildUnsignedWritePermission: unsigned(helpers.buildWritePermission),
    buildUnsignedAppParams: unsigned(helpers.buildAppParams),
    buildSignedSession: signed(helpers.buildSession, config.signStrategy),
    buildSignedReadPermission: signed(helpers.buildReadPermission, config.signStrategy),
    buildSignedWritePermission: signed(helpers.buildWritePermission, config.signStrategy),
    buildSignedAppParams: signed(helpers.buildAppParams, config.signStrategy),
  };
  const renderHelpers = {
    async failsafeGetManifest(address: string) {
      try {
        return config.sdk.getAppManifest(address);
      } catch (e) {
        return null;
      }
    },

    async buildAppRenderData(address: string): Promise<AppRenderData|null> {
      const manifest = await renderHelpers.failsafeGetManifest(address);
      return manifest === null ? null : {
        address: manifest.address,
        name: manifest.name,
        description: manifest.description,
        iconUrl: manifest.picture_url,
      };
    },

    async buildAppRenderDataRecord(...addresses: string[]) {
      const renderDatas = await Promise.all(addresses.map(renderHelpers.buildAppRenderData));
      return renderDatas.reduce<AppRenderDataRecord>((record, renderData) => {
        if (renderData) {
          const address = renderData.address;
          record[toChecksumAddress(address)] = renderData;
          record[address.toLowerCase()] = renderData;
          record[address.toUpperCase()] = renderData;
        }
        return record;
      }, {});
    },
  };

  return {
    ...helpers,
    ...signHelpers,
    ...renderHelpers,
  };
}

type StructBuilder<P, R> = (opts: P, sign: SignStrategy) => Promise<R>;

function unsigned<P, R>(builder: StructBuilder<P, R>) {
  return (opts: P) => builder(opts, DummySign());
}
function signed<P, R>(builder: StructBuilder<P, R>, signStrategy?: SignStrategy) {
  return (opts: P) => builder(opts, signStrategy);
}

interface IReadPermissionOpts {
  reader: string;
  source: string;
  subject?: string;
  expiration?: number | string;
}

interface ISessionOpts {
  subject?: string;
  verifier?: string;
  nonce?: number | string;
}

interface IRequestOpts {
  value?: number;
  counter?: number | string;
}

interface IWritePermissionOpts {
  subject?: string;
  writer: string;
}

type AppParamsOpts = &
IRequestOpts &
ISessionOpts &
Pick<IReadPermissionOpts, Exclude<keyof IReadPermissionOpts, "reader">> &
{ encryptionKey?: EncryptionKey };

interface AppRenderData {
  name: string;
  address: string;
  description: string;
  iconUrl: string;
}

export type AppRenderDataRecord = Record<string, AppRenderData>;

export default createReySdkHelpers;
