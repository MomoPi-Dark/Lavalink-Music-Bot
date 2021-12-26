import Lava from "../../structures/Lava";
import DiscordClient from "../../structures/Client";
import { Player } from "erela.js";
import Logger from "../../class/Logger";
import { TextBasedChannels } from "discord.js";
import { getModel } from "../../utils/client-functions";
import { generateEmbed } from "../../utils/lavalink-function";
import { IMusicInterface } from "../../Models";

export default class TrackEnd extends Lava {
    constructor(client: DiscordClient) {
        super(client, {
            name: 'trackEnd'
        });
    }

    async run(player: Player) {
        const currentText = player.get("currentText") as boolean;
        if (currentText) {
            const data = await getModel("IMusic", { guildId: player.guild as string }) as IMusicInterface | void;
            if (!data) return;

            const messageId = data.musicId;
            let guild = this.client.guilds.cache.get(player.guild);
            if (!guild) return;

            let channel = guild.channels.cache.get(data.channelId) as any;
            if (!channel) channel = await guild.channels.fetch(data.channelId).catch(err => Logger.log("ERROR", err)) || false;
            if (!channel) return;
            
            let message = channel.messages.cache.get(messageId);
            if (!message) message = await channel.messages.fetch(messageId).catch((err: any) => Logger.log("ERROR", err)) || false;

            const gdata = generateEmbed(this.client, player.guild, false);
            message.edit(gdata).catch((err: any) => Logger.log("ERROR", err));
        } else {
            player.stop();
            const trackErr = player.get("trackErr") as boolean
            if (trackErr) return;
            const channel = this.client.channels.cache.get(player.textChannel as string) as TextBasedChannels;
            let message = channel.messages.cache.get(player.get("currentMessageId"))
            message?.delete().catch(err => Logger.log("ERROR", err));
        }
    }
}