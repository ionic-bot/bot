import { Client, Interaction, MessageFlags } from 'discord.js';

import { commands, db } from '../glob.js';

export default async function (client: Client, interaction: Interaction) {
	if (interaction.isChatInputCommand()) {
		const command = commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.run(client, interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			}
		}
	} else if (interaction.isModalSubmit()) {
		if (interaction.customId === 'createInfo') {
			const infoTag = interaction.fields.getTextInputValue('tag');
			const infoContent = interaction.fields.getTextInputValue('content');

			db.prepare(
				'INSERT INTO info (guild_id, tag, content) VALUES (?, ?, ?)',
			).run(
				interaction.guild?.id, infoTag, infoContent
			);
			await interaction.reply({ content: "Created!", flags: MessageFlags.Ephemeral });
		}
	}
}
