import {
  CommandInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextChannel,
} from "discord.js";
import { client } from "..";

export const data = new SlashCommandBuilder()
  .setName("create_plugin")
  .setDescription("Create your own marketplace plugin!")
  .addStringOption((option) =>
    option.setName("title").setDescription("The title for this plugin")
  )
  .addStringOption((option) =>
    option
      .setName("description")
      .setDescription("A description for this plugin.")
  )
  .addAttachmentOption((option) =>
    option
      .setName("javascript")
      .setDescription("The JavaScript for the payload")
  )
  .addStringOption((option) =>
    option
      .setName("tags")
      .setDescription("Any tags for this plugin, seperated by commas.")
  )
  .addAttachmentOption((option) =>
    option
      .setName("image")
      .setDescription(
        "An image to display on the marketplace, showing off your plugin."
      )
  );

export async function execute(interaction: CommandInteraction) {
  const channel = client.channels.cache.get(
    "1273820292820766802"
  ) as TextChannel;

  console.log(channel);
  channel.send("test");
  return interaction.reply("Pong!");
}
