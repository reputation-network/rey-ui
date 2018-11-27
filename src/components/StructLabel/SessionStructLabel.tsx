import { Component, h } from "preact";
import { Session } from "../../lib/rey-sdk";
import StructLabel from "./StructLabel";

interface Props {
  session: Session;
}

export default class SessionStructLabel extends Component<Props> {
  public render = () => {
    return (
      <StructLabel
        text={this._renderText()}
        struct={this.props.session}
      />
    );
  }

  private _renderText = () => {
    return (
      <span>
        <b>The identifier</b> to prove this data sharing happening
      </span>
    );
  }
}
