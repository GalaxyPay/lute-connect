## Overview

Lute Connect is a Javascript library to securely sign transactions with Lute, an Algorand [web wallet](https://lute.app) and [Chrome extension](https://chromewebstore.google.com/detail/lute/kiaoohollfkjhikdifohdckeidckokjh).

## Installation

The package can be installed via npm:

```bash
npm i lute-connect
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
  } catch (err: any) {
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
  } catch (err: any) {
    console.error(
      '[LuteWallet] Error signing transactions: ' +
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
    // TODO: define (signingData: StdSigData) and (metadata: StdSignMetadata) per ARC60
    const signerResponse = await lute.signData(signingData, metadata);
    // TODO: verify signerResponse.signature
  } catch (err: any) {
    console.error(
      '[LuteWallet] Error signing data: ' +
        (err instanceof SignDataError
          ? `${err.message} (code: ${err.code})`
          : err.message)
    );
    throw err;
  }
}
```
