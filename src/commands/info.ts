import { ICommand } from '../interfaces/ICommand.js';
import { db } from '../glob.js';
import { ChatInputCommandInteraction, Client, SlashCommandBuilder, ModalBuilder, ModalActionRowComponentBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionsBitField, MessageFlags } from 'discord.js';

export default class implements ICommand {
    data = new SlashCommandBuilder()
        .setName('info')
        .setDescription('Info messages.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Reply with an info message.')
                .addStringOption(option => option.setName('tag').setDescription('The tag of the message to send').setMaxLength(255).setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new info message.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete an info message.')
                .addStringOption(option => option.setName('tag').setDescription('The tag of the message to delete').setMaxLength(255).setRequired(true)))

    guildOnly = true;

    async run(_client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
        if (interaction.options.getSubcommand() === 'show') {
            interaction.reply((db.prepare('SELECT * FROM info WHERE tag = ? AND guild_id = ?').get(interaction.options.getString('tag'), interaction.guild?.id) as { guild_id: string, tag: string, content: string }).content);
        } else {
            if (!(interaction.member?.permissions as Readonly<PermissionsBitField>).has('Administrator')) return;
            if (interaction.options.getSubcommand() === 'create') {
                const modal = new ModalBuilder()
                    .setCustomId('createInfo')
                    .setTitle('Create a new info message');

                const tagInput = new TextInputBuilder()
                    .setCustomId('tag')
                    .setLabel("Tag")
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(255)
                    .setRequired(true);

                const contentInput = new TextInputBuilder()
                    .setCustomId('content')
                    .setLabel("Content")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(tagInput);
                const secondActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(contentInput);

                modal.addComponents(firstActionRow, secondActionRow);

                await interaction.showModal(modal);
            } else if (interaction.options.getSubcommand() === 'delete') {
                db.prepare('DELETE FROM info WHERE tag = ? AND guild_id = ?').run(interaction.options.getString('tag'), interaction.guild?.id);
                interaction.reply({ content: 'Deleted!', flags: MessageFlags.Ephemeral });
            }
        }
    }
}
