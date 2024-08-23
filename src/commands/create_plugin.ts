import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Channel,
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextChannel,
} from "discord.js";
import { v4 as uuidv4 } from "uuid";
import { client } from "..";
import { upload_bg_image } from "../api/bg-image";
import { upload_package_metadata } from "../api/meta";
import { upload_javascript } from "../api/javascript";

export const data = new SlashCommandBuilder()
  .setName("create_plugin")
  .setDescription("Create your own marketplace plugin!")
  .addStringOption((option) =>
    option
      .setName("title")
      .setDescription("The title for this plugin")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("description")
      .setDescription("A description for this plugin.")
      .setRequired(true)
  )
  .addAttachmentOption((option) =>
    option
      .setName("javascript")
      .setDescription("The JavaScript for the payload")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("tags")
      .setDescription("Any tags for this plugin, seperated by commas.")
      .setRequired(true)
  )
  .addAttachmentOption((option) =>
    option
      .setName("image")
      .setDescription(
        "An image to display on the marketplace, showing off your plugin."
      )

      .setRequired(true)
  );

export async function execute(interaction: any) {
  await interaction.deferReply({
    ephemeral: true,
  });
  const channel = client.channels.cache.get(
    "1273820292820766802"
  ) as TextChannel;

  const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("A user has submitted a plugin!")
    .setAuthor({
      name: interaction.user.username,
    })
    .setDescription(interaction.options.getString("title"))
    .addFields(
      { name: "Title", value: interaction.options.getString("title") },
      {
        name: "Description",
        value: interaction.options.getString("description"),
      },
      { name: "Tags", value: interaction.options.getString("tags") }
    )
    .setImage(interaction.options.getAttachment("image").url)
    .setTimestamp();

  const deny = new ButtonBuilder()
    .setCustomId("deny")
    .setLabel("Deny")
    .setStyle(ButtonStyle.Danger);

  const accept = new ButtonBuilder()
    .setCustomId("accept")
    .setLabel("Accept")
    .setStyle(ButtonStyle.Success);

  const ActionRowComponent = new ActionRowBuilder().addComponents(accept, deny);

  const files = [interaction.options.getAttachment("javascript")];

  const new_msg = channel.send({
    embeds: [exampleEmbed],
    components: [ActionRowComponent as any],
    files: files,
  });

  interaction.editReply(
    "Your plugin has been sent to staff for approval! Please wait 1-3 days for it to appear on Nebula!"
  );

  const confirmation = await (await new_msg).awaitMessageComponent({});
  if (confirmation.customId === "accept") {
    const package_uuid = uuidv4();
    console.log("Approved plugin", interaction.options.getString("title"));
    console.log(interaction.options.getAttachment("image").url);
    try {
      const response = await fetch(
        interaction.options.getAttachment("image").url
      );

      const res_blob = await response.blob();

      const payload_response = await fetch(
        interaction.options.getAttachment("javascript").url
      );

      const payload_res_blob = await payload_response.blob();

      upload_bg_image(
        res_blob,
        package_uuid +
          "." +
          interaction.options
            .getAttachment("image")
            .url.split("/")
            .pop()
            .split("?")[0]
            .split(".")
            .pop()
      );

      upload_javascript(
        payload_res_blob,
        package_uuid +
          "." +
          interaction.options
            .getAttachment("javascript")
            .url.split("/")
            .pop()
            .split("?")[0]
            .split(".")
            .pop()
      );

      upload_package_metadata(
        // Vanilla
        package_uuid,
        interaction.options.getString("title"),
        interaction.options.getString("tags").split(","),
        interaction.options.getString("description"),
        interaction.user.username,
        package_uuid +
          "." +
          interaction.options
            .getAttachment("image")
            .url.split("/")
            .pop()
            .split("?")[0]
            .split(".")
            .pop(),
        "sw",
        "1.0.0",
        package_uuid +
          "." +
          interaction.options
            .getAttachment("javascript")
            .url.split("/")
            .pop()
            .split("?")[0]
            .split(".")
            .pop()
      );
    } catch (e) {
      console.error("err", e);
    }

    await confirmation.update({
      content:
        "Successfully accepted plugin and put on marketplace with UUID " +
        package_uuid,
      components: [],
      embeds: [],
      files: [],
    });
  } else if (confirmation.customId === "deny") {
    await confirmation.update({
      content: "Successfully denied plugin.",
      components: [],
      embeds: [],
      files: [],
    });
  }
}
