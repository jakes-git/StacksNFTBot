import { readFileSync } from 'fs';
import { Collection } from '../model/collection';
import { MarketplaceDef } from '../model/marketplace';

export class constants {
  // List of collections
  static readonly COLLECTIONS: Collection[] = Object.freeze(
    JSON.parse(readFileSync('data/collections.json', 'utf-8'))
  );
  // List of marketplaces to search
  static readonly MARKETS: MarketplaceDef[] = Object.freeze(
    JSON.parse(readFileSync('data/marketplaces.json', 'utf-8'))
  );

  // list of collection IDs
  static readonly COLLECTION_IDS: string[] = constants.COLLECTIONS.map(
    (c) => `${c.contractAddress}.${c.contractName}`
  );

  // Refresh interval for STX price in milliseconds
  static readonly PRICE_REFRESH_INTERVAL = 10 * 1000;
  // Search interval for new transactions
  static readonly MARKET_SEARCH_INTERVAL = 30 * 1000;
}
