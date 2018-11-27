import { Component, h } from "preact";
import { ReadPermission } from "../../lib/rey-sdk";
import AppName from "../AppName";
import StructLabel from "./StructLabel";

interface Props {
  sourceAddress: string;
  sourceName: string;
  readerAddress: string;
  readerName: string;
  readPermission: ReadPermission;
}

export default class ReadPermissionStructLabel extends Component<Props> {
  public render = () => {
    return (
      <StructLabel
        text={this._renderText()}
        struct={this.props.readPermission}
      />
    );
  }

  private _renderText = () => {
    const source = (
      <AppName
        address={this.props.sourceAddress}
        name={this.props.sourceName}
        />
    );
    const reader = (
      <AppName
        address={this.props.readerAddress}
        name={this.props.readerName}
      />
    );
    return (
      <span>
        <b>Your permission</b> for {reader} to read {source}
      </span>
    );
  }
}
