import EthereumNetwork from "../lib/ethereum-networks";

// tslint:disable:max-classes-per-file

export class MissingEthProviderError extends Error {
  constructor() {
    super("No ethereum provider was found on the current context");
  }
}

export class UnsupportedEthNetworkError extends Error {
  constructor(public readonly supportedNetwork: string) {
    super("Unsupported ethereum network selected by the ethereum provider");
    const netName = Object.keys(EthereumNetwork)
      .find((k) => EthereumNetwork[k] === supportedNetwork);
    this.supportedNetwork = netName || supportedNetwork;
  }
}

export class MissingEthProviderAccountError extends Error {
  constructor() {
    super("No default account was found on the ethereum provider");
  }
}
