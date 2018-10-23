// tslint:disable:max-classes-per-file

export class MissingEthProviderError extends Error {
  constructor() {
    super("No ethereum provider was found on the current context");
  }
}

export class UnsupportedEthNetworkError extends Error {
  constructor() {
    super("Unsupported ethereum network selected by the ethereum provider");
  }
}
