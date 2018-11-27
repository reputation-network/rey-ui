import { Component, h } from "preact";
import { ReadPermission, Session } from "../lib/rey-sdk";
import { AppRenderDataRecord } from "../lib/rey-sdk-helpers";
import { SignModal } from "./Modal";
import { AllowToRunPreface } from "./Preface";
import { ReadPermissionStructLabel, SessionStructLabel } from "./StructLabel";

export interface Props {
  appRenderData: AppRenderDataRecord;
  session: Session;
  readPermission: ReadPermission;
  extraReadPermissions?: ReadPermission[];
  onSignClick?: () => void;
  onCloseClick?: () => void;
}

export class AllowToRunModal extends Component<Props> {
  public render = () => {
    const { source, reader } = this.props.readPermission;
    const labels = [
      <SessionStructLabel session={this.props.session} />,
      <ReadPermissionStructLabel
        readPermission={this.props.readPermission}
        sourceAddress={this._renderData(source).address}
        sourceName={this._renderData(source).name}
        readerAddress={this._renderData(reader).address}
        readerName={this._renderData(reader).name}
      />,
      ...this.props.extraReadPermissions.map((rp) => {
        return (
          <ReadPermissionStructLabel
            readPermission={this.props.readPermission}
            sourceAddress={this._renderData(rp.source).address}
            sourceName={this._renderData(rp.source).name}
            readerAddress={this._renderData(rp.reader).address}
            readerName={this._renderData(rp.reader).name}
          />
        );
      }),
    ];
    const preface = (
      <AllowToRunPreface
        readerName={this._renderData(reader).name}
        readerAddress={this._renderData(reader).address}
        sourceName={this._renderData(source).name}
        sourceAddress={this._renderData(source).address}
        messageCount={labels.length}
      />
    );
    return (
      <SignModal
        appAddress={this._renderData(source).address}
        appName={this._renderData(source).name}
        appDescription={this._renderData(source).description}
        appIconUrl={this._renderData(source).iconUrl}
        preface={preface}
        acceptButtonText="Sign with Metamask"
        overlayContents={labels}
        onAccept={this.props.onSignClick}
        onClose={this.props.onCloseClick}
      />
    );
  }

  private _renderData = (address: string) => {
    const appRenderData = this.props.appRenderData[address];
    if (!appRenderData) {
      throw new Error(`Missing app render data ${address}`);
    }
    return appRenderData;
  }
}
