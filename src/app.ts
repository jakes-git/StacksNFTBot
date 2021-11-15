import 'dotenv/config';

import { MarketAction } from './model/marketplace';
import { sendTweetWithImage } from './external/twitter';
import { sendDiscordMessages } from './external/discord';
import { MarketplaceContract } from './contracts/marketplace';
import { constants } from './utils/constants';
import { prettyError } from './utils/errorhandling';
import { NFTEvent } from './model/nft';
import { getNFTInfo } from './utils/transformations';
import Mustache from 'mustache';

// disable html escaping
Mustache.escape = (text) => {
  return text;
};

var marketplaces: MarketplaceContract[] = [];
for (const market of constants.MARKETS) {
  marketplaces.push(new MarketplaceContract(market));
}

const processMarkeplaces = () => {
  const promises: Promise<MarketAction[]>[] = [];
  for (const marketplace of marketplaces) {
    promises.push(...marketplace.getMarketActions());
  }
  Promise.allSettled(promises)
    .then((results) => {
      const eventPromises: Promise<NFTEvent>[] = [];

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const actions = result.value as MarketAction[];
          for (const action of actions) {
            eventPromises.push(
              new Promise(async (resolve, reject) => {
                const event: NFTEvent = {
                  action: action
                };

                // If nft info could not be fetched, nothing will be sent
                try {
                  await getNFTInfo(event);
                } catch (error) {
                  prettyError(
                    `Failed to get nft info for ${action.collection.name} ${action.nftID}`,
                    error
                  );
                  reject(error);
                }

                // Still try to send discord msg even if twitter fails
                try {
                  await sendTweetWithImage(event);
                } finally {
                  resolve(event);
                }
              })
            );
          }
        } else {
          console.error(result.status, result.reason);
        }
      }

      Promise.allSettled(eventPromises).then((results) => {
        const events: NFTEvent[] = [];
        for (const result of results) {
          if (result.status === 'fulfilled') {
            events.push(result.value as NFTEvent);
          }
        }
        sendDiscordMessages(events);
      });
    })
    .catch((error) => prettyError('Marketplace promise failure', error));
};

processMarkeplaces();
setInterval(processMarkeplaces, constants.MARKET_SEARCH_INTERVAL);
