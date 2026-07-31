import { SelectSetting } from "../db/schema.ts";

export type SettingsMap = Record<string, any>;

export type Env = {
  Variables: {
    settings: SettingsMap;
    settingsRaw: SelectSetting[];
    user: { id?: string; sub: string; email?: string; name?: string };
  };
};
