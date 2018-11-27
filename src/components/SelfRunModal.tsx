import { Component, h } from "preact";
import { AppParams } from "../lib/rey-sdk";
import { AppRenderDataRecord } from "../lib/rey-sdk-helpers";
import { SignModal } from "./Modal";
import { SelfRunPreface } from "./Preface";
import {
  EncryptionKeyStructLabel,
  ReadPermissionStructLabel,
  RequestStructLabel,
  SessionStructLabel,
} from "./StructLabel";

export interface Props {
  appRenderData: AppRenderDataRecord;
  appParams: AppParams;
  fetchData: () => Promise<any>;
  onCloseClick?: () => void;
}

export class SelfRunModal extends Component<Props> {
  public state = {
    isFetching: false,
    error: null,
    data: null,
  };

  public render = () => {
    const { source, reader } = this.props.appParams.request.readPermission;
    const labels = [
      <SessionStructLabel
        session={this.props.appParams.request.session}
      />,
      <ReadPermissionStructLabel
        readPermission={this.props.appParams.request.readPermission}
        sourceAddress={this._renderData(source).address}
        sourceName={this._renderData(source).name}
        readerAddress={this._renderData(reader).address}
        readerName={this._renderData(reader).name}
      />,
      ...this.props.appParams.extraReadPermissions.map((rp) => {
        return (
          <ReadPermissionStructLabel
            readPermission={this.props.appParams.request.readPermission}
            sourceAddress={this._renderData(rp.source).address}
            sourceName={this._renderData(rp.source).name}
            readerAddress={this._renderData(rp.reader).address}
            readerName={this._renderData(rp.reader).name}
          />
        );
      }),
      <RequestStructLabel
        request={this.props.appParams.request}
      />,
      <EncryptionKeyStructLabel
        encryptionKey={this.props.appParams.encryptionKey}
      />,
    ];
    return (
      <SignModal
        appAddress={this._renderData(source).address}
        appName={this._renderData(source).name}
        appDescription={this._renderData(source).description}
        appIconUrl={this._renderData(source).iconUrl}
        preface={this._renderPreface()}
        acceptButton={this._renderButton()}
        acceptButtonText="Sign and run"
        overlayContents={labels}
        onAccept={this._handleSignClick}
        onClose={this.props.onCloseClick}
      />
    );
  }

  private _renderData = (address: string) => {
    const appRenderData = this.props.appRenderData[address];
    if (!appRenderData) {
      // FIXME: throw new Error(`Missing app render data ${address}`);
      return {} as any;
    }
    return appRenderData;
  }

  private _handleSignClick = async () => {
    try {
      this.setState({ isFetching: true });
      const data = await this.props.fetchData();
      this.setState({ data });
    } catch (error) {
      this.setState({ error });
    } finally {
      this.setState({ isFetching: false });
    }
  }

  private _renderPreface = () => {
    const { source } = this.props.appParams.request.readPermission;
    const messageCount = (this.props.appParams.extraReadPermissions || []).length + 2;
    if (this.state.isFetching) {
      return <div>Loading...</div>;
    } else if (this.state.error) {
      return <pre>Error: {JSON.stringify(this.state.error)}</pre>;
    } else if (this.state.data) {
      return <pre>{JSON.stringify(this.state.data)}</pre>;
    } else {
      return (
        <SelfRunPreface
          sourceName={this._renderData(source).name}
          sourceAddress={this._renderData(source).address}
          cost={this.props.appParams.request.value}
          messageCount={messageCount}
        />
      );
    }
  }

  private _renderButton = () => {
    return this.state.isFetching || this.state.data || this.state.error
      ? <div></div>
      : null;
  }
}
