import { Proof, ReadPermission, Request, Session, WritePermission } from "rey-sdk/dist/structs";
import { dummySignature, isAddress, isNumeric, isRsvSignature, normalizeSignature } from "rey-sdk/dist/utils";

const SIGNATURE_LENGTH = 3;
const UNSIGNED_READ_PERMISSION_LENGTH = 4;
const READ_PERMISSION_LENGTH = 4 + SIGNATURE_LENGTH;
const UNSIGNED_SESSION_LENGTH = 4;
const SESSION_LENGTH = 4 + SIGNATURE_LENGTH;
const UNSIGNED_WRITE_PERMISSION_LENGTH = 2;
const WRITE_PERMISSION_LENGTH = 2 + SIGNATURE_LENGTH;
const UNSIGNED_REQUEST_LENGTH = 2 +
  UNSIGNED_READ_PERMISSION_LENGTH + SIGNATURE_LENGTH +
  UNSIGNED_SESSION_LENGTH + SIGNATURE_LENGTH;
const UNSIGNED_PROOF_LENGTH = 0 +
  UNSIGNED_READ_PERMISSION_LENGTH + SIGNATURE_LENGTH +
  UNSIGNED_SESSION_LENGTH + SIGNATURE_LENGTH;

function subarray(data: any[], start: number, length: number) {
  return data.slice(start, start + length);

}
export function isFlatSignature(data: any, offset: number = 0) {
  return isRsvSignature(subarray(data, offset, SIGNATURE_LENGTH));
}

export function isFlatUnsignedReadPermission(data: any, offset: number = 0) {
  let idx = 0;
  data = subarray(data, offset, UNSIGNED_READ_PERMISSION_LENGTH);
  return Array.isArray(data) && data.length === UNSIGNED_READ_PERMISSION_LENGTH &&
    isAddress(data[idx++]) && isAddress(data[idx++]) &&
    isAddress(data[idx++]) && isNumeric(data[idx++]);
}

export function isFlatReadPermission(data: any, offset: number = 0) {
  return isFlatUnsignedReadPermission(data, offset)
    && isFlatSignature(data, offset + UNSIGNED_READ_PERMISSION_LENGTH);
}

export function isFlatUnsignedSession(data: any, offset: number = 0) {
  let idx = 0;
  data = subarray(data, offset, UNSIGNED_SESSION_LENGTH);
  return Array.isArray(data) &&
    isAddress(data[idx++]) && isAddress(data[idx++]) &&
    isNumeric(data[idx++]) && isNumeric(data[idx++]);
}

export function isFlatSession(data: any, offset: number = 0) {
  return isFlatUnsignedSession(data, offset)
    && isFlatSignature(data, offset + UNSIGNED_SESSION_LENGTH);
}

export function isFlatUnsignedWritePermission(data: any[], offset: number = 0) {
  let idx = 0;
  data = subarray(data, offset, UNSIGNED_WRITE_PERMISSION_LENGTH);
  return Array.isArray(data) && isAddress(data[idx++]) && isAddress(data[idx++]);
}

export function isFlatWritePermission(data: any, offset: number = 0) {
  return isFlatUnsignedWritePermission(data, offset)
    && isFlatSignature(data, offset + UNSIGNED_WRITE_PERMISSION_LENGTH);
}

export function isFlatUnsignedRequest(data: any, offset: number = 0) {
  let idx = 0;
  data = subarray(data, offset, UNSIGNED_REQUEST_LENGTH);
  return Array.isArray(data) &&
    isFlatReadPermission(data, idx) && (idx += READ_PERMISSION_LENGTH) &&
    isFlatSession(data, idx) && (idx += SESSION_LENGTH) &&
    isNumeric(data[idx++]) && isNumeric(data[idx++]);
}

export function isFlatRequest(data: any, offset: number = 0) {
  return isFlatUnsignedSession(data, offset)
    && isFlatSignature(data, offset + UNSIGNED_REQUEST_LENGTH);
}

export function isFlatUnsignedProof(data: any, offset: number = 0) {
  let idx = 0;
  data = subarray(data, offset, UNSIGNED_REQUEST_LENGTH);
  return Array.isArray(data) &&
    isFlatWritePermission(data, idx) && (idx += WRITE_PERMISSION_LENGTH) &&
    isFlatSession(data, idx) && (idx += SESSION_LENGTH) &&
    isFlatSignature(data, idx);
}

export function isFlatProof(data: any, offset: number = 0) {
  return isFlatUnsignedProof(data, offset)
    && isFlatSignature(data, offset + UNSIGNED_PROOF_LENGTH);
}

export function extractSignature(data: any[], offset: number = 0) {
  const signature = subarray(data, offset, SIGNATURE_LENGTH);
  return isRsvSignature(signature) ? signature : normalizeSignature(dummySignature());
}

export function recoverStructure(data: any) {
  if (isFlatUnsignedRequest(data) || isFlatRequest(data)) {
    const reqFieldCount = UNSIGNED_REQUEST_LENGTH - (READ_PERMISSION_LENGTH + SESSION_LENGTH);
    let idx = 0;
    return new Request([
      [ ...data.slice(idx, idx += UNSIGNED_READ_PERMISSION_LENGTH),
        data.slice(idx, idx += SIGNATURE_LENGTH) ],
      [ ...data.slice(idx, idx += UNSIGNED_SESSION_LENGTH),
        data.slice(idx, idx += SIGNATURE_LENGTH) ],
      ...data.slice(idx, idx += reqFieldCount),
      extractSignature(data, idx),
    ]);
  } else if (isFlatUnsignedProof(data) || isFlatProof(data)) {
    let idx = 0;
    return new Proof([
      [...data.slice(idx, idx += UNSIGNED_WRITE_PERMISSION_LENGTH),
        data.slice(idx, idx += SIGNATURE_LENGTH)],
      [...data.slice(idx, idx += UNSIGNED_SESSION_LENGTH),
      data.slice(idx, idx += SIGNATURE_LENGTH)],
      extractSignature(data, idx),
    ]);
  } else if (isFlatUnsignedReadPermission(data) || isFlatReadPermission(data)) {
    let idx = 0;
    return new ReadPermission([
      ...data.slice(idx, idx += UNSIGNED_READ_PERMISSION_LENGTH),
      extractSignature(data, idx),
    ]);
  } else if (isFlatUnsignedSession(data) || isFlatSession(data)) {
    let idx = 0;
    return new Session([
      ...data.slice(idx, idx += UNSIGNED_SESSION_LENGTH),
      extractSignature(data, idx),
    ]);
  } else if (isFlatUnsignedWritePermission(data) || isFlatWritePermission(data)) {
    let idx = 0;
    return new WritePermission([
      ...data.slice(idx, idx += UNSIGNED_WRITE_PERMISSION_LENGTH),
      extractSignature(data, idx),
    ]);
  } else {
    throw new TypeError(`Couldn't find a suitable REY struct for data ${data}`);
  }
}
