import { Component, h } from "preact";
import { WritePermission } from "../../lib/rey-sdk";
import AppName from "../AppName";
import StructLabel from "./StructLabel";

interface Props {
  writerAddress: string;
  writerName: string;
  writePermission: WritePermission;
}

export default class WritePermissionStructLabel extends Component<Props> {
  public render = () => {
    return (
      <StructLabel
        text={this._renderText()}
        struct={this.props.writePermission}
      />
    );
  }

  private _renderText = () => {
    const writer = (
      <AppName
        address={this.props.writerAddress}
        name={this.props.writerName}
      />
    );
    return (
      <span id="label">
        <b>Your permission</b> for {writer} to share your information
      </span>
    );
  }
}
