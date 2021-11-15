export interface Collection {
  /** The name of this collection */
  readonly name: string;
  /** Address of the collection contract */
  readonly contractAddress: string;
  /** Name of the collection contract */
  readonly contractName: string;
  /** URL to some static image which can identify this collection */
  readonly symbol?: string;
  /** (mustache) URL from which to fetch NFT metadata.
   *
   * Note - at this point, the `nft` attribute of the mustache view will be undefined,
   * so in order to render the nft ID you should use `{{action.nftID}}` */
  readonly metadataURL: string;
  /** HTTP method to use when fetching NFT metadata. Default get */
  readonly metadataMethod?: 'get' | 'put' | 'post';
  /** The path from which to extract NFT metadata out of the response from the `metadataURL` API.
   * To use the response data as-is, juse use `.`
   *
   * Example:
   * Assume metadata API response with `{"docs": ["nft": {}]}`.
   * To extract the nft data from this response, the path would be `docs.0.nft`
   * */
  readonly metadataPath: string;
  /** (mustache) URL to download the NFT image from. */
  readonly imageURL: string;
  /** (mustache, eval) Template to use for rendering the twitter message */
  readonly tweetTemplate?: string;
  /** Template to use for rendering the discord message */
  readonly discordTemplate?: discordTemplate;
}

interface discordTemplate {
  /**  (mustache, eval) Title of the discord embed */
  readonly title?: string;
  /** (mustache, eval) URL the embed should link to */
  readonly url?: string;
  /** (mustache, eval) Description of discord embed */
  readonly description?: string;
  /** Discord embed fields */
  readonly fields?: discordField[];
}

interface discordField {
  /** (mustache, eval) Field name */
  readonly name: string;
  /** (mustache, eval) Field value */
  readonly value: string;
  /** Whether field is inline */
  readonly inline: boolean;
}
