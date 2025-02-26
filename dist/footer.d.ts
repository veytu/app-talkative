import type { AppContext, ReadonlyTeleBox } from "@netless/window-manager";
import { SideEffectManager } from "side-effect-manager";
export declare class Footer {
    readonly context: AppContext;
    readonly onPrev: () => void;
    readonly onNext: () => void;
    readonly sideEffect: SideEffectManager;
    readonly box: ReadonlyTeleBox;
    readonly role: {
        readonly value: 0 | 2;
        set(newValue: 0 | 2): void;
        subscribe(listener: (value: 0 | 2) => void): () => void;
    };
    readonly text: {
        readonly value: string;
        set(newValue: string): void;
        subscribe(listener: (value: string) => void): () => void;
    };
    readonly $footer: HTMLDivElement;
    readonly $btnLeft: HTMLButtonElement;
    readonly $btnRight: HTMLButtonElement;
    readonly $span: HTMLSpanElement;
    constructor(context: AppContext, onPrev: () => void, onNext: () => void);
    private _on_update_role;
    private _on_update_text;
    mount(): () => void;
    destroy(): void;
}
