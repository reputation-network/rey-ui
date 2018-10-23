type EthereumEnabledWindow = Window & {
  ethereum?: any; // FIXME: Add proper typings here
  web3?: any; // FIXME: Add proper typings here
};

function _window(): EthereumEnabledWindow {
  if (typeof window !== "undefined") {
    return window as EthereumEnabledWindow;
  } else {
    throw new Error("No window found");
  }
}

async function ethereumProvider() {
  const window = _window();
  if (window.ethereum) {
    await window.ethereum.enable();
    return window.ethereum;
  } else if (window.web3) {
    return window.web3.currentProvider;
  } else {
    return null;
  }
}

async function _sendAsync<T= any>(method: string, params: any[] = []): Promise<T> {
  const ethProvider = await ethereumProvider();
  return new Promise<T>((resolve, reject) => {
    const cb = (err, data) => {
      err ? reject(err) : resolve(data.result);
    };
    ethProvider.sendAsync({ method, params }, cb);
  });
}

async function accounts() {
  const accs = await _sendAsync("eth_accounts");
  return accs;
}

async function defaultAccount() {
  const accs = await accounts();
  return accs[0] || null;
}

async function personalSign(message: any, address: string) {
  const params = [message, address, null];
  const signature = await _sendAsync("personal_sign", params);
  return signature;
}

async function getNetwork() {
  const netId = await _sendAsync("net_version");
  return netId;
}

export {
  ethereumProvider,
  accounts,
  defaultAccount,
  personalSign,
  getNetwork,
};
