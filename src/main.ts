export type Address = string;
export type Base64 = string;
export type TxnStr = Base64;
export type SignedTxnStr = Base64;

export interface MultisigMetadata {
  // Multisig version
  version: number;

  // Multisig threshold value
  threshold: number;

  // Multisig Cosigners
  addrs: Address[];
}

export interface WalletTransaction {
  // Base64 encoding of the canonical msgpack encoding of a Transaction
  txn: TxnStr;

  // Optional authorized address used to sign the transaction when the account is rekeyed
  authAddr?: Address;

  // [Not Supported] Multisig metadata used to sign the transaction
  msig?: MultisigMetadata;

  // Optional list of addresses that must sign the transactions
  signers?: Address[];

  // Optional base64 encoding of the canonical msgpack encoding of a  SignedTxn corresponding to txn, when signers=[]
  stxn?: SignedTxnStr;

  // [Not Supported] Optional message explaining the reason of the transaction
  message?: string;

  // [Not Supported] Optional message explaining the reason of this group of transaction.
  // Field only allowed in the first transaction of a group
  groupMessage?: string;
}

export interface SignTxnsOpts {
  // [Not Supported] Optional message explaining the reason of the group of transactions
  message?: string;
  // Name of site requesting signatures
  _luteSiteName: string;
}

export class SignTxnsError extends Error {
  code: number;
  data?: any;

  constructor(message: string, code: number, data?: any) {
    super(message);
    this.name = "SignTxnsError";
    this.code = code;
    this.data = data;
  }
}

const left = 100 + window.screenX;
const top = 100 + window.screenY;
const PARAMS = `width=500,height=750,left=${left},top=${top}`;
const BASE_URL = "https://lute.app";
const EXT_ID = "kiaoohollfkjhikdifohdckeidckokjh";

export default class LuteConnect {
  siteName: string;
  forceWeb: boolean = false;

  constructor(siteName: string) {
    this.siteName = siteName;
  }

  async isExtensionInstalled() {
    return await fetch(`chrome-extension://${EXT_ID}/assets/icon-16.png`)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  connect(genesisID: string): Promise<Address[]> {
    return new Promise(async (resolve, reject) => {
      const useExt = this.forceWeb ? false : await this.isExtensionInstalled();
      let win: any;
      if (useExt) {
        window.dispatchEvent(
          new CustomEvent("lute-connect", {
            detail: { action: "connect", genesisID },
          })
        );
      } else {
        win = open(`${BASE_URL}/connect`, this.siteName, PARAMS);
      }
      const type = useExt ? "connect-response" : "message";
      window.addEventListener(type, messageHandler);
      function messageHandler(event: any) {
        if (!useExt && event.origin !== BASE_URL) return;
        const data = event.data || event.detail;
        if (data.debug) console.log("[Lute Debug]", data);
        switch (data.action) {
          case "ready":
            win?.postMessage({ action: "network", genesisID }, "*");
            break;
          case "connect":
            window.removeEventListener(type, messageHandler);
            resolve(data.addrs);
            break;
          case "error":
            window.removeEventListener(type, messageHandler);
            reject(new Error(data.message));
            break;
          case "close":
            window.removeEventListener(type, messageHandler);
            reject(new Error("Operation Cancelled"));
            break;
        }
      }
    });
  }

  signTxns(txns: WalletTransaction[]): Promise<(Uint8Array | null)[]> {
    return new Promise(async (resolve, reject) => {
      const useExt = this.forceWeb ? false : await this.isExtensionInstalled();
      let win: any;
      if (useExt) {
        window.dispatchEvent(
          new CustomEvent("lute-connect", {
            detail: { action: "sign", txns },
          })
        );
      } else {
        win = open(`${BASE_URL}/sign`, this.siteName, PARAMS);
      }
      const type = useExt ? "sign-txns-response" : "message";
      window.addEventListener(type, messageHandler);
      function messageHandler(event: any) {
        if (!useExt && event.origin !== BASE_URL) return;
        const data = event.data || event.detail;
        if (data.debug) console.log("[Lute Debug]", data);
        switch (data.action) {
          case "ready":
            win?.postMessage({ action: "sign", txns: txns }, "*");
            break;
          case "signed":
            window.removeEventListener(type, messageHandler);
            resolve(data.txns);
            break;
          case "error":
            window.removeEventListener(type, messageHandler);
            reject(new SignTxnsError(data.message, data.code || 4300));
            break;
          case "close":
            window.removeEventListener(type, messageHandler);
            reject(new SignTxnsError("User Rejected Request", 4100));
            break;
        }
      }
    });
  }
}
