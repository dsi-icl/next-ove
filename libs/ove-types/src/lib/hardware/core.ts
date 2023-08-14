import { CoreAPIRoutes, type CoreAPIRoutesType } from "./core-transform";
import { z } from "zod";

/* API Keys */

export type CoreAPIKeys = keyof CoreAPIRoutesType;

/* API Type */

export type CoreAPIType = {
  [Key in CoreAPIKeys]: CoreAPIRoutesType[Key]
};

/* API */

export { CoreAPIRoutes as CoreAPI };

/* API Utility Types*/

export type CoreAPIMethod<Key extends CoreAPIKeys> =
  CoreAPIType[Key]["meta"]["openapi"]["method"];
export type CoreAPIReturns<Key extends CoreAPIKeys> =
  z.infer<CoreAPIType[Key]["bridge"]>;
