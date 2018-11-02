import DummySign from "rey-sdk/dist/sign-strategies/dummy";
import MetamaskSign from "rey-sdk/dist/sign-strategies/metamask";
import Factory from "rey-sdk/dist/structs/factory";
import { SignStrategy } from "rey-sdk/dist/types";
import EncryptionKey from "rey-sdk/dist/utils/encryption-key";
import App from "./app";
import { defaultAccount } from "./metamask";

function _expiration(opts: Pick<IReadPermissionOpts, "expiration">) {
  if (!opts.expiration) {
    const hours = 1;
    return Math.floor(Date.now() / 1000 + hours * 3600);
  }
  return opts.expiration;
}

function _nonce(opts: Pick<ISessionOpts, "nonce">) {
  return opts.nonce || Date.now(); // FIXME: This is not a good nonce :(
}

function _verifier(opts: Pick<ISessionOpts, "verifier">) {
  return opts.verifier || "0xd91f44fee5e3b81f61b4e7ab7fddf3f4caab1220";
}

async function _subject(opts: Pick<IReadPermissionOpts, "subject">) {
  return (opts.subject || defaultAccount());
}

function _counter(opts: Pick<IRequestOpts, "counter">) {
  return opts.counter || Date.now();
}

async function _value(opts: IRequestOpts) {
  return 0; // FIXME: This should be read from the app manifest
}

interface IReadPermissionOpts {
  reader: string;
  source: string;
  subject?: string;
  expiration?: number|string;
}

export async function buildReadPermission(
  opts: IReadPermissionOpts,
  sign: SignStrategy,
) {
  const { reader, source } = opts;
  const subject = await _subject(opts);
  const expiration = _expiration(opts);
  const app = await App(source);
  const manifest = (await app.manifestEntry()).hash;
  const extraReadPermissions = (await app.extraReadPermissions()).map((rp) =>
    Factory.buildReadPermission({ ...rp, subject, expiration }, DummySign()));
  return Promise.all([
    Factory.buildReadPermission({
      reader, source, subject, expiration, manifest }, sign),
    ...extraReadPermissions,
  ]);
}

export function buildUnsignedReadPermission(opts: IReadPermissionOpts) {
  return buildReadPermission(opts, DummySign());
}

export function buildSignedReadPermission(opts: IReadPermissionOpts) {
  return buildReadPermission(opts, MetamaskSign());
}

interface ISessionOpts {
  subject?: string;
  verifier?: string;
  nonce?: number | string;
}

export async function buildSession(opts: ISessionOpts, sign: SignStrategy) {
  const verifier = _verifier(opts);
  const nonce = _nonce(opts);
  const subject = await _subject(opts);
  const fee = await App(verifier).then((v) => v.manifest()).then((m) => m.verifier_fee);
  return Factory.buildSession({ subject, nonce, verifier, fee }, sign);
}

export function buildUnsignedSession(opts: ISessionOpts) {
  return buildSession(opts, DummySign());
}

export function buildSignedSession(opts: ISessionOpts) {
  return buildSession(opts, MetamaskSign());
}

interface IWritePermissionOpts {
  subject?: string;
  writer: string;
}

export async function buildWritePermission(
  opts: IWritePermissionOpts,
  sign: SignStrategy,
) {
  const { writer } = opts;
  const subject = await _subject(opts);
  return Factory.buildWritePermission({ subject, writer }, sign);
}

export function buildUnsignedWritePermission(opts: IWritePermissionOpts) {
  return buildWritePermission(opts, DummySign());
}

export function buildSignedWritePermission(opts: IWritePermissionOpts) {
  return buildWritePermission(opts, MetamaskSign());
}

interface IRequestOpts {
  value?: number;
  counter?: number|string;
}
type AppParamsOpts = &
  IRequestOpts &
  ISessionOpts &
  Pick<IReadPermissionOpts, Exclude<keyof IReadPermissionOpts, "reader">> &
  { encryptionKey?: any };

export async function buildEncryptionKey(opts: any, sign: SignStrategy) {
  if (!opts.encryptionKey) {
    const encryptionKey = new EncryptionKey();
    await encryptionKey.createPair();
    return Factory.buildEncryptionKey(encryptionKey, sign);
  } else {
    return Factory.buildEncryptionKey(opts.encryptionKey, sign);
  }
}

export async function buildAppParams(opts: AppParamsOpts, sign: SignStrategy) {
  const subject = await _subject(opts);
  const value = await _value(opts);
  const counter = _counter(opts);
  const [session, [readPermission, ...extraReadPermissions], encryptionKey] = await Promise.all([
    buildSession(opts, sign),
    buildReadPermission({ ...opts, reader: subject } as IReadPermissionOpts, sign),
    buildEncryptionKey(opts, sign),
  ]);
  return Factory.buildAppParams({
    request: { readPermission, session, value, counter },
    extraReadPermissions,
    encryptionKey,
  }, sign);
}

export function buildUnsignedAppParams(opts: AppParamsOpts) {
  return buildAppParams(opts, DummySign());
}

export function buildSignedAppParams(opts: AppParamsOpts) {
  return buildAppParams(opts, MetamaskSign());
}
