import {
  CoreAPITransformSchema,
  type TCoreRoutesSchema,
} from "./core-transform";
import { z } from "zod";
// IGNORE PATH - dependency removed at runtime
import {
  type TGenerateMutation,
  type TGenerateQuery
} from "../../../../../apps/ove-core/src/app/hardware/router";

/* API */

export { CoreAPITransformSchema as CoreAPI, type TCoreRoutesSchema as TCoreAPI };

export type CoreRouter = {
  [Key in keyof TCoreRoutesSchema]: TCoreRoutesSchema[Key]["meta"]["openapi"]["method"] extends "GET" ?
    ReturnType<TGenerateQuery<Key>> : ReturnType<TGenerateMutation<Key>>
}

/* API Utility Types*/

/**
 * Output type for API function
 */
export type TCoreAPIOutput<Key extends keyof TCoreRoutesSchema> =
  z.infer<TCoreRoutesSchema[Key]["bridge"]>;
