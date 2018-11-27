import { cloneElement, Component, h } from "preact";
import AppHeader from "../AppHeader";
import CtaButton from "../CtaButton";
import Modal from "./Modal";

interface Props {
  appAddress: string;
  appName: string;
  appIconUrl: string;
  appDescription: string;
  preface: JSX.Element; // FIXME: Ensure onOpenDetail prop type!
  overlayContents: JSX.Element[];
  acceptButton?: JSX.Element;
  acceptButtonText: string;
  onAccept: () => void;
  onClose: () => void;
}

export default class SignModal extends Component<Props> {
  public state = {
    disableAcceptButton: false,
    overlayOpen: false,
  };

  public render = () => {
    const header = (
      <AppHeader
        address={this.props.appAddress}
        name={this.props.appName}
        iconUrl={this.props.appIconUrl}
        description={this.props.appDescription}
      />
    );
    const acceptButton = this.props.acceptButton || (
      <CtaButton
        text={this.props.acceptButtonText}
        disabled={this.state.disableAcceptButton}
        onClick={this._handleAcceptClick}
      />
    );
    const preface = cloneElement(this.props.preface, {
      onOpenDetail: this._toggleOverlay,
    });
    return (
      <Modal
        header={header}
        preface={preface}
        acceptButton={acceptButton}
        overlayContents={this.props.overlayContents}
        overlayOpen={this.state.overlayOpen}
        onClose={this.props.onClose}
        onOverlayBack={this._toggleOverlay}
      />
    );
  }

  private _toggleOverlay = () => {
    this.setState({ overlayOpen: !this.state.overlayOpen });
  }

  private _handleAcceptClick = () => {
    this.setState({ disableAcceptButton: true });
    this.props.onAccept();
  }
}
