/* global URLSearchParams, window */

import { generateUUID } from "@ove/ove-utils";
import { setup } from "@ove/ove-mirror-tools";

const id = generateUUID();
const sectionId = new URLSearchParams(window.location.search.substring(1)).get("sectionId");

setup(id, sectionId);
