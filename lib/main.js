const BASE_URL = "https://lute.app";
const PARAMS = "width=500,height=750,left=100,top=100";
export default class Lute {
    connect(genesisId, siteName) {
        return new Promise((resolve, reject) => {
            const win = open(`${BASE_URL}/connect`, siteName, PARAMS);
            window.addEventListener("message", messageHandler);
            async function messageHandler(event) {
                if (event.origin !== BASE_URL)
                    return;
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
    signTxns(txns, opts) {
        return new Promise((resolve, reject) => {
            if (!txns.length) {
                reject({
                    code: 4300,
                    message: "Empty Transaction Array",
                });
            }
            const win = open(`${BASE_URL}/sign`, opts._luteSiteName, PARAMS);
            window.addEventListener("message", messageHandler);
            function messageHandler(event) {
                if (event.origin !== BASE_URL)
                    return;
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
