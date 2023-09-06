import {
  CoreAPITransformSchema,
  type TCoreRoutesSchema,
} from "./core-transform";
import { z } from "zod";

/* API */

export { CoreAPITransformSchema as CoreAPI, type TCoreRoutesSchema as TCoreAPI };

/* API Utility Types*/

/**
 * Output type for API function
 */
export type TCoreAPIOutput<Key extends keyof TCoreRoutesSchema> =
  z.infer<TCoreRoutesSchema[Key]["bridge"]>;
