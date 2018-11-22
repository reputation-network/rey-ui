import registerComponents, { ReyLoaderComponent, ReyPreComponent } from "./components";
import * as metamaskAddon from "./lib/metamask-addon";
import createReySdk from "./lib/rey-sdk";
import createReySdkHelpers from "./lib/rey-sdk-helpers";
import {
  buildAllowToRunModal, buildErrorModal, buildOptInModal,
  buildSelfRunModal, handleModalActions,
} from "./modals";
import createConfig, { Config } from "./shared/config";
import { MissingEthProviderAccountError, MissingEthProviderError, UnsupportedEthNetworkError } from "./shared/errors";

async function createReySdkWithHelpers(config: Config) {
  const sdk = createReySdk({
    ethereumProvider: await metamaskAddon.ethereumProvider(),
    registryContractAddress: config.registryContractAddress,
    reyContractAddress: config.reyContractAddress,
  });
  const helpers = createReySdkHelpers({sdk});
  return {...sdk, ...helpers};
}

async function showError(error: Error): Promise<never> {
  const modal = buildErrorModal(error);
  return handleModalActions<never>(modal, () => null)
    .catch(() => Promise.reject(error));
}

async function assertEthereumEnabledBrowser(config: Config) {
  const provider = await metamaskAddon.ethereumProvider();
  if (!provider) {
    await showError(new MissingEthProviderError());
  }
  const netId = await metamaskAddon.getNetwork();
  if (netId !== config.chainId) {
    await showError(new UnsupportedEthNetworkError());
  }
  const account = await metamaskAddon.defaultAccount();
  if (!account) {
    await showError(new MissingEthProviderAccountError());
  }
}

function createReyUi(_config: Partial<Config>) {
  const config = createConfig(_config);
  const _rey = createReySdkWithHelpers(config);
  return {
    /**
     * Presents the user with an "opt-in" kind of modal for the provided
     * options. This function returns a promise that is resolved once the user
     * has been informed about what is about to sign and has signed each message.
     *
     * @param {string} writer - Address of who is going to share the user's
     *  info via REY protocol. This is typically your address.
     * @returns {WritePermission}
     *
     * @see https://rey.readthedocs.io/en/latest/contents/reference/permissions.html#write-permission
     */
    async requestWritePermission(writePermissionOpts: { writer: string }) {
      await registerComponents();
      await assertEthereumEnabledBrowser(config);
      const rey = await _rey;
      await rey.getAppManifest(writePermissionOpts.writer);
      const _writePermission = await rey.buildUnsignedWritePermission(writePermissionOpts);
      const modal = buildOptInModal(_writePermission);
      return handleModalActions(modal, () =>
        rey.buildSignedWritePermission(_writePermission));
    },
    /**
     * Presents the user with an "allow-to-run" kind of modal for the provided
     * options. This function returns a promise that is resolved once the user
     * has been informed about what is about to sign and has signed each message.
     *
     * @param {string} opts.reader - Address of who is going to read the
     *  information about the user. This is typically your address.
     * @param {string} opts.source - Address of what REY app reader is requesting
     *  access to.
     * @param {number} opts.expiration - Unix Timestamp of when the user permission
     *  expires (in seconds!).
     * @param {string} opts.nonce - Unique identifier for this data exchange
     * @param {string} opts.verifier - Address of the REY verifier that will
     *  supervise any transaction related with this session. See Session.verifier
     * @returns {AllowToRunReturnType}
     *
     * @see https://rey.readthedocs.io/en/latest/contents/reference/permissions.html#read-permission
     * @see https://rey.readthedocs.io/en/latest/contents/reference/transactions.html#session
     */
    async requestAllowToRunPermissions(readPermissionOpts: {
      reader: string,
      source: string,
      verifier?: string,
      expiration?: number,
      nonce?: number | string,
    }) {
      await registerComponents();
      await assertEthereumEnabledBrowser(config);
      const rey = await _rey;
      await rey.getAppManifest(readPermissionOpts.source);

      const [_session, [_readPermission, ..._extraReadPermissions]] = await Promise.all([
        rey.buildUnsignedSession(readPermissionOpts),
        rey.buildUnsignedReadPermission(readPermissionOpts),
      ]);
      const modal = buildAllowToRunModal(_session, _readPermission, ..._extraReadPermissions);
      return handleModalActions(modal, async () => {
        const [session, [readPermission, extraReadPermissions]] = await Promise.all([
          rey.buildSignedSession(_session),
          rey.buildSignedReadPermission(_readPermission),
        ]);
        return { session, readPermission, extraReadPermissions };
      });
    },
    /**
     * TODO: :(
     * @param appAddress Address of the app to self-query
     */
    async openSelfRunPrompt(appParamsOpts: { source: string }) {
      await registerComponents();
      await assertEthereumEnabledBrowser(config);
      const appAddress = appParamsOpts.source;
      const rey = await _rey;
      const _appParams = await rey.buildUnsignedAppParams({ source: appAddress });
      const modal = buildSelfRunModal(_appParams);
      const modalActionHandler = async () => {
        const appParams = await rey.buildSignedAppParams({ source: appAddress });
        modal.querySelector("[slot=preface]").remove();
        (modal.querySelector("[slot=footer]") as HTMLElement).style.display = "none";
        const loader = new ReyLoaderComponent("retrieving your data...");
        loader.slot = "preface";
        modal.appendChild(loader);
        try {
          const result = await rey.queryApp(appAddress, appParams);
          const pre = new ReyPreComponent(result);
          pre.slot = "preface";
          modal.appendChild(pre);
        } catch (e) {
          const pre = new ReyPreComponent(e);
          pre.slot = "preface";
          modal.appendChild(pre);
        } finally {
          loader.remove();
        }
        // Return a promise that never completes, so the modal stays open
        // until closed, which is treated as a thrown error
        return new Promise(() => undefined);
      };
      try {
        await handleModalActions(modal, modalActionHandler);
      } catch (e) {
        console.warn(e);
        // Do nothing with the error, since it is "expected"
      }
      return undefined;
    },
  };
}

// Don't use export default since it breaks webpack umd behavior
module.exports = createReyUi;
