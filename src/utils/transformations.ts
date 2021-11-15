import axios from 'axios';
import { NFTEvent } from '../model/nft';
import Mustache from 'mustache';
import { prettyError } from './errorhandling';
import { stxPrice } from './stxprice';

// access a property of object by propery path
// EX: getPropertyByPath({a: {b: [1,2,3]}}, "a.b.0") == 1
export const getPropertyByPath = (obj: any, path: string): any => {
  if (path === '.') {
    return obj;
  }
  var values = path.split('.');
  while (values.length && (obj = obj[values.shift()]));
  return obj;
};

// Get nft metadata and image buffer using json defined template transformations
export const getNFTInfo = async (event: NFTEvent) => {
  const metadataURL = Mustache.render(
    event.action.collection.metadataURL,
    event
  );
  const method = event.action.collection.metadataMethod || 'get';
  const response = await (method === 'put'
    ? axios.put
    : method === 'post'
    ? axios.post
    : axios.get)(metadataURL);
  event.nft = getPropertyByPath(
    response.data,
    event.action.collection.metadataPath
  );

  if (!event.nft) {
    throw `Could not load nft using path ${event.action.collection.metadataPath}`;
  }

  event.detailURL = Mustache.render(event.action.marketplace.nftDetailURL, event);

  event.price = (Math.round(event.action.amount * 100) / 100).toLocaleString(
    'en-US'
  );
  event.usdPrice = (
    Math.round(stxPrice.getPrice() * event.action.amount * 100) / 100
  ).toLocaleString('en-US');

  // image failure is not fatal
  try {
    const imageURL = Mustache.render(event.action.collection.imageURL, event);
    const response = await axios.get(imageURL, { responseType: 'arraybuffer' });
    event.imageBuffer = Buffer.from(response.data, 'binary');
    const arr = response.headers['content-type']?.split('/');
    event.imageType = arr?.[arr?.length - 1] || 'png';
  } catch (error) {
    prettyError(
      `Failed to get image for ${event.action.collection.name} ${event.action.nftID}`,
      error
    );
  }
};
