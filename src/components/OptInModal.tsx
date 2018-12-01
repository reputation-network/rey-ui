import { Component, h } from "preact";
import { AppRenderDataRecord } from "../lib/rey-sdk-helpers";
import { SignModal } from "./Modal";
import { OptInPreface } from "./Preface";
import { WritePermissionStructLabel } from "./StructLabel";

export interface Props {
  writePermission: any;
  appRenderData: AppRenderDataRecord;
  signButtonText: string;
  onSignClick?: () => void;
  onCloseClick?: () => void;
}

export class OptInModal extends Component<Props> {
  public render = () => {
    const writerAddress = this.props.writePermission.writer;
    const writerData = this.props.appRenderData[writerAddress];
    if (!writerData) {
      throw new Error("Missing writer app render data");
    }
    const preface = (
      <OptInPreface
        writerAddress={writerData.address}
        writerName={writerData.name}
      />
    );
    const label = (
      <WritePermissionStructLabel
        writePermission={this.props.writePermission}
        writerAddress={writerData.address}
        writerName={writerData.name}
      />
    );
    return (
      <SignModal
        appAddress={writerData.address}
        appName={writerData.name}
        appDescription={writerData.description}
        appIconUrl={writerData.iconUrl}
        preface={preface}
        acceptButtonText={this.props.signButtonText}
        overlayContents={[label]}
        onAccept={this.props.onSignClick}
        onClose={this.props.onCloseClick}
      />
    );
  }
}
