import { prettyError } from '../utils/errorhandling';
import { TwitterApi } from 'twitter-api-v2';
import { NFTEvent } from '../model/nft';
import Mustache from 'mustache';

var client: TwitterApi;
if (process.env.TWITTER_API_KEY) {
  client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });
}

export const sendTweetWithText = async (event: NFTEvent) => {
  // Only sales allowed on twitter, add support for new templates for more event types
  if (!shouldTweetEvent(event)) {
    return;
  }

  const message = Mustache.render(event.action.collection.tweetTemplate, event);
  try {
    const callback = await client.v1.tweet(message);
    event.tweetInfo = {
      userID: callback.user.id_str,
      statusID: callback.id_str
    };
    console.log(`Successfully tweeted statusID ${callback.id_str}`);
  } catch (error) {
    prettyError('Failed to send tweet', error);
  }
};

export const sendTweetWithImage = async (event: NFTEvent) => {
  if (!shouldTweetEvent(event)) {
    return;
  }

  if (!event.imageBuffer) {
    return await sendTweetWithText(event);
  }

  try {
    const message = Mustache.render(
      eval(event.action.collection.tweetTemplate),
      event
    );
    const mediaID = await client.v1.uploadMedia(event.imageBuffer, {
      type: event.imageType
    });
    const callback = await client.v1.tweet(message, { media_ids: [mediaID] });
    event.tweetInfo = {
      userID: callback.user.id_str,
      statusID: callback.id_str
    };
    console.log(`Successfully tweeted statusID ${callback.id_str}`);
  } catch (error) {
    prettyError('Failed to send tweet', error);
  }
};

const shouldTweetEvent = (event: NFTEvent): boolean => {
  // Only purchases allowed on twitter, add different twitter templates to support more types
  if (event.action.actionType !== 'purchase') {
    return false;
  }
  if (!process.env.TWITTER_API_KEY) {
    return false;
  }
  if (!event.action.collection.tweetTemplate) {
    return false;
  }
  return true;
};
