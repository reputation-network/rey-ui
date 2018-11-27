# REY Permissions UI
JavaScript browser library for signing REY permissions
> :warning: **WARNING:** This project is still in alpha, so the lib interface might change

## Usage

### With module bundler
```
$ yarn add reputation-network/rey-sdk-js reputation-network/rey-ui
```

```es6
import createReyUi from "rey-ui";

// Create a new REY UI instance with the testnet defaults (chainId, contract addressess...)
const reyUi = createReyUi("test");

// Ask the user for a write permission that allows YOU as an app to provide information
// about that user on the reputation network. 
const writePermission = await reyUi.requestWritePermission({
  // YOUR app address, which will provide the information of the user
  // after consent is given.
  writer: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
});
// Ssend the writePermission to a server where it can be later user when providing
// information about the user.

// Ask the user for a read permission (and related structs) that allows YOU to read
// what an app on the reputation network has about said user
const { session, readPermission, extraReadPermissions } = await reyUi.requestAllowToRunPermissions({
  // YOUR app address, the one who is REQUESTING the data
  reader: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  // The app that will provide the data about the user (if any)
  source: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
});
// Send the readPermission, session and extraReadPermissions to a server and build
// there an appParams that can be used to query the app (source)

// Ask the user to read its own data from a given app(source).
// YOU WILL NOT HAVE ACCESS TO THE DATA ITSELF USING THIS METHOD
await reyUi.openSelfRunPrompt({ source: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" })
// The user has finished reading its data or has cancelled it, you will never know...
```

### Without a bundler

Inlcude the REY ui script file in your page, provided by CDN [jsDelivr](https://www.jsdelivr.com)
```html
<script src="https://cdn.jsdelivr.net/gh/reputation-network/rey-ui@latest/dist/rey-ui.js"></script>
```

Then you can follow the bundler example but translating the import as follows:
```js
const createReyUi = window.REY.ui;
```

## Development 
```
$ yarn install
$ yarn start:dev
```

## LICENSE
MIT © 2018 [Reputation Network](./LICENSE)
