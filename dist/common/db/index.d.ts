import { Pool } from 'pg';
import * as schema from './schema';
declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
    $client: Pool;
};
export default db;
