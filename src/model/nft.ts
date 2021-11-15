import { MarketAction } from './marketplace';

export interface NFTEvent {
  /** The parsed transaction data from the marketplace contracts */
  readonly action: MarketAction;
  /** The nft object which is sourced from the collection's `metadataURL`  */
  nft?: any;
  /** The formatted STX price of this event */
  price?: string;
  /** The formatted USD price of this event */
  usdPrice?: string;
  /** The URL to go to for viewing this event, sourced from the marketplace's `nftDetailURL` */
  detailURL?: string;
  /** Image buffer containing this NFT's image */
  imageBuffer?: Buffer;
  /** Image type (png, gif etc) sourced from the `content-type` header of the collection's `imageURL` response. */
  imageType?: string;
  /** Info about the tweet which was sent for this event */
  tweetInfo?: TweetInfo;
}

export interface TweetInfo {
  /** userID that sent the tweet */
  readonly userID: string;
  /** statusID of the tweet */
  readonly statusID: string;
}
