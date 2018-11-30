import {
    IAppAccessors, IConfigurationExtend, IConfigurationModify, IEnvironmentRead, IHttp, ILogger, IModify, IPersistence, IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IMessage, IPostMessageSent } from '@rocket.chat/apps-engine/definition/messages';
import { IAppInfo, RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';
import * as url from 'url';
import { HookEndpoint } from './src/endpoints';
import { SDK } from './src/sdk';
import { ListBoards } from './src/slashcommand';

export class TrelloApp extends App implements IPostMessageSent {
    public sdk: SDK;
    private connectRegExp: RegExp = /^\/trello connect .+/;
    private disconnectRegExp: RegExp = /^\/trello disconnect .+/;

    protected constructor(info: IAppInfo, logger: ILogger, accessors?: IAppAccessors) {
        super(info, logger, accessors);

        this.sdk = new SDK();

        this.getAccessors().reader.getEnvironmentReader().getSettings().getValueById('key').then((value) => this.sdk.setKey(value));
        this.getAccessors().reader.getEnvironmentReader().getSettings().getValueById('token').then((value) => this.sdk.setToken(value));
    }

    public async executePostMessageSent(message: IMessage, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<void> {
        if (!message.text) {
            return;
        }

        const baseUrl = await read.getEnvironmentReader().getServerSettings().getValueById('Site_Url');
        const [hook] = this.getAccessors().providedApiEndpoints;
        const callbackURL = url.resolve(url.resolve(baseUrl, hook.computedPath), message.room.id);

        const builder = modify
            .getNotifier()
            .getMessageBuilder()
            .setRoom(message.room);

        if (this.connectRegExp.test(message.text)) {
            builder.setText('Conectando...');
            modify.getNotifier().notifyRoom(message.room, builder.getMessage());

            const id = message.text.replace('/trello connect ', '');

            const webhooks = await this.sdk.getWebhooks(http);
            const exists = webhooks.find((w) => w.idModel === id && w.callbackURL === callbackURL);
            if (exists) {
                await this.sdk.removeWebhook(http, exists.id);
            }

            const webhookResponse = await this.sdk.createWebhook(http, id, callbackURL);

            if (!webhookResponse) {
                builder.setText('Oops. Problemas ao conectar');
                modify.getNotifier().notifyRoom(message.room, builder.getMessage());
                return;
            }

            const association = new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, 'projects');

            let [data] = await read.getPersistenceReader().readByAssociation(association) as any;

            if (!data || !data.projects) {
                data = {
                    projects: [],
                };
            }

            const saved = data.projects.find((i) => i.board === id);
            if (!saved) {
                const index = data.projects.indexOf(saved);
                if (index > -1) {
                    data.projects.splice(index, 1);
                }
            }

            data.projects.push({
                board: id,
                webhook: webhookResponse.id,
            });

            await persistence.updateByAssociation(association, data, true);

            builder.setText('Conectado');
            modify.getNotifier().notifyRoom(message.room, builder.getMessage());
        }

        if (this.disconnectRegExp.test(message.text)) {
            builder.setText('Disconectando...');
            modify.getNotifier().notifyRoom(message.room, builder.getMessage());

            const id = message.text.replace('/trello disconnect ', '');

            const association = new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, 'projects');

            const [data] = await read.getPersistenceReader().readByAssociation(association) as any;

            if (data && data.projects) {
                const item = data.projects.find((i) => i.board === id);

                if (item) {
                    await this.sdk.removeWebhook(http, item.webhook);

                    const index = data.projects.indexOf(item);
                    if (index > -1) {
                        data.projects.splice(index, 1);
                        await persistence.updateByAssociation(association, data, true);
                    }
                }
            }

            builder.setText('Desconectado');
            modify.getNotifier().notifyRoom(message.room, builder.getMessage());
        }
    }

    public async extendConfiguration(configuration: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {
        await configuration.settings.provideSetting({
            id: 'key',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'key',
        });

        await configuration.settings.provideSetting({
            id: 'token',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'token',
        });

        await configuration.slashCommands.provideSlashCommand(new ListBoards(this));

        await configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [
                new HookEndpoint(this),
            ],
        });
    }

    public async onSettingUpdated(setting: ISetting, configurationModify: IConfigurationModify, read: IRead, http: IHttp): Promise<void> {
        if (setting.id === 'key') {
            this.sdk.setKey(setting.value);
        }
        if (setting.id === 'token') {
            this.sdk.setToken(setting.value);
        }
    }
}
