import axios from 'axios';
import { constants } from './constants';
import { prettyError } from './errorhandling';

class StxPrice {
  private static instance: StxPrice;

  private price: number = 0;
  public getPrice(): number {
    return this.price;
  }

  private constructor() {
    setInterval(StxPrice.loadPrice, constants.PRICE_REFRESH_INTERVAL);
  }

  public static getInstance(): StxPrice {
    if (!StxPrice.instance) {
      StxPrice.instance = new StxPrice();
      StxPrice.loadPrice();
    }

    return StxPrice.instance;
  }

  private static loadPrice() {
    axios
      .get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'blockstack',
          vs_currencies: 'USD'
        }
      })
      .then((response) => {
        StxPrice.instance.price = response?.data?.blockstack?.usd;
      })
      .catch((error) => prettyError('Failed loading stx price', error));
  }
}

export const stxPrice = StxPrice.getInstance();
