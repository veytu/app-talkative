import type { AppContext, ReadonlyTeleBox } from "@netless/window-manager";
import { SideEffectManager } from "side-effect-manager";
import { append, attr, detach, element, writable } from "./utils";
import { arrowLeftSVG } from "./icons/arrow-left";
import { arrowRightSVG } from "./icons/arrow-right";

export class Footer {
  readonly sideEffect = new SideEffectManager();
  readonly box: ReadonlyTeleBox;
  readonly role = writable<0 | 2>(2);
  readonly text = writable("...");
  readonly $footer = element("div");
  readonly $btnLeft = element("button");
  readonly $btnRight = element("button");
  readonly $span = element("span");

  constructor(
    readonly context: AppContext,
    readonly onPrev: () => void,
    readonly onNext: () => void
  ) {
    this.box = context.getBox();
    append(this.$footer, this.$btnLeft);
    append(this.$footer, this.$span);
    append(this.$footer, this.$btnRight);
    attr(this.$footer, "class", "app-talkative-footer");
    attr(this.$btnLeft, "class", "app-talkative-btn app-talkative-btn-left");
    attr(this.$btnRight, "class", "app-talkative-btn app-talkative-btn-right");
    attr(this.$span, "class", "app-talkative-page");
    this.$btnLeft.appendChild(arrowLeftSVG("app-talkative"));
    this.$btnRight.appendChild(arrowRightSVG("app-talkative"));
    this.$btnLeft.addEventListener("click", this.onPrev);
    this.$btnRight.addEventListener("click", this.onNext);
  }

  private _on_update_role(role: 0 | 2) {
    this.$btnLeft.disabled = role === 2;
    this.$btnRight.disabled = role === 2;
    this.$footer.classList.toggle("owner", role === 0);
  }

  private _on_update_text(text: string) {
    this.$span.textContent = text;
  }

  mount() {
    this.box.mountFooter(this.$footer);

    this.sideEffect.addDisposer(this.role.subscribe(this._on_update_role.bind(this)));
    this.sideEffect.addDisposer(this.text.subscribe(this._on_update_text.bind(this)));

    return this.destroy.bind(this);
  }

  destroy() {
    this.sideEffect.flushAll();

    detach(this.$footer);
  }
}
