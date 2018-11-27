import { Component, h } from "preact";
import { ErrorPreface } from "../Preface";
import Modal from "./Modal";

export interface Props {
  header?: JSX.Element;
  errorText: JSX.Element|string;
  onClose: () => void;
}

export default class ErrorModal extends Component<Props> {
  public render = () => {
    const preface = (<ErrorPreface text={this.props.errorText}/>);
    const header = this.props.header || (<div style="height: 50px"></div>);
    return (
      <Modal
        className="light-header"
        header={header}
        preface={preface}
        acceptButton={null}
        overlayContents={null}
        overlayOpen={false}
        onClose={this.props.onClose}
        onOverlayBack={() => null}
      />
    );
  }
}
