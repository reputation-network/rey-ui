import { Component, h } from "preact";
import { Request } from "../../lib/rey-sdk";
import StructLabel from "./StructLabel";

interface Props {
  request: Request;
}

export default class RequestStructLabel extends Component<Props> {
  public render = () => {
    return (
      <StructLabel
        text={this._renderText()}
        struct={this.props.request}
      />
    );
  }

  private _renderText = () => {
    return (
      <span>
        Your will <b>about reading your own data</b>
      </span>
    );
  }
}
