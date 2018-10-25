# REY Permissions UI
JavaScript browser library for signing REY permissions
> :warning: **WARNING:** This project is still in alpha, so the lib interface might change

## Usage

### With module bundler
```
$ yarn add reputation-network/rey-sdk-js reputation-network/rey-ui
```

```es6
import { App, Factory } from "rey-sdk";
import { requestAllowToRunSignature, requestOptInSignature } from "rey-ui";

async function requestAccessToApp() {
  // Create a client for reading the app
  const app = new App("0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
  // Prompt the user for his permission for you to read some info about him via an app
  const params = await requestAllowToRunSignature({
    source: app.address,
    reader: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", // Your address
    verifier: "0xcccccccccccccccccccccccccccccccccccccccc", // Verifier for the transactions about this user
    fee: 0, // How much should the verifier be paid for its services?
    nonce: Date.now(), // Unique identifier for the transaction
  });
  // Build an app params object that can later be used to read the app
  const appParams = await Factory.buildAppParams({
    request: { session: params.session, readPermission: params.readPermission },
    extraReadPermissions: params.extraReadPermissions
  });
  // Query the app
  const appResult = await app.query(appParams);
  console.log(appResult);
  alert(appResult);
}
```

### Without a bundler

First inlcude the REY ui script file in your page, provided by [jsDelivr](https://www.jsdelivr.com)
```html
<script src="https://cdn.jsdelivr.net/gh/reputation-network/rey-sdk-js@latest/dist/rey-sdk.js"></script>
<script src="https://cdn.jsdelivr.net/gh/reputation-network/rey-ui@latest/dist/rey-ui.js"></script>
```

Then you can follow the bundler example but translating the imports into the following:
```js
const App = window.REY.App;
const Factory = window.REY.Structs.Factory;
const requestAllowToRunSignature = window.REY.ui.requestAllowToRunSignature;
const requestOptInSignature = window.REY.ui.requestOptInSignature;
```

## Development 
```
$ yarn install
$ yarn start:dev
```

## LICENSE
MIT © 2018 [Reputation Network](./LICENSE)
