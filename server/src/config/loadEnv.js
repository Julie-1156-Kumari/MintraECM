import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');

// Existing process.env values (e.g. Render) are not overwritten.
dotenv.config({ path: envPath });
