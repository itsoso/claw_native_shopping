import { createShadowRootUi } from "wxt/utils/content-script-ui/shadow-root";
import { defineContentScript } from "wxt/utils/define-content-script";

import { JD_CART_URL } from "../src/config/targets.js";
import { mountReactNode } from "../src/content/mount.js";
import { CartPagePanel } from "../src/content/cartPage.js";

export default defineContentScript({
  matches: [JD_CART_URL],
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "openclaw-cart-page",
      position: "overlay",
      alignment: "bottom-right",
      anchor: "body",
      append: "last",
      zIndex: 2147483647,
      onMount(uiContainer) {
        return mountReactNode(uiContainer, <CartPagePanel />);
      },
      onRemove(root) {
        root?.unmount();
      },
    });

    ui.mount();
  },
});
