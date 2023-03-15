import * as Utils from './lib/ove-utils'

import * as Logging from './lib/ove-logging';
import * as Json from './lib/ove-json';

// declare global {
//   interface Window {
//     Utils: object
//     Logging: (name: string, level: number) => Logger
//     Json: object
//   }
// }
//
// // global.window.Utils = Utils;
// // global.window.Logging = Logging;
// // global.window.Json = Json;

export {
  Utils,
  Logging,
  Json
}
