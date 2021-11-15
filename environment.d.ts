declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      TWITTER_API_KEY: string;
      TWITTER_API_SECRET: string;
      TWITTER_ACCESS_TOKEN: string;
      TWITTER_ACCESS_TOKEN_SECRET: string;
      DISCORD_TOKEN: string;
      DISCORD_SALE_CHANNEL: string;
      DISCORD_LISTINGS_CHANNEL: string;
      DISCORD_OFFERS_CHANNEL: string;
      INITIAL_BLOCKHEIGHT: string;
    }
  }
}

export {};
