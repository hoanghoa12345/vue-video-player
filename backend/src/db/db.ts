import { db } from "./index.ts";
import { settingsTable } from "./schema.ts";

export async function findAllSettings(): Promise<
  Array<{ key: string; value: string; dataType: string }>
> {
  return await db
    .select({
      key: settingsTable.key,
      value: settingsTable.value,
      dataType: settingsTable.dataType,
    })
    .from(settingsTable)
    .all();
}
