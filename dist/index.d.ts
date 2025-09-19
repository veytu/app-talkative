import type { NetlessApp } from "@netless/window-manager";
export declare const version: string;
export interface TalkativeAttributes {
    /** (required) courseware url */
    src: string;
    /** teacher's uid */
    uid: string;
    /** current page */
    page: number;
    pageNum: number;
    /** sync to new users */
    lastMsg: string;
}
export interface MagixEventPayloads {
    broadcast: string;
}
export interface TalkativeOptions {
    debug?: boolean;
    onLocalMessage?: (appId: string, event: Record<string, unknown>) => void;
    setReceivePostMessageFun?: (fun: (message: unknown) => void) => void;
    getInfoSync?: (configInfo: string) => unknown;
}
declare const Talkative: NetlessApp<TalkativeAttributes, MagixEventPayloads, TalkativeOptions>;
export default Talkative;
