import config from './config.js';
import {createAuthClient} from './auth-client.js';
export {normalizePhone} from './auth-client.js';
export const auth=createAuthClient({config});
