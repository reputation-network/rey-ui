import defineCustomElements from "./customElements";
import * as metamaskAddon from "./lib/metamask-addon";
import createReySdk from "./lib/rey-sdk";
import createReySdkHelpers from "./lib/rey-sdk-helpers";
import { showAllowToRunModal, showErrorModal, showOptInModal, showSelfRunModal } from "./modals";
import createConfig, { Config, Environment } from "./shared/config";
import { MissingEthProviderAccountError, MissingEthProviderError, UnsupportedEthNetworkError } from "./shared/errors";

async function createReySdkWithHelpers(config: Config) {
  const sdk = createReySdk({
    ethereumProvider: await metamaskAddon.ethereumProvider(),
    registryContractAddress: config.registryContractAddress,
    reyContractAddress: config.reyContractAddress,
  });
  const helpers = createReySdkHelpers({
    sdk,
    signStrategy: config.signStrategy,
  });
  return {...sdk, ...helpers};
}

async function assertEthereumEnabledBrowser(config: Config) {
  const provider = await metamaskAddon.ethereumProvider();
  if (!provider) {
    await showErrorModal(new MissingEthProviderError());
  }
  const netId = await metamaskAddon.getNetwork();
  if (netId !== config.chainId) {
    await showErrorModal(new UnsupportedEthNetworkError(config.chainId));
  }
  const account = await metamaskAddon.defaultAccount();
  if (!account) {
    await showErrorModal(new MissingEthProviderAccountError());
  }
}

/**
 * Creates a rey-ui instance.
 * @param {string|object} config environment alias or a configuration object
 * @param {string} config.environment Environment alias for defaults:
 *  values are: "prod", "dev", "test", "custom".
 * @param {string} [config.chainId] The ethereum chainId that this ui should
 *  give support to. If the user attemtps to use the UI while having a diferent
 *  chainId an error promtp will be presented until suggesting to change to
 *  this specified network.
 * @param {string} [config.registryContractAddress] The address of the registry
 *  contract to use when checking REY app's information
 * @param {string} [config.reyContractAddress] The address of the rey
 *  contract to use when commiting info to the blockchain.
 */
function createReyUi(_config: Environment|Partial<Config>) {
  const config = createConfig(_config);
  const _rey = createReySdkWithHelpers(config);
  const customElementsDefined = defineCustomElements();
  return {
    /**
     * Presents the user with an "opt-in" kind of modal for the provided
     * options. This function returns a promise that is resolved once the user
     * has been informed about what is about to sign and has signed the write
     * permission.
     *
     * @param {string} writer - Address of who is going to share the user's
     *  info via REY protocol. This is typically YOUR address as an app.
     * @returns {WritePermission} A write permission signed by the user/subject
     *
     * @see https://rey.readthedocs.io/en/latest/contents/reference/permissions.html#write-permission
     */
    async requestWritePermission(writePermissionOpts: { writer: string }) {
      await customElementsDefined;
      await assertEthereumEnabledBrowser(config);
      const rey = await _rey;
      const [_writePermission, appRenderDataRecord] = await Promise.all([
        rey.buildUnsignedWritePermission(writePermissionOpts),
        rey.buildAppRenderDataRecord(writePermissionOpts.writer),
      ]);
      return showOptInModal({
        appRenderDataRecord,
        writePermission: _writePermission,
        onSign: () => rey.buildSignedWritePermission(_writePermission),
      });
    },
    /**
     * Presents the user with an "allow-to-run" kind of modal for the provided
     * options. This function returns a promise that is resolved once the user
     * has been informed about what is about to sign and has signed each message.
     *
     * @param {string} opts.reader - Address of who is going to read the
     *  information about the user. This is typically YOUR address.
     * @param {string} opts.source - Address of what REY app the reader is
     * requesting access to.
     * @param {number} opts.expiration - Timestamp of when the user permission
     *  expires (in seconds!).
     * @param {string} [opts.nonce] - Unique identifier for this data exchange,
     *  it will default to a random nonce if none is provided
     * @param {string} [opts.verifier] - Address of the REY verifier that will
     *  supervise any transaction related with this session. See Session.verifier.
     *  Defaults to Traity Verifier
     * @returns {object} An object containing session, request and
     *  any extraReadPermissions, all of them signed by the user
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
      await customElementsDefined;
      await assertEthereumEnabledBrowser(config);
      const rey = await _rey;
      await rey.getAppManifest(readPermissionOpts.source);

      const [_session, [_readPermission, ..._extraReadPermissions]] = await Promise.all([
        rey.buildUnsignedSession(readPermissionOpts),
        rey.buildUnsignedReadPermission(readPermissionOpts),
      ]);
      const appRenderDataRecord = await rey.buildAppRenderDataRecord(
        _readPermission.reader,
        _readPermission.source,
        ..._extraReadPermissions.map((rp) => rp.source),
      );
      return showAllowToRunModal({
        appRenderDataRecord,
        session: _session,
        readPermission: _readPermission,
        extraReadPermissions: _extraReadPermissions,
        onSign: () => {
          return Promise.all([
            rey.buildSignedSession(_session),
            rey.buildSignedReadPermission(_readPermission),
          ]).then(([session, [readPermission, extraReadPermissions]]) => {
            return { session, readPermission, extraReadPermissions };
          });
        },
      });
    },
    /**
     * TODO: :(
     * @param appAddress Address of the app to self-query
     */
    async openSelfRunPrompt(appParamsOpts: { source: string }) {
      await customElementsDefined;
      await assertEthereumEnabledBrowser(config);
      const appAddress = appParamsOpts.source;
      const rey = await _rey;
      const _appParams = await rey.buildUnsignedAppParams({ source: appAddress });
      const appRenderDataRecord = await rey.buildAppRenderDataRecord(
        _appParams.request.readPermission.source,
        ..._appParams.extraReadPermissions.map((rp) => rp.source),
      );
      return showSelfRunModal({
        appRenderDataRecord,
        appParams: _appParams,
        fetchData: async () => {
          const appParams = await rey.buildSignedAppParams({ source: appAddress });
          return rey.queryApp(appAddress, appParams);
        },
      });
    },
  };
}

// Don't use export default since it breaks webpack umd behavior
module.exports = createReyUi;
