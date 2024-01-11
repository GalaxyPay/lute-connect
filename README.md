## Overview

Lute Connect is a Javascript library to securely sign transactions with [Lute](https://lute.app), an Algorand, Ledger-only web wallet.

## Installation

The package can be installed via npm:

```
npm i lute-connect
```

## API Usage

### Quick start

```js
import Lute from "lute-connect";
const lute = new Lute();
const APP_NAME = "YourAppName";
```

### Connect to Lute

```js
// Warning: Browser will block pop-up if user doesn't trigger lute.connect() with a button click
async function luteConnect() {
  try {
    const genesis = await algodClient.genesis().do();
    const genesisID = `${genesis.network}-${genesis.id}`;
    const addresses = await lute.connect(genesisID, APP_NAME);
    // handle user address selection and storage
  } catch (err) {
    console.error(err);
  }
}
```

### Sign transaction

```js
// Warning: Browser will block pop-up if user doesn't trigger lute.signTxns() with a button click
async function signTransactions(txns) {
  try {
    const opts = { _luteSiteName: APP_NAME };
    const signedTxns = await lute.signTxns(txns, opts);
    // handle signedTxns (e.g. submit to algodClient)
  } catch (err) {
    console.error(err);
  }
}
```
