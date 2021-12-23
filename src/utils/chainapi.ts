import axios from 'axios';
import CircuitBreaker from 'opossum';
import { Transaction } from '../model/transaction';
import { constants } from './constants';

const getTransactions = async (
  address: string,
  name: string,
  since: number
): Promise<Transaction[]> => {
  const dedupe = new Set<string>()
  const tx: Transaction[] = [];
  var callCount = 0;

  // Max 10...
  // if STX grows to the point of >500 TX per contract per block, increase this number :)
  while (callCount < 10) {
    const response = await axios.get(
      `https://stacks-node-api.stacks.co/extended/v1/address/${address}.${name}/transactions`,
      {
        params: {
          offset: 50 * callCount,
          limit: 50,
          type: 'contract_call'
        },
        timeout: 15000
      }
    );
    callCount++;
    const transactions: Transaction[] = response.data.results;
    for (const transaction of transactions) {
      if (dedupe.has(transaction.tx_id)) {
        continue
      }

      if (transaction.block_height > since) {
        tx.push(transaction);
        dedupe.add(transaction.tx_id)
      } else {
        break;
      }
    }
  }

  return tx
};

export const chainAPI = new CircuitBreaker(getTransactions, {
  timeout: false,
  errorThresholdPercentage: 51,
  rollingCountTimeout: constants.MARKET_SEARCH_INTERVAL * 10,
  rollingCountBuckets: 10,
  resetTimeout: 30000
});
