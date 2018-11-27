import { Component, h } from "preact";
import {
  MissingEthProviderAccountError,
  MissingEthProviderError,
  UnsupportedEthNetworkError,
} from "../../shared/errors";
import { ErrorModal } from "../Modal";

interface Props {
  error: Error;
  onCloseClick?: () => void;
}

export default class MetamaskErrorModal extends Component<Props> {
  public render = () => {
    return (
      <ErrorModal
        header={this._renderHeader()}
        errorText={this._renderErrorText()}
        onClose={this.props.onCloseClick}
      />
    );
  }

  private _renderHeader = () => {
    return (
      <div>
        <br/>
        <img src={require("./metamask-fox.png")} />
      </div>
    );
  }

  private _renderErrorText() {
    if (this.props.error instanceof MissingEthProviderAccountError) {
      return (
        <div>
          Looks like you have not selected an account on your Ethereum Provider.
          <br/>
          Please, double check it and try again.
        </div>
      );
    } else if (this.props.error instanceof MissingEthProviderError) {
      return (
        <div>
          <p>
            We have detected that you do not have an ethereum provider available in your
            browser, you should consider downloading Metamask!
          </p>
          <a href="https://metamask.io" target="_blank">
            Download Metamask
          </a>
        </div>
      );
    } else if (this.props.error instanceof UnsupportedEthNetworkError) {
      return (
        <div>
          <p>
            Looks like you have selected an Ethereum Network that is not
            supported by the current app.
            <br/>
            Consider switching to
            <b class="accent"> {this.props.error.supportedNetwork}</b>
          </p>
        </div>
      );
    } else {
      return this.props.error.message;
    }
  }
}
