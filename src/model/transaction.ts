export interface Transaction {
  readonly tx_id: string;
  readonly post_conditions: postCondition[];
  readonly block_height: number;
  readonly tx_status: string;
  readonly tx_type: string;
  readonly contract_call: contractCall;
}

interface contractCall {
  readonly contract_id: string;
  readonly function_name: string;
  readonly function_args: functionArg[];
}

interface functionArg {
  readonly name: string;
  readonly repr: string;
  readonly type: string;
}

interface postCondition {
  readonly type: string;
  readonly amount?: string;
  readonly asset?: asset;
  readonly assetValue?: assetValue;
}

interface asset {
  readonly contract_name: string;
  readonly asset_name: string;
  readonly contract_address: string;
}

interface assetValue {
  readonly repr: string;
}
