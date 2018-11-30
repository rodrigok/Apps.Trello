export enum ActionType {
    CREATE_CARD = 'createCard',
    UPDATE_CARD = 'updateCard',
}

export interface IBoard {
    id: string;
    name: string;
    desc: string;
    descData?: any;
    closed: boolean;
    idOrganization: string;
    invited: boolean;
    limits: ILimits;
    memberships: Array<IMembership>;
    pinned: boolean;
    starred: boolean;
    url: string;
    prefs: IPrefs;
    invitations: Array<any>;
    shortLink: string;
    subscribed: boolean;
    labelNames: ILabelNames;
    powerUps: Array<any>;
    dateLastActivity: string;
    dateLastView: string;
    shortUrl: string;
    idTags: Array<any>;
    datePluginDisable?: any;
}

export interface ILabelNames {
    green: string;
    yellow: string;
    orange: string;
    red: string;
    purple: string;
    blue: string;
    sky: string;
    lime: string;
    pink: string;
    black: string;
}

export interface IPrefs {
    permissionLevel: string;
    voting: string;
    comments: string;
    invitations: string;
    selfJoin: boolean;
    cardCovers: boolean;
    cardAging: string;
    calendarFeedEnabled: boolean;
    background: string;
    backgroundImage: string;
    backgroundImageScaled: Array<IBackgroundImageScaled>;
    backgroundTile: boolean;
    backgroundBrightness: string;
    backgroundColor: string;
    backgroundBottomColor: string;
    backgroundTopColor: string;
    canBePublic: boolean;
    canBeOrg: boolean;
    canBePrivate: boolean;
    canInvite: boolean;
}

export interface IBackgroundImageScaled {
    width: number;
    height: number;
    url: string;
}

export interface IMembership {
    id: string;
    idMember: string;
    memberType: string;
    unconfirmed: boolean;
    deactivated: boolean;
}

export interface ILimits {
    attachments: IAttachments;
    boards: IBoards;
    cards: ICards;
    checklists: IAttachments;
    customFields: IAttachments;
    labels: IAttachments;
    lists: ICards;
}

export interface ICards {
    openPerBoard: IPerBoard;
    totalPerBoard: IPerBoard;
}

export interface IBoards {
    totalMembersPerBoard: IPerBoard;
}

export interface IAttachments {
    perBoard: IPerBoard;
}

export interface IPerBoard {
    status: string;
    disableAt: number;
    warnAt: number;
}

export interface IWebhook {
    id: string;
    description: string;
    idModel: string;
    callbackURL: string;
    active: boolean;
}

export interface IHookData {
    model: IModel;
    action: IAction;
}

export interface IAction {
    id: string;
    idMemberCreator: string;
    data: IData;
    type: ActionType;
    date: string;
    limits: ILimits;
    display: IDisplay;
    memberCreator: IActionMemberCreator;
}

export interface IEntitiesMemberCreator {
    type: string;
    id: string;
    username: string;
    text: string;
}

export interface IActionMemberCreator {
    id: string;
    avatarHash: string;
    avatarUrl: string;
    fullName: string;
    idMemberReferrer?: any;
    initials: string;
    username: string;
}

export interface IDisplay {
    translationKey: string;
    entities: IEntities;
}

export interface IEntities {
    card: IEntitiesCard;
    listBefore: IListBefore;
    list: IListBefore;
    listAfter: IListBefore;
    memberCreator: IEntitiesMemberCreator;
}

export interface IListBefore {
    type: string;
    id: string;
    text: string;
}

export interface IEntitiesCard {
    type: string;
    idList: string;
    id: string;
    shortLink: string;
    text: string;
}

export interface ICard {
    shortLink: string;
    idShort: number;
    name: string;
    id: string;
    idList: string;
}

export interface IData {
    listAfter: IListAfter;
    listBefore: IListAfter;
    list: IListAfter;
    board: IBoard;
    card: ICard;
    old: IOld;
}

export interface IOld {
    idList: string;
}

export interface IBoard {
    shortLink: string;
    name: string;
    id: string;
}

export interface IListAfter {
    name: string;
    id: string;
}

export interface IModel {
    id: string;
    name: string;
    desc: string;
    descData?: any;
    closed: boolean;
    idOrganization?: any;
    pinned: boolean;
    url: string;
    shortUrl: string;
    prefs: IPrefs;
    labelNames: ILabelNames;
}
