import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, TextChannel } from "discord.js";
import { v4 as uuidv4 } from "uuid";
import { client } from "..";
import { uploadBgImage } from "../api/bgImage";
import { uploadPackageMetadata } from "../api/meta";
import { uploadJS } from "../api/javascript";

export const data = new SlashCommandBuilder()
  .setName("create_plugin")
  .setDescription("Create your own marketplace plugin!")
  .addStringOption((option) =>
    option.setName("title").setDescription("The title for this plugin").setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("description").setDescription("A description for this plugin.").setRequired(true)
  )
  .addAttachmentOption((option) =>
    option.setName("javascript").setDescription("The JavaScript for the payload").setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("tags").setDescription("Any tags for this plugin, seperated by commas.").setRequired(true)
  )
  .addAttachmentOption((option) =>
    option.setName("image").setDescription("An image to display on the marketplace, showing off your plugin.").setRequired(true)
  )
  .addStringOption((option) => 
    option.setName("type").setDescription("The plugin type. Either page (run on a specific website) OR SW (uses workerware, see our docs)").setRequired(true)
    .addChoices({ name: 'Page', value: 'plugin-page'}, { name: 'SW', value: 'plugin-sw' } )
  );
                   

export async function execute(interaction: any) {
  await interaction.deferReply({ ephemeral: true });
  const channel = client.channels.cache.get("1273820292820766802") as TextChannel;
  const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("A user has submitted a plugin!")
    .setAuthor({ name: interaction.user.username })
    .setDescription(interaction.options.getString("title"))
    .addFields(
      { name: "Title", value: interaction.options.getString("title") },
      { name: "Description", value: interaction.options.getString("description") },
      { name: "Tags", value: interaction.options.getString("tags") },
      { name: 'Type', value: interaction.options.getString("type") }
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

  const newMsg = channel.send({
    embeds: [exampleEmbed],
    components: [ActionRowComponent as any],
    files: files,
  });

  interaction.editReply("Your plugin has been sent to staff for approval! Please wait 1-3 days for it to appear on Nebula!");

  const confirmation = await (await newMsg).awaitMessageComponent({});
  if (confirmation.customId === "accept") {
    const packageUuid = uuidv4();
    console.log("Approved plugin", interaction.options.getString("title"));
    console.log(interaction.options.getAttachment("image").url);
    try {
      const response = await fetch(interaction.options.getAttachment("image").url);
      const res = await response.blob();
      const payload = await fetch(interaction.options.getAttachment("javascript").url);
      const payloadRes = await payload.blob(); 

      await uploadPackageMetadata(
        // Vanilla
        packageUuid,
        interaction.options.getString("title"),
        interaction.options.getString("tags").split(","),
        interaction.options.getString("description"),
        interaction.user.username,
        `${packageUuid}.${interaction.options.getAttachment("image").url.split("/").pop().split("?")[0].split(".").pop()}`,
        interaction.options.getString("type"),
        "1.0.0",
        `${packageUuid}.${interaction.options.getAttachment("javascript").url.split("/").pop().split("?")[0].split(".").pop()}`
      );

      await uploadBgImage(res, `${packageUuid}.${interaction.options.getAttachment("image").url.split("/").pop().split("?")[0].split(".").pop()}`);
      await uploadJS(payloadRes, `${packageUuid}.${interaction.options.getAttachment("javascript").url.split("/").pop().split("?")[0].split(".").pop()}`); 
    } 
    catch (e) { console.error("err", e) }
    await confirmation.update({
      content: "Successfully accepted plugin and put on marketplace with UUID " + packageUuid,
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
