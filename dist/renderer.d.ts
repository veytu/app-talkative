import type { AppContext, ReadonlyTeleBox } from "@netless/window-manager";
import { SideEffectManager } from "side-effect-manager";
export declare class Renderer {
    readonly context: AppContext;
    readonly sideEffect: SideEffectManager;
    readonly box: ReadonlyTeleBox;
    readonly role: {
        readonly value: 0 | 2;
        set(newValue: 0 | 2): void;
        subscribe(listener: (value: 0 | 2) => void): () => void;
    };
    readonly ratio: {
        readonly value: number;
        set(newValue: number): void;
        subscribe(listener: (value: number) => void): () => void;
    };
    readonly $content: HTMLDivElement;
    readonly $iframe: HTMLIFrameElement;
    constructor(context: AppContext);
    private _on_update_role;
    private _on_update_ratio;
    private _observe_content_resize;
    mount(): () => void;
    destroy(): void;
    postMessage(message: unknown): void;
}
