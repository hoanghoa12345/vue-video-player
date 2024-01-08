import * as dotenv from "dotenv";
import CyclicDb from "@cyclic.sh/dynamodb";

dotenv.config();

export const db = CyclicDb(process.env.CYCLIC_DB);
