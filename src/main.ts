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

export interface SignTxnsError extends Error {
  code: number;
  data?: any;
}

const BASE_URL = "https://lute.app";
const PARAMS = "width=500,height=750,left=100,top=100";

export default class LuteConnect {
  siteName: string;
  constructor(siteName: string) {
    this.siteName = siteName;
  }

  connect(genesisId: string): Promise<Address[]> {
    return new Promise((resolve, reject) => {
      const win = open(`${BASE_URL}/connect`, this.siteName, PARAMS);
      window.addEventListener("message", messageHandler);
      function messageHandler(event: any) {
        if (event.origin !== BASE_URL) return;
        switch (event.data.action) {
          case "ready": {
            const message = {
              action: "network",
              genesisID: genesisId,
            };
            win?.postMessage(message, "*");
            break;
          }
          case "connect": {
            win?.close();
            window.removeEventListener("message", messageHandler);
            resolve(event.data.addrs);
            break;
          }
          case "error": {
            win?.close();
            window.removeEventListener("message", messageHandler);
            reject({
              message: event.data.message,
            });
            break;
          }
          case "close": {
            if (!win?.closed) {
              window.removeEventListener("message", messageHandler);
              reject({
                message: "Operation Canceled",
              });
            }
            break;
          }
        }
      }
    });
  }

  signTxns(
    txns: WalletTransaction[]
  ): Promise<(Uint8Array | null)[] | SignTxnsError> {
    return new Promise((resolve, reject) => {
      if (!txns.length) {
        reject({
          code: 4300,
          message: "Empty Transaction Array",
        });
      }
      const win = open(`${BASE_URL}/sign`, this.siteName, PARAMS);
      window.addEventListener("message", messageHandler);
      function messageHandler(event: any) {
        if (event.origin !== BASE_URL) return;
        switch (event.data.action) {
          case "ready": {
            const message = {
              action: "sign",
              txns: txns,
            };
            win?.postMessage(message, "*");
            break;
          }
          case "signed": {
            win?.close();
            window.removeEventListener("message", messageHandler);
            resolve(event.data.txns);
            break;
          }
          case "msig": {
            win?.close();
            window.removeEventListener("message", messageHandler);
            reject({
              code: 4100,
              message: "Not Signed, Sent to Multi-Sig",
            });
            break;
          }
          case "error": {
            win?.close();
            window.removeEventListener("message", messageHandler);
            reject({
              code: event.data.code || 4300,
              message: event.data.message,
            });
            break;
          }
          case "close": {
            if (!win?.closed) {
              window.removeEventListener("message", messageHandler);
              reject({
                code: 4001,
                message: "User Rejected Request",
              });
            }
            break;
          }
        }
      }
    });
  }
}
