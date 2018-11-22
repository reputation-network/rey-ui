import { AppManifest } from "rey-sdk/dist/app/types";
const manifestCache = new Map<string, AppManifest>();
/**
 * @deprecated
 * Don't base your implementation on this singleton cache since it
 * will be removed once the components using it (app-header and app name)
 * get reworked.
 */
export default manifestCache;
