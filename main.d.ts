export type Address = string;
export type Base64 = string;
export type TxnStr = Base64;
export type SignedTxnStr = Base64;
export interface MultisigMetadata {
    version: number;
    threshold: number;
    addrs: Address[];
}
export interface WalletTransaction {
    txn: TxnStr;
    authAddr?: Address;
    msig?: MultisigMetadata;
    signers?: Address[];
    stxn?: SignedTxnStr;
    message?: string;
    groupMessage?: string;
}
export interface SignTxnsOpts {
    message?: string;
    _luteSiteName: string;
}
export interface SignTxnsError extends Error {
    code: number;
    data?: any;
}
export default class Lute {
    connect(genesisId: string, siteName: string): Promise<Address[]>;
    signTxns(txns: WalletTransaction[], opts: SignTxnsOpts): Promise<(SignedTxnStr | null)[] | SignTxnsError>;
}
