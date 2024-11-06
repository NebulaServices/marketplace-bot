import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { v4 as uuidv4 } from "uuid";
import { client } from "..";
import { uploadBgImage } from "../api/bgImage";
import { uploadPackageMetadata } from "../api/meta";
import { uploadStyle } from "../api/style";
import { uploadBgVideo } from "../api/bgVideo";

export const data = new SlashCommandBuilder()
  .setName("forcecreatetheme")
  .setDescription("Create your own marketplace theme!")
  .addStringOption((option) =>
    option
      .setName("title")
      .setDescription("The title for this theme")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("description")
      .setDescription("A description for this theme.")
      .setRequired(true)
  )
  .addAttachmentOption((option) =>
    option
      .setName("stylesheet")
      .setDescription("The CSS stylesheet for the theme")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("tags")
      .setDescription("Any tags for this theme, seperated by commas.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("username")
      .setDescription("The username for the creator of plugin.")
      .setRequired(true)
  )
  .addAttachmentOption((option) =>
    option
      .setName("image")
      .setDescription(
        "An image to display on the marketplace, showing off your theme."
      )
      .setRequired(true)
  )
  .addAttachmentOption((option) =>
    option
      .setName("background_image")
      .setDescription(
        "An image to use as the background. GIFs supported. 10mb size limit"
      )
  )
  .addAttachmentOption((option) =>
    option
      .setName("background_video")
      .setDescription("A short video to use as the background. 10mb size limit")
  );

export async function execute(interaction: any) {
  await interaction.deferReply({ ephemeral: true });

  if (
    interaction.options.getAttachment("background_video") &&
    interaction.options.getAttachment("background_image")
  ) {
    return interaction.editReply(
      "You can't have a background video and image at the same time!"
    );
  } else {
    if (interaction.member.roles.cache.has("1303567697610539049")) {
      const channel = client.channels.cache.get(
        "1273820292820766802"
      ) as TextChannel;

      const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("A user has submitted a theme!")
        .setAuthor({
          name: interaction.options.getString("username"),
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

      const ActionRowComponent = new ActionRowBuilder().addComponents(
        accept,
        deny
      );

      const backgroundImageUrl =
        interaction.options.getAttachment("background_image")?.url;
      const backgroundVideoUrl =
        interaction.options.getAttachment("background_video")?.url;

      const files = [interaction.options.getAttachment("stylesheet")];

      if (backgroundImageUrl) {
        files.push(interaction.options.getAttachment("background_image"));
      } else if (backgroundVideoUrl) {
        files.push(interaction.options.getAttachment("background_video"));
      }

      const newMsg = channel.send({
        embeds: [exampleEmbed],
        components: [ActionRowComponent as any],
        files: files,
      });

      interaction.editReply(
        "Your theme has been sent to staff for approval! Please wait 1-3 days for it to appear on Nebula!"
      );

      const confirmation = await (await newMsg).awaitMessageComponent({});
      if (confirmation.customId === "accept") {
        const packageUUID = uuidv4();
        console.log("Approved theme", interaction.options.getString("title"));
        console.log(interaction.options.getAttachment("image").url);
        try {
          const response = await fetch(
            interaction.options.getAttachment("image").url
          );
          const res = await response.blob();
          const payload = await fetch(
            interaction.options.getAttachment("stylesheet").url
          );
          const payloadRes = await payload.blob();

          await uploadPackageMetadata(
            // Vanilla
            packageUUID,
            interaction.options.getString("title"),
            interaction.options.getString("tags").split(","),
            interaction.options.getString("description"),
            interaction.options.getString("username"),
            `${packageUUID}.${interaction.options
              .getAttachment("image")
              .url.split("/")
              .pop()
              .split("?")[0]
              .split(".")
              .pop()}`,
            "theme",
            "1.0.0",
            `${packageUUID}.${interaction.options
              .getAttachment("stylesheet")
              .url.split("/")
              .pop()
              .split("?")[0]
              .split(".")
              .pop()}`,
            backgroundImageUrl
              ? `${packageUUID}_BACKGROUND.${backgroundImageUrl
                  .split("/")
                  .pop()
                  .split("?")[0]
                  .split(".")
                  .pop()}`
              : undefined,
            backgroundVideoUrl
              ? `${packageUUID}_BACKGROUND.${backgroundVideoUrl
                  .split("/")
                  .pop()
                  .split("?")[0]
                  .split(".")
                  .pop()}`
              : undefined
          );

          await uploadBgImage(
            res,
            `${packageUUID}.${interaction.options
              .getAttachment("image")
              .url.split("/")
              .pop()
              .split("?")[0]
              .split(".")
              .pop()}`,
            packageUUID
          );
          await uploadStyle(
            payloadRes,
            `${packageUUID}.${interaction.options
              .getAttachment("stylesheet")
              .url.split("/")
              .pop()
              .split("?")[0]
              .split(".")
              .pop()}`,
            packageUUID
          );

          if (backgroundImageUrl) {
            const res = await fetch(backgroundImageUrl);
            const blob = await res.blob();
            await uploadBgImage(
              blob,
              `${packageUUID}_BACKGROUND.${backgroundImageUrl
                .split("/")
                .pop()
                .split("?")[0]
                .split(".")
                .pop()}`,
              packageUUID
            );
          } else if (backgroundVideoUrl) {
            const res = await fetch(backgroundVideoUrl);
            const blob = await res.blob();
            await uploadBgVideo(
              blob,
              `${packageUUID}_BACKGROUND.${backgroundVideoUrl
                .split("/")
                .pop()
                .split("?")[0]
                .split(".")
                .pop()}`,
              packageUUID
            );
          }
        } catch (e) {
          console.error("err", e);
        }

        await confirmation.update({
          content:
            "Successfully accepted theme and put on marketplace with UUID " +
            packageUUID,
          components: [],
          embeds: [],
          files: [],
        });
      } else if (confirmation.customId === "deny") {
        console.log("Denied theme", interaction.options.getString("title"));
        await confirmation.update({
          content: "Successfully denied theme.",
          components: [],
          embeds: [],
          files: [],
        });
      }
    } else {
      interaction.editReply(
        "Only marketplace managers/admins can use this command!"
      );
    }
  }
}
