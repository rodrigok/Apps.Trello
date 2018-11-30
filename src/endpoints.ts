import { HttpStatusCode, IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { IApp } from '@rocket.chat/apps-engine/definition/IApp';
import { ActionType, IHookData } from './interfaces';

export class HookEndpoint extends ApiEndpoint {
    public path: string = 'trellohook/:room';

    constructor(app: IApp) {
        super(app);
    }

    public async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence,
    ): Promise<IApiResponse> {
        // console.log('POST', JSON.stringify(request.content, null, 2));

        const data = request.content as IHookData;

        const builder = modify
            .getCreator()
            .startMessage()
            .setSender(await read.getUserReader().getById('rocket.cat'));

        switch (data.action.type) {
            case ActionType.CREATE_CARD:
                builder.setText(
                    // tslint:disable-next-line:max-line-length
                    `Card *${data.action.display.entities.card.text}* created at *${data.action.display.entities.list.text}* by *${data.action.display.entities.memberCreator.text}*`,
                );
                break;
            case ActionType.UPDATE_CARD:
                if (data.action.display.translationKey === 'action_archived_card') {
                    builder.setText(
                        `Card *${data.action.display.entities.card.text}* archived by *${data.action.display.entities.memberCreator.text}*`,
                    );
                    break;
                }
            default:
                return {
                    status: HttpStatusCode.OK,
                };
        }

        const room = await read.getRoomReader().getById(request.params.room);
        if (room) {
            builder.setRoom(room);

            modify.getCreator().finish(builder);
        }

        return {
            status: HttpStatusCode.OK,
        };
    }

    // tslint:disable-next-line:max-line-length
    public async head(request: IApiRequest, endpoint: IApiEndpointInfo, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<IApiResponse> {
        return {
            status: HttpStatusCode.OK,
        };
    }
}
