import { HttpStatusCode, IHttp } from '@rocket.chat/apps-engine/definition/accessors';
import { IBoard, IWebhook } from './interfaces';

enum endpoints {
    MY_BOARDS = 'https://api.trello.com/1/member/me/boards',
    WEBHOOKS = 'https://api.trello.com/1/webhooks',
    TOKEN_WEBHOOKS = 'https://api.trello.com/1/tokens/{token}/webhooks',
}

export class SDK {
    private auth: {
        [key: string]: string,
    };

    constructor() {
        this.auth = {};
    }

    public setKey(key: string) {
        console.log('setKey', key);
        this.auth.key = key;
    }

    public setToken(token: string) {
        console.log('setToken', token);
        this.auth.token = token;
    }

    public async getBoards(http: IHttp): Promise<Array<IBoard>> {
        console.log(this.auth);
        const response = await http.get(endpoints.MY_BOARDS, {
            params: this.auth,
        });

        if (response.statusCode !== HttpStatusCode.OK) {
            console.error({response});
            return [];
        }

        return response.data as Array<IBoard>;
    }

    public async createWebhook(http: IHttp, idModel: string, callbackURL: string): Promise<IWebhook | undefined> {
        const response = await http.post(endpoints.WEBHOOKS, {
            params: Object.assign({
                idModel,
                callbackURL,
            }, this.auth),
        });

        if (response.statusCode !== HttpStatusCode.OK) {
            console.error({response});
            return;
        }

        return response.data as IWebhook;
    }

    public async removeWebhook(http: IHttp, idWebook: string): Promise<Array<IWebhook>> {
        const response = await http.del(endpoints.WEBHOOKS + `/${idWebook}`, {
            params: this.auth,
        });

        if (response.statusCode !== HttpStatusCode.OK) {
            console.error({response});
            return [];
        }

        return response.data as Array<IWebhook>;
    }

    public async getWebhooks(http: IHttp): Promise<Array<IWebhook>> {
        const response = await http.get(endpoints.TOKEN_WEBHOOKS.replace('{token}', this.auth.token), {
            params: this.auth,
        });

        if (response.statusCode !== HttpStatusCode.OK) {
            console.error({response});
            return [];
        }

        return response.data as Array<IWebhook>;
    }
}
