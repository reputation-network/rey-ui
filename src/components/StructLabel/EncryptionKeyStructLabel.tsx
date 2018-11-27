import { Component, h } from "preact";
import { EncryptionKey } from "../../lib/rey-sdk";
import StructLabel from "./StructLabel";

interface Props {
  encryptionKey: EncryptionKey;
}

export default class EncryptionStructLabel extends Component<Props> {
  public render = () => {
    return (
      <StructLabel
        text={this._renderText()}
        struct={this.props.encryptionKey}
      />
    );
  }

  private _renderText = () => {
    return (
    <span>
      <b>A private key</b> for cyphering this data exchange end to end.
    </span>
    );
  }
}
