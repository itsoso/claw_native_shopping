import { defineConfig } from "wxt";

import { JD_CART_URL, JD_ITEM_URL } from "./src/config/targets.js";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    host_permissions: [JD_ITEM_URL, JD_CART_URL]
  }
});
