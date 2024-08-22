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
import { upload_style } from "../api/style";
import { upload_bg_video } from "../api/bg-video";

export const data = new SlashCommandBuilder()
  .setName("create_theme")
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
  await interaction.deferReply({
    ephemeral: true,
  });
  if (
    interaction.options.getAttachment("background_video") &&
    interaction.options.getAttachment("background_image")
  ) {
    return interaction.editReply(
      "You can't have a background video and image at the same time!"
    );
  } else {
    const channel = client.channels.cache.get(
      "1273820292820766802"
    ) as TextChannel;

    const exampleEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("A user has submitted a theme!")
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

    const ActionRowComponent = new ActionRowBuilder().addComponents(
      accept,
      deny
    );

    const new_msg = channel.send({
      embeds: [exampleEmbed],
      components: [ActionRowComponent as any],
      files: [interaction.options.getAttachment("stylesheet")],
    });

    interaction.editReply(
      "Your theme has been sent to staff for approval! Please wait 1-3 days for it to appear on Nebula!"
    );

    const confirmation = await (await new_msg).awaitMessageComponent({});
    if (confirmation.customId === "accept") {
      const package_uuid = uuidv4();
      console.log("Approved theme", interaction.options.getString("title"));
      console.log(interaction.options.getAttachment("image").url);
      try {
        const response = await fetch(
          interaction.options.getAttachment("image").url
        );

        const res_blob = await response.blob();

        const payload_response = await fetch(
          interaction.options.getAttachment("stylesheet").url
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

        upload_style(
          payload_res_blob,
          package_uuid +
            "." +
            interaction.options
              .getAttachment("stylesheet")
              .url.split("/")
              .pop()
              .split("?")[0]
              .split(".")
              .pop()
        );

        const backgroundImageUrl =
          interaction.options.getAttachment("background_image")?.url;
        const backgroundVideoUrl =
          interaction.options.getAttachment("background_video")?.url;

        if (backgroundImageUrl) {
          const bg_image_url_res = await fetch(backgroundImageUrl);

          const bg_image_url_res_blob = await bg_image_url_res.blob();

          upload_bg_image(
            bg_image_url_res_blob,
            package_uuid +
              "_BACKGROUND" +
              "." +
              backgroundImageUrl.split("/").pop().split("?")[0].split(".").pop()
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
            "theme",
            "1.0.0",
            package_uuid +
              "." +
              interaction.options
                .getAttachment("stylesheet")
                .url.split("/")
                .pop()
                .split("?")[0]
                .split(".")
                .pop(),
            package_uuid +
              "_BACKGROUND." +
              backgroundImageUrl.split("/").pop().split("?")[0].split(".").pop()
          );
        } else if (backgroundVideoUrl) {
          // Background video
          const bg_vid_url_res = await fetch(backgroundVideoUrl);

          const bg_vid_url_res_blob = await bg_vid_url_res.blob();

          upload_bg_video(
            bg_vid_url_res_blob,
            package_uuid +
              "_BACKGROUND" +
              "." +
              backgroundVideoUrl.split("/").pop().split("?")[0].split(".").pop()
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
            "theme",
            "1.0.0",
            package_uuid +
              "." +
              interaction.options
                .getAttachment("stylesheet")
                .url.split("/")
                .pop()
                .split("?")[0]
                .split(".")
                .pop(),
            undefined,
            package_uuid +
              "_BACKGROUND." +
              backgroundVideoUrl.split("/").pop().split("?")[0].split(".").pop()
          );
        } else {
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
            "theme",
            "1.0.0",
            package_uuid +
              "." +
              interaction.options
                .getAttachment("stylesheet")
                .url.split("/")
                .pop()
                .split("?")[0]
                .split(".")
                .pop()
          );
        }
      } catch (e) {
        console.error("err", e);
      }

      await confirmation.update({
        content:
          "Successfully accepted theme and put on marketplace with UUID " +
          package_uuid,
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
  }
}
