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

const POPUP_BLOCKED = "Popup blocked. Allow popups for this site to use Lute.";
const POPUP_SEVERED =
  "Lute's window closed or can't reach this site. If it is still open, " +
  "this site's Cross-Origin-Opener-Policy is blocking it; " +
  "use `same-origin-allow-popups` instead of `same-origin`.";

/**
 * Web mode: settle a request whose popup can no longer answer. Lute's "close"
 * message never arrives if the popup is closed before it loads, or if this
 * page sends `Cross-Origin-Opener-Policy: same-origin`, which severs the popup
 * (the handle then reads `closed` while the popup is still on screen).
 * A popup that closes before saying "ready" is reported as severed.
 * Returns a function that stops watching.
 */
function watchPopup(
  win: Window | null,
  isReady: () => boolean,
  fail: (message: string, code: number) => void,
): () => void {
  if (!win) {
    fail(POPUP_BLOCKED, 4300);
    return () => {};
  }
  const timer = setInterval(() => {
    if (!win.closed) return;
    clearInterval(timer);
    if (isReady()) fail("User Rejected Request", 4100);
    else fail(POPUP_SEVERED, 4300);
  }, 500);
  return () => clearInterval(timer);
}

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
      let ready = false;
      let stopWatch = () => {};
      const type = useExt ? "connect-response" : "message";
      const done = () => {
        window.removeEventListener(type, messageHandler);
        stopWatch();
      };
      const fail = (message: string) => {
        done();
        reject(new Error(message));
      };
      window.addEventListener(type, messageHandler);
      if (useExt) {
        window.dispatchEvent(
          new CustomEvent("lute-connect", {
            detail: { action: "connect", genesisID },
          }),
        );
      } else {
        win = open(`${BASE_URL}/connect`, this.siteName, PARAMS);
        stopWatch = watchPopup(win, () => ready, fail);
      }
      function messageHandler(event: any) {
        if (!useExt && event.origin !== BASE_URL) return;
        const data = event.data || event.detail;
        if (data.debug) console.log("[Lute Debug]", data);
        switch (data.action) {
          case "ready":
            ready = true;
            win?.postMessage({ action: "network", genesisID }, BASE_URL);
            break;
          case "connect":
            done();
            resolve({
              addrs: data.addrs,
              emptySignatures: data.emptySignatures ?? {},
            });
            break;
          case "error":
            fail(data.message);
            break;
          case "close":
            fail("Operation Cancelled");
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
      let ready = false;
      let stopWatch = () => {};
      const type = useExt ? "sign-txns-response" : "message";
      const done = () => {
        window.removeEventListener(type, messageHandler);
        stopWatch();
      };
      const fail = (message: string, code: number) => {
        done();
        reject(new SignTxnsError(message, code));
      };
      window.addEventListener(type, messageHandler);
      if (useExt) {
        window.dispatchEvent(
          new CustomEvent("lute-connect", {
            detail: { action: "sign", txns },
          }),
        );
      } else {
        win = open(`${BASE_URL}/sign`, this.siteName, PARAMS);
        stopWatch = watchPopup(win, () => ready, fail);
      }
      function messageHandler(event: any) {
        if (!useExt && event.origin !== BASE_URL) return;
        const detail = event.data || event.detail;
        if (detail.debug) console.log("[Lute Debug]", detail);
        switch (detail.action) {
          case "ready":
            ready = true;
            win?.postMessage({ action: "sign", txns }, BASE_URL);
            break;
          case "signed":
            done();
            resolve(detail.txns);
            break;
          case "error":
            fail(detail.message, detail.code || 4300);
            break;
          case "close":
            fail("User Rejected Request", 4100);
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
      let ready = false;
      let stopWatch = () => {};
      const type = useExt ? "sign-data-response" : "message";
      const done = () => {
        window.removeEventListener(type, messageHandler);
        stopWatch();
      };
      const fail = (message: string, code: number) => {
        done();
        reject(new SignDataError(message, code));
      };
      window.addEventListener(type, messageHandler);
      if (useExt) {
        window.dispatchEvent(
          new CustomEvent("lute-connect", {
            detail: { action: "data", stdSignData: data, metadata },
          }),
        );
      } else {
        win = open(`${BASE_URL}/auth`, this.siteName, PARAMS);
        stopWatch = watchPopup(win, () => ready, fail);
      }
      function messageHandler(event: any) {
        if (!useExt && event.origin !== BASE_URL) return;
        const detail = event.data || event.detail;
        if (detail.debug) console.log("[Lute Debug]", detail);
        switch (detail.action) {
          case "ready":
            ready = true;
            win?.postMessage(
              { action: "data", stdSignData: data, metadata },
              BASE_URL,
            );
            break;
          case "signed":
            done();
            resolve(detail.signerResponse);
            break;
          case "error":
            fail(detail.message, detail.code || 4300);
            break;
          case "close":
            fail("User Rejected Request", 4100);
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
      let ready = false;
      let stopWatch = () => {};
      const type = useExt ? "add-network-response" : "message";
      const done = () => {
        window.removeEventListener(type, messageHandler);
        stopWatch();
      };
      const fail = (message: string, code: number) => {
        done();
        reject(new AddNetworkError(message, code));
      };
      window.addEventListener(type, messageHandler);
      function messageHandler(event: any) {
        if (!useExt && event.origin !== BASE_URL) return;
        const detail = event.data || event.detail;
        if (detail.debug) console.log("[Lute Debug]", detail);
        switch (detail.action) {
          case "ready":
            ready = true;
            win?.postMessage({ action: "network", network }, BASE_URL);
            break;
          case "added":
            done();
            resolve(undefined);
            break;
          case "error":
            fail(detail.message, detail.code || 4300);
            break;
          case "close":
            fail("User Rejected Request", 4100);
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
        stopWatch = watchPopup(win, () => ready, fail);
      }
    });
  }
}
