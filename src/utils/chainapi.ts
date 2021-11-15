import axios from 'axios';
import CircuitBreaker from 'opossum';
import { constants } from './constants';

const getTransactions = (address: string, name: string) => {
  return axios.get(
    `https://stacks-node-api.stacks.co/extended/v1/address/${address}.${name}/transactions`,
    {
      params: {
        limit: 50,
        type: 'contract_call'
      },
      timeout: 5000
    }
  );
};

export const chainAPI = new CircuitBreaker(getTransactions, {
  timeout: false,
  errorThresholdPercentage: 51,
  rollingCountTimeout: constants.MARKET_SEARCH_INTERVAL * 10,
  rollingCountBuckets: 10,
  resetTimeout: 30000
});
