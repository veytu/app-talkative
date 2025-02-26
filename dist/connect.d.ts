import type { Logger } from "@netless/app-shared";
import type { AppContext } from "@netless/window-manager";
import type { TalkativeAttributes, MagixEventPayloads } from "./index";
export interface ConnectParams {
    context: AppContext<TalkativeAttributes, MagixEventPayloads>;
    logger: Logger;
    postMessage: (message: string) => void;
    onRatioChanged: (ratio: number) => void;
    isSentBySelf: (source: MessageEventSource | null) => boolean;
    onLocalMessage?: (appId: string, event: Record<string, unknown>) => void;
}
export declare function connect({ context, logger, ...callbacks }: ConnectParams): () => void;
