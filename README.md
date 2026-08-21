## Overview

Lute Connect is a Javascript library to securely sign transactions with Lute, an Algorand [web wallet](https://lute.app) and [Chrome extension](https://chromewebstore.google.com/detail/lute/kiaoohollfkjhikdifohdckeidckokjh).

## Installation

The package can be installed via your favorite package manager:

```sh
npm i @galaxypay/lute-connect
```

```sh
yarn add @galaxypay/lute-connect
```

```sh
pnpm add @galaxypay/lute-connect
```

## API Usage

### Quick start

```js
import LuteConnect from "@galaxypay/lute-connect";
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

```ts
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
          : err.message),
    );
    throw err;
  }
}
```

### Sign data

```ts
// Warning: Browser will block pop-up if user doesn't trigger lute.signData() with a button click
import { Address } from "algosdk";
import { canonify } from "canonify";

async function authenticate() {
  try {
    const domain = location.host;
    const acctInfo = await algodClient.accountInformation(activeAddress).do();
    const siwaRequest: Siwa = {
      domain,
      chain_id: activeNetworkConfig.caipChainId || "algorand",
      account_address: activeAddress,
      type: "ed25519",
      statement:
        "Put your own statement here, for example: I accept the ExampleOrg Terms of Service.",
      uri: location.origin,
      version: "1",
      nonce: Buffer.from(randomBytes(12)).toString("base64"),
      "issued-at": new Date().toISOString(),
    };
    const dataString = canonify(siwaRequest);
    if (!dataString) throw Error("Invalid JSON");
    const data = btoa(dataString);
    const enc = new TextEncoder();
    const authenticatorData = await sha256(enc.encode(domain));
    const signer =
      acctInfo.authAddr?.publicKey ??
      Address.fromString(activeAddress).publicKey;
    const sdtSignData: StdSignData = {
      data,
      signer,
      domain,
      authenticatorData,
    };
    const metadata: SignMetadata = {
      scope: ScopeType.AUTH,
      encoding: "base64",
    };
    const signerResponse = await lute.signData(sdtSignData, metadata);
    // TODO: verify signerResponse
  } catch (err) {
    console.error(
      "[LuteWallet] Error signing data: " +
        (err instanceof SignDataError
          ? `${err.message} (code: ${err.code})`
          : err.message),
    );
    throw err;
  }
}
```

### Add Network

```ts
// Warning: Browser will block pop-up if user doesn't trigger lute.addNetwork() with a button click
async function addCustomNetwork() {
  try {
    const customNetwork: Network = {
      name: "ExampleNet",
      algod: {
        url: "https://examplenet-api.4160.nodely.dev",
        port: "",
        token: "",
      },
      genesisID: "examplenet-v1.0",
    };
    await lute.addNetwork(customNetwork);
  } catch (err) {
    console.error(
      "[LuteWallet] Error adding network: " +
        (err instanceof AddNetworkError
          ? `${err.message} (code: ${err.code})`
          : err.message),
    );
    throw err;
  }
}
```
