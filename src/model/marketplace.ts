import { Collection } from './collection';

export interface MarketAction {
  readonly nftID: number;
  readonly txID: string;
  readonly amount: number;
  readonly actionType: 'list' | 'purchase' | 'offer';
  readonly marketplace: MarketplaceDef;
  readonly collection: Collection;
}

export interface MarketplaceDef {
  /** Name of this marketplace */
  readonly name: string;
  /** (mustache) URL which shows the details of this NFT for this marketplace. */
  readonly nftDetailURL: string;
  /** URL to the png logo for this marketplace */
  readonly logo?: string;
  /** Contract definitions this marketplace uses */
  readonly contracts: MarketplaceContractDef[];
}

export interface MarketplaceContractDef {
  /** Contract address */
  readonly address: string;
  /** Different contract names which are registered to this address and share the same schema. */
  readonly names: string[];
  /** Function definitions for this contract */
  readonly functions: FunctionDef[];
}

export interface FunctionDef {
  /** The type of function this is */
  readonly type: 'list' | 'purchase' | 'offer';
  /** The name of the function */
  readonly name: string;
  /** Variable definitions for this function */
  readonly variables: FunctionVariables;
}

export interface FunctionVariables {
  /** Definition for where to find the `collection name` variable */
  readonly collectionName?: variableDef;
  /** Definition for where to find the `nft ID` variable */
  readonly nftID: variableDef;
  /** Definition for where to find the `STX amount` variable */
  readonly stxAmount: variableDef;
}

interface variableDef {
  /** Variables are either located in the `function_args` or `post_conditions` of a contract call*/
  readonly location: 'function_args' | 'post_conditions';
  /** The name of the function arg*/
  readonly name?: string;
  /** The type of the post condition, only for `STX amounts` */
  readonly type?: 'stx';
  /** The index of the post condition array to search, only for `colelction name` / `nft ID`  */
  readonly index?: number;
}
