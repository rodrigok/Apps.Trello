import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IMessageAttachment, MessageActionType } from '@rocket.chat/apps-engine/definition/messages';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { TrelloApp } from '../TrelloApp';

export class ListBoards implements ISlashCommand {
    public command = 'trello';
    public i18nParamsExample = 'trello_command_params';
    public i18nDescription = 'trello_command_description';
    public providesPreview = false;

    constructor(private readonly app: TrelloApp) { }

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const boards = await this.app.sdk.getBoards(http);

        const association = new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, 'projects');
        const [data] = await read.getPersistenceReader().readByAssociation(association) as any;
        const connectedIds: Array<string> = (!data ? [] : data.projects || []).map((i) => i.board);

        const attachments: Array<IMessageAttachment> = boards
            .filter((board) => board.closed === false)
            .map((board): IMessageAttachment => {
                const connected = connectedIds.includes(board.id);
                return {
                    title: {
                        value: board.name,
                        link: board.url,
                    },
                    color: board.prefs.backgroundColor,
                    actions: [{
                        type: MessageActionType.BUTTON,
                        text: connected ? 'Desconectar' : 'Conectar',
                        msg: `/trello ${connected ? 'disconnect' : 'connect'} ${board.id}`,
                        msg_in_chat_window: true,
                    }],
                };
            });

        const builder = modify.getNotifier().getMessageBuilder();
        builder
            .setGroupable(false)
            .setRoom(context.getRoom())
            .setSender(context.getSender())
            .setAttachments(attachments);

        await modify.getNotifier().notifyRoom(context.getRoom(), builder.getMessage());
    }
}
