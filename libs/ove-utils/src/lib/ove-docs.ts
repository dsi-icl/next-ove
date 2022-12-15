// import * as fs from "fs";
// import { Logger } from "@ove/ove-utils";
// import Constants from "./ove-constants";
// import * as yamljs from "yamljs";
//
// export const buildAPIDocs = (name: string, swaggerPath: string, packagePath: string, swaggerExtPath: string, ...args: string[]) => {
//   const log = Logger('Utils')
//   if (!fs.existsSync(packagePath)) {
//     log.warn('Failed to build Swagger API documentation, as package.json does not exist at path:', packagePath)
//     return
//   }
//   log.debug('Building Swagger API documentation');
//   // Swagger API documentation
//   const swaggerDoc = (function (swagger, pjson) {
//     swagger.basePath = swagger.basePath.replace(Constants.RegExp.Annotation.APP_NAME, name);
//     swagger.info.title = swagger.info.title.replace(Constants.RegExp.Annotation.NAME, pjson.name);
//     swagger.info.version = swagger.info.version.replace(Constants.RegExp.Annotation.VERSION, pjson.version);
//     swagger.info.license.name = swagger.info.license.name.replace(Constants.RegExp.Annotation.LICENSE, pjson.license);
//     // Extract e-mail address from format within package.json
//     swagger.info.contact.email = swagger.info.contact.email.replace(Constants.RegExp.Annotation.AUTHOR,
//       pjson.author.substring(pjson.author.indexOf('<') + 1, pjson.author.indexOf('>')));
//     return swagger;
//   })(yamljs.load(fs.readFileSync(swaggerPath)), require(packagePath));
//
//   // App-specific swagger extensions
//   if (args.length > 2 && swaggerExtPath) {
//     (function (swaggerDoc, swaggerExt) {
//       if (fs.existsSync(swaggerExt)) {
//         const swagger = yamljs.load(fs.readFileSync(swaggerExt));
//         // Copying tags (which is an array)
//         swaggerDoc.tags = (swagger.tags)
//         // Copying paths (which are properties of the paths object)
//         Object.keys(swagger.paths).forEach(function (e) {
//           swaggerDoc.paths[e] = swagger.paths[e];
//         });
//       }
//     })(swaggerDoc, swaggerExtPath);
//   }
//
//   app.use(Constants.SWAGGER_API_DOCS_CONTEXT, swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
//
//     swaggerOptions: {
//       defaultModelsExpandDepth: -1
//     }
//   }));
// };
