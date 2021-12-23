import { constants } from '../utils/constants';
import {
  MarketplaceDef,
  MarketAction,
  MarketplaceContractDef,
  FunctionDef
} from '../model/marketplace';
import { cache } from '../utils/cache';
import { Transaction } from '../model/transaction';
import axios from 'axios';
import { prettyError } from '../utils/errorhandling';
import { chainAPI } from '../utils/chainapi';
import { Collection } from '../model/collection';

// MarketplaceContract is used for searching through marketplace transactions
// to fetch NFT events since the last search
export class MarketplaceContract {
  readonly marketplace: MarketplaceDef;

  constructor(marketplace: MarketplaceDef) {
    this.marketplace = marketplace;
  }

  getMarketActions(): Promise<MarketAction[]>[] {
    const contracts = this.marketplace.contracts;
    const promises: Promise<MarketAction[]>[] = [];
    for (const contract of contracts) {
      for (const name of contract.names) {
        promises.push(this.getActionsForContract(name, contract));
      }
    }
    return promises;
  }

  private async getActionsForContract(
    contractName: string,
    contract: MarketplaceContractDef
  ): Promise<MarketAction[]> {
    try {
      const events: MarketAction[] = [];
      const cacheKey = `${this.marketplace.name}_${contractName}`;
      const lastProcessedBlock =
        (cache.get(cacheKey) as any) || +process.env.INITIAL_BLOCKHEIGHT;

      if (!lastProcessedBlock) {
        const currentBlock = await this.initializeFirstBlock();
        cache.set(cacheKey, currentBlock);
        console.log(
          `Now listening to ${cacheKey} starting at block ${currentBlock}`
        );
        return events;
      }

      const transactions = await chainAPI.fire(contract.address, contractName, lastProcessedBlock)

      var hasSetCache = false;

      for (const tx of transactions) {
        if (this.shouldIgnoreTx(tx, contract)) {
          continue;
        }

        // Get the definition of the called function by name
        const calledFunction = contract.functions.find((f) => {
          return f.name === tx.contract_call.function_name;
        });
        if (!calledFunction) {
          continue;
        }

        // Skip this tx if its for some collection we are not tracking
        const collection = this.getCollectionForContractCall(
          tx,
          calledFunction
        );
        if (!collection) {
          continue;
        }

        const currentBlock = tx.block_height;
        if (currentBlock <= lastProcessedBlock) {
          break;
        }

        const nftIDVar = calledFunction.variables.nftID;
        const nftID: number =
          nftIDVar.location === 'function_args'
            ? +tx.contract_call.function_args
                .find((arg) => arg.name === nftIDVar.name)
                .repr.substr(1)
            : +tx.post_conditions[nftIDVar.index].assetValue.repr.substr(1);

        if (!nftID) {
          console.warn(`Unable to determine nft ID: ${tx}`);
          continue;
        }

        const amountVar = calledFunction.variables.stxAmount;
        const amount: number =
          (amountVar.location === 'function_args'
            ? +tx.contract_call.function_args
                .find((arg) => arg.name === amountVar.name)
                .repr.substr(1)
            : +tx.post_conditions.find((pc) => pc.type === amountVar.type)
                .amount) / Math.pow(10, 6);

        const data: MarketAction = {
          collection: collection,
          marketplace: this.marketplace,
          nftID: nftID,
          amount: amount,
          txID: tx.tx_id,
          actionType: calledFunction.type
        };
        events.push(data);

        if (!hasSetCache) {
          cache.set(cacheKey, currentBlock);
          hasSetCache = true;
        }
      }
      return events;
    } catch (error) {
      prettyError('Market search failed', error);
    }
    return [];
  }

  private getCollectionForContractCall(
    tx: Transaction,
    functionDef: FunctionDef
  ): Collection {
    const collectionArg = functionDef.variables.collectionName;

    // if this contract doesnt need filtering by collection, assume the called contract is the collection contract
    if (!collectionArg) {
      return constants.COLLECTIONS.find((c) => {
        return (
          tx.contract_call.contract_id ===
          `${c.contractAddress}.${c.contractName}`
        );
      });
    }

    if (collectionArg.location === 'function_args') {
      const repr = tx.contract_call.function_args.find(
        (arg) => arg.name === collectionArg.name
      ).repr;
      return constants.COLLECTIONS.find((c) => {
        return repr?.indexOf(`${c.contractAddress}.${c.contractName}`) >= 0;
      });
    } else {
      const pc = tx.post_conditions[collectionArg.index];
      return constants.COLLECTIONS.find((c) => {
        return (
          pc?.asset?.contract_address === c.contractAddress &&
          pc?.asset?.contract_name === c.contractName
        );
      });
    }
  }

  private shouldIgnoreTx(
    tx: Transaction,
    contract: MarketplaceContractDef
  ): boolean {
    if (tx.tx_status !== 'success') {
      return true;
    }
    const targetFunctions = contract.functions.map((s) => s.name);
    if (!targetFunctions.includes(tx.contract_call.function_name)) {
      return true;
    }

    return false;
  }

  private async initializeFirstBlock(): Promise<number> {
    const response = await axios.get(
      `https://stacks-node-api.stacks.co/extended/v1/block`,
      {
        params: {
          limit: 1
        }
      }
    );
    return response.data.results[0].height;
  }
}
