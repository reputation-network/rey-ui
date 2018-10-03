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

async function accounts() {
  const ethProvider = await ethereumProvider();
  return new Promise((resolve, reject) => {
    const cb = (err, data) => {
      err ? reject(err) : resolve(data.result);
    };
    ethProvider.sendAsync({ method: "eth_accounts", params: [] }, cb);
  });
}

async function defaultAccount() {
  const accs = await accounts();
  return accs[0] || null;
}

async function personalSign(message: any, address: string) {
  const ethProvider = await ethereumProvider();
  return new Promise((resolve, reject) => {
    const params = [message, address, null];
    const cb = (err, data) => {
      err ? reject(err) : resolve(data.result);
    };
    ethProvider.sendAsync({ method: "personal_sign", params }, cb);
  });
}

export {
  ethereumProvider,
  accounts,
  defaultAccount,
  personalSign,
};
