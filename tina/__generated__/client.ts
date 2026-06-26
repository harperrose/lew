import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '9eac08e86cbe1fe631dec2cef3eb64ac8872b4cb', queries,  });
export default client;
  