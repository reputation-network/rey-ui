import { Component, h } from "preact";

export interface Props<S> {
  text: JSX.Element;
  struct: S;
}

export default class StructLabel<S> extends Component<Props<S>> {
  public state = {
    isExpandend: false,
  };

  public render = () => {
    return (
      <div className="struct-label">
        <div>
          {this.props.text}
          <a onClick={this._toggleExapanded}>
            {this.state.isExpandend ? "[-]" : "[+]"}
          </a>
        </div>
        <pre hidden={!this.state.isExpandend}>
          {this._json(this.props.struct)}
        </pre>
      </div>
    );
  }

  private _toggleExapanded = () => {
    this.setState({ isExpandend: !this.state.isExpandend });
  }

  private _json = (data: any, omitSignature: boolean = true): string => {
    const space = 2;
    const replacer = (key: string, value: any) =>
      key === "signature" ? undefined : value;
    return JSON.stringify(data, omitSignature ? replacer : null, space);
  }
}
