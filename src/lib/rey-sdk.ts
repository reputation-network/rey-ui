import App from "rey-sdk/dist/app";
import { AppManifest } from "rey-sdk/dist/app/types";
import ReyContract from "rey-sdk/dist/contracts";
import { ManifestEntry } from "rey-sdk/dist/contracts/registry";
import AppParams from "rey-sdk/dist/structs/app-params";
import singletonManifestCache from "./rey-manifest-cache";

interface ReySdkConfig {
  ethereumProvider: any;
  registryContractAddress: string;
  reyContractAddress: string;
  manifestEntryCache?: Map<string, ManifestEntry>;
  manifestCache?: Map<string, AppManifest>;
}

type ReySdk = ReturnType<typeof createReySdk>;

function createReySdk(config: ReySdkConfig) {
  const sdk = {
    createContract() {
      return ReyContract(config.ethereumProvider, {
        registry: config.registryContractAddress,
        rey: config.reyContractAddress,
      });
    },

    createAppClient(address: string) {
      const contract = sdk.createContract();
      return new App(address, {
        contract,
        manifestEntryCache: config.manifestEntryCache || new Map(),
        manifestCache: config.manifestCache || singletonManifestCache,
      });
    },

    getAppManifestEntry(address: string) {
      const app = sdk.createAppClient(address);
      return app.manifestEntry();
    },

    getAppManifest(address: string) {
      const app = sdk.createAppClient(address);
      return app.manifest();
    },

    getAppExtraReadPermissions(address: string) {
      const app = sdk.createAppClient(address);
      return app.extraReadPermissions();
    },

    queryApp(address: string, params: AppParams) {
      const app = sdk.createAppClient(address);
      return app.query(params);
    },
  };
  return sdk;
}

export default createReySdk;
export { ReySdk, ReySdkConfig };

// Export relevant rey-sdk modules
// # Sign strategies
import DummySign from "rey-sdk/dist/sign-strategies/dummy";
import MetamaskSign from "rey-sdk/dist/sign-strategies/metamask";
import { SignStrategy } from "rey-sdk/dist/types";
export { DummySign, MetamaskSign, SignStrategy };
// # Blockchain Structs
import Factory from "rey-sdk/dist/structs/factory";
import ReadPermission from "rey-sdk/dist/structs/read-permission";
import Session from "rey-sdk/dist/structs/session";
import WritePermission from "rey-sdk/dist/structs/write-permission";
export { Factory, ReadPermission, Session, WritePermission };
// # App structs
import EncryptionKey from "rey-sdk/dist/utils/encryption-key";
export { AppParams, EncryptionKey};