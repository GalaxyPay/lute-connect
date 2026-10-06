import {
  AddNetworkError,
  Address,
  ConnectResult,
  IWindow,
  Network,
  SignDataError,
  SignTxnsError,
  StdSignData,
  StdSignDataResponse,
  StdSignMetadata,
  WalletTransaction,
} from "./types";

export * from "./types";

const left = 100 + window.screenX;
const top = 100 + window.screenY;
const PARAMS = `width=500,height=750,left=${left},top=${top}`;
export const BASE_URL = "https://lute.app";

export default class LuteConnect {
  siteName: string;
  forceWeb: boolean = false;

  constructor(siteName?: string) {
    this.siteName = siteName || document.title || "Unknown site";
  }

  /** Requests account access and returns the connected addresses. */
  async connect(genesisID: string): Promise<Address[]> {
    return (await this.connectAccounts(genesisID)).addrs;
  }

  /**
   * Like connect(), but also returns each account's empty signature, so a
   * dapp can simulate fees with correctly shaped signatures.
   */
  connectAccounts(genesisID: string): Promise<ConnectResult> {
    return new Promise(async (resolve, reject) => {
      const useExt = this.forceWeb ? false : (window as IWindow).lute;
      let win: any;
      if (useExt) {
        window.dispatchEvent(
          new CustomEvent("lute-connect", {
            detail: { action: "connect", genesisID },
          }),
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
            resolve({
              addrs: data.addrs,
              emptySignatures: data.emptySignatures ?? {},
            });
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

  /** Asks the user to sign transactions */
  signTxns(txns: WalletTransaction[]): Promise<(Uint8Array | null)[]> {
    return new Promise(async (resolve, reject) => {
      const useExt = this.forceWeb ? false : (window as IWindow).lute;
      let win: any;
      if (useExt) {
        window.dispatchEvent(
          new CustomEvent("lute-connect", {
            detail: { action: "sign", txns },
          }),
        );
      } else {
        win = open(`${BASE_URL}/sign`, this.siteName, PARAMS);
      }
      const type = useExt ? "sign-txns-response" : "message";
      window.addEventListener(type, messageHandler);
      function messageHandler(event: any) {
        if (!useExt && event.origin !== BASE_URL) return;
        const detail = event.data || event.detail;
        if (detail.debug) console.log("[Lute Debug]", detail);
        switch (detail.action) {
          case "ready":
            win?.postMessage({ action: "sign", txns }, "*");
            break;
          case "signed":
            window.removeEventListener(type, messageHandler);
            resolve(detail.txns);
            break;
          case "error":
            window.removeEventListener(type, messageHandler);
            reject(new SignTxnsError(detail.message, detail.code || 4300));
            break;
          case "close":
            window.removeEventListener(type, messageHandler);
            reject(new SignTxnsError("User Rejected Request", 4100));
            break;
        }
      }
    });
  }

  /** Asks the user to sign arbitrary data, e.g. for authentication. */
  signData(
    data: StdSignData,
    metadata: StdSignMetadata,
  ): Promise<StdSignDataResponse> {
    return new Promise(async (resolve, reject) => {
      const useExt = this.forceWeb ? false : (window as IWindow).lute;
      let win: any;
      if (useExt) {
        window.dispatchEvent(
          new CustomEvent("lute-connect", {
            detail: { action: "data", stdSignData: data, metadata },
          }),
        );
      } else {
        win = open(`${BASE_URL}/auth`, this.siteName, PARAMS);
      }
      const type = useExt ? "sign-data-response" : "message";
      window.addEventListener(type, messageHandler);
      function messageHandler(event: any) {
        if (!useExt && event.origin !== BASE_URL) return;
        const detail = event.data || event.detail;
        if (detail.debug) console.log("[Lute Debug]", detail);
        switch (detail.action) {
          case "ready":
            win?.postMessage(
              { action: "data", stdSignData: data, metadata },
              "*",
            );
            break;
          case "signed":
            window.removeEventListener(type, messageHandler);
            resolve(detail.signerResponse);
            break;
          case "error":
            window.removeEventListener(type, messageHandler);
            reject(new SignDataError(detail.message, detail.code || 4300));
            break;
          case "close":
            window.removeEventListener(type, messageHandler);
            reject(new SignDataError("User Rejected Request", 4100));
            break;
        }
      }
    });
  }

  /** Asks the user to add a custom network to their wallet. */
  addNetwork(network: Network): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const useExt = this.forceWeb ? false : (window as IWindow).lute;
      let win: any;
      const type = useExt ? "add-network-response" : "message";
      window.addEventListener(type, messageHandler);
      function messageHandler(event: any) {
        if (!useExt && event.origin !== BASE_URL) return;
        const detail = event.data || event.detail;
        if (detail.debug) console.log("[Lute Debug]", detail);
        switch (detail.action) {
          case "ready":
            win?.postMessage({ action: "network", network }, "*");
            break;
          case "added":
            window.removeEventListener(type, messageHandler);
            resolve(undefined);
            break;
          case "error":
            window.removeEventListener(type, messageHandler);
            reject(new AddNetworkError(detail.message, detail.code || 4300));
            break;
          case "close":
            window.removeEventListener(type, messageHandler);
            reject(new AddNetworkError("User Rejected Request", 4100));
            break;
        }
      }
      if (useExt) {
        window.dispatchEvent(
          new CustomEvent("lute-connect", {
            detail: { action: "network", network },
          }),
        );
      } else {
        win = open(`${BASE_URL}/network`, this.siteName, PARAMS);
      }
    });
  }
}
