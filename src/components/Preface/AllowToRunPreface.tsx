import { h } from "preact";
import AppName from "../AppName";

interface Props {
  sourceAddress: string;
  sourceName: string;
  readerAddress: string;
  readerName: string;
  messageCount: number;
  onOpenDetail?: () => void;
}

export default function AllowToRunPreface(props: Props) {
  const messageCount = Number(props.messageCount) || 1;
  const messageCountPrefix = messageCount > 1 ? "messages" : "message";
  const source = <AppName address={props.sourceAddress} name={props.sourceName} />;
  const reader = <AppName address={props.readerAddress} name={props.readerName} />;
  return (
    <div>
      <div id="icon" class="company"></div>
      <h2>Do you give {reader} your permission to run {source}?</h2>
      <p>
        In order to share your data with {reader}, you need to sign
        <a onClick={props.onOpenDetail}> {messageCount} {messageCountPrefix}</a>
      </p>
    </div>
  );
}
