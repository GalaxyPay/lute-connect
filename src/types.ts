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

export interface Siwa {
  domain: string;
  account_address: string;
  uri: string;
  version: string;
  statement?: string;
  nonce?: string;
  "issued-at"?: string;
  "expiration-time"?: string;
  "not-before"?: string;
  "request-id"?: string;
  chain_id: string;
  resources?: string[];
  type: "ed25519";
}

export interface StdSignData {
  data: string;
  signer: Uint8Array;
  domain: string;
  authenticatorData: Uint8Array;
  requestId?: string;
  hdPath?: string;
}

export interface StdSignDataResponse extends StdSignData {
  signature: Uint8Array;
}

export enum ScopeType {
  UNKNOWN = -1,
  AUTH = 1,
}

export interface StdSignMetadata {
  scope: ScopeType;
  encoding: string;
}

export class SignDataError extends Error {
  code: number;
  data?: any;

  constructor(message: string, code: number, data?: any) {
    super(message);
    this.name = "SignDataError";
    this.code = code;
    this.data = data;
  }
}

export interface IWindow extends Window {
  lute?: boolean;
}

interface Client {
  url: string;
  port: string;
  token: string;
}

export interface Network {
  name: string;
  algod: Client;
  indexer?: Client;
  genesisID: string;
}

export class AddNetworkError extends Error {
  code: number;
  data?: any;

  constructor(message: string, code: number, data?: any) {
    super(message);
    this.name = "AddNetworkError";
    this.code = code;
    this.data = data;
  }
}
