// import { CoreAPIType } from "@ove/ove-types";
// import { BuildProcedure, ProcedureParams } from "@trpc/server";
// import { inferParser } from "@trpc/server/dist/core/parser";
//
// BuildProcedure<"query", {
//   _config: ProcedureParams["_config"];
//   _meta: ProcedureParams["_meta"];
//   _ctx_out: ProcedureParams["_ctx_out"];
//   _input_in: OverwriteIfDefined<ProcedureParams["_input_in"], inferParser<CoreAPIType[keyof CoreAPIType]["args"]>["in"]>;
//   _input_out: OverwriteIfDefined<ProcedureParams["_input_out"], inferParser<CoreAPIType[keyof CoreAPIType]["args"]>["out"]>;
//   _output_in: inferParser<CoreAPIType[keyof CoreAPIType]["bridge"]>["in"];
//   _output_out: inferParser<CoreAPIType[keyof CoreAPIType]["bridge"]>["out"]
// }, $Output>*/