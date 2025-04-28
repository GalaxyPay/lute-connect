## Overview

Lute Connect is a Javascript library to securely sign transactions with Lute, an Algorand [web wallet](https://lute.app) and [Chrome extension](https://chromewebstore.google.com/detail/lute/kiaoohollfkjhikdifohdckeidckokjh).

## Installation

The package can be installed via your favorite package manager:

```sh
npm i lute-connect
```

```sh
yarn add lute-connect
```

```sh
pnpm i lute-connect
```

## API Usage

### Quick start

```js
import LuteConnect from "lute-connect";
const lute = new LuteConnect();
```

### Connect to Lute

```js
// Warning: Browser will block pop-up if user doesn't trigger lute.connect() with a button click
async function connect() {
  try {
    const genesis = await algodClient.genesis().do();
    const genesisID = `${genesis.network}-${genesis.id}`;
    const addresses = await lute.connect(genesisID);
    // TODO: handle user address selection and storage
  } catch (err) {
    console.error(`[LuteWallet] Error connecting: ${err.message}`);
    throw err;
  }
}
```

### Sign transactions

```js
// Warning: Browser will block pop-up if user doesn't trigger lute.signTxns() with a button click
async function signTransactions(txns) {
  try {
    const signedTxns = await lute.signTxns(txns);
    // TODO: handle signedTxns (e.g. submit to algodClient)
  } catch (err) {
    console.error(
      "[LuteWallet] Error signing transactions: " +
        (err instanceof SignTxnsError
          ? `${err.message} (code: ${err.code})`
          : err.message)
    );
    throw err;
  }
}
```

### Sign data

```js
// Warning: Browser will block pop-up if user doesn't trigger lute.signData() with a button click
async function authenticate() {
  try {
    const data = Buffer.from("{[jsonfields....]}").toString("base64");
    const metadata = {
      scope: ScopeType.AUTH,
      encoding: "base64",
    };
    const signerResponse = await lute.signData(data, metadata);
    // TODO: verify signerResponse
  } catch (err) {
    console.error(
      "[LuteWallet] Error signing data: " +
        (err instanceof SignDataError
          ? `${err.message} (code: ${err.code})`
          : err.message)
    );
    throw err;
  }
}
```
