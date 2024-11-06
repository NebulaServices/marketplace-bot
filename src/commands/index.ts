import * as ping from "./ping";
import * as createTheme from "./createTheme";
import * as createPlugin from "./createPlugin";
import * as forceCreatePlugin from "./forceCreatePlugin";
import * as forceCreateTheme from "./forceCreateTheme";

export const commands = {
  ping: ping,
  createplugin: createPlugin,
  createtheme: createTheme,
  forceCreatePlugin: forceCreatePlugin,
  forceCreateTheme: forceCreateTheme,
};
