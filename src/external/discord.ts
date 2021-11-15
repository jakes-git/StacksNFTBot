import randomColor from 'randomcolor';
import {
  Client,
  HexColorString,
  Intents,
  MessageEmbed,
  TextChannel,
  MessageAttachment
} from 'discord.js';
import { prettyError } from '../utils/errorhandling';
import { NFTEvent } from '../model/nft';
import Mustache from 'mustache';

interface discordMsg {
  embed: MessageEmbed;
  attachment: MessageAttachment;
}

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
if (process.env.DISCORD_TOKEN) {
  client.login(process.env.DISCORD_TOKEN);
}

const channels: { [type: string]: string } = {
  list: process.env.DISCORD_LISTINGS_CHANNEL,
  purchase: process.env.DISCORD_SALE_CHANNEL,
  offer: process.env.DISCORD_OFFERS_CHANNEL
};

// https://discordjs.guide/popular-topics/embeds.html#embed-preview
const getEmbed = (event: NFTEvent): discordMsg => {
  const attachment = new MessageAttachment(
    event.imageBuffer,
    `${event.action.txID}.${event.imageType}`
  );
  const template = event.action.collection.discordTemplate;
  const action = event.action.actionType;
  const embed = new MessageEmbed().setColor(randomColor() as HexColorString);
  if (template.title) {
    embed.setTitle(Mustache.render(eval(template.title), event));
  }
  if (template.url) {
    embed.setURL(Mustache.render(eval(template.url), event));
  }
  if (template.description) {
    embed.setDescription(Mustache.render(eval(template.description), event));
  }
  for (const field of template.fields) {
    const name = Mustache.render(eval(field.name), event);
    const value = Mustache.render(eval(field.value), event);
    const inline = field.inline;
    if (name && value) {
      embed.addField(name, value, inline);
    }
  }
  embed.setImage(`attachment://${event.action.txID}.${event.imageType}`);
  if (event.action.marketplace.logo) {
    embed.setThumbnail(event.action.marketplace.logo);
  }
  embed.setTimestamp();
  embed.setFooter(event.action.collection.name, event.action.collection.symbol);

  return { embed, attachment };
};

export const sendDiscordMessages = async (events: NFTEvent[]) => {
  const embeds: { [id: string]: MessageEmbed[] } = {
    list: [],
    purchase: [],
    offer: []
  };
  const attachments: { [id: string]: MessageAttachment[] } = {
    list: [],
    purchase: [],
    offer: []
  };

  for (const event of events) {
    try {
      const msg = getEmbed(event);
      embeds[event.action.actionType].push(msg.embed);
      attachments[event.action.actionType].push(msg.attachment);
    } catch (error) {
      prettyError('Failed loading embed', error);
      continue;
    }
  }

  try {
    for (const type of Object.keys(channels)) {
      if (!channels[type]) {
        continue;
      }
      const channel = await client.channels.fetch(channels[type]);
      for (var i = 0; i < embeds[type].length; i += 10) {
        const messages = await (channel as TextChannel).send({
          embeds: embeds[type].slice(i, i + 10),
          files: attachments[type].slice(i, i + 10)
        });
        console.log(
          `Successfully sent ${messages.embeds?.length} discord embeds to ${type} channel`
        );
      }
    }
  } catch (error) {
    prettyError('Discord message failed', error);
  }
};
