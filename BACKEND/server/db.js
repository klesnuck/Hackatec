import { createPool } from 'mysql2/promise';
import { DB_CONFIG } from './config.js';

export const pool = createPool(DB_CONFIG);
