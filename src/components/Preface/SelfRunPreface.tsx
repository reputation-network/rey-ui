import { h } from "preact";
import AppName from "../AppName";

interface Props {
  sourceAddress: string;
  sourceName: string;
  messageCount: number;
  cost: string;
  onOpenDetail?: () => void;
}

export default function SelfRunPreface(props: Props) {
  const cost = Number(props.cost) || 0;
  const messageCount = Number(props.messageCount) || 1;
  const messageCountPrefix = messageCount > 1 ? "messages" : "message";
  const source = <AppName address={props.sourceAddress} name={props.sourceName} />;
  return (
    <div className="preface">
      <div id="icon" class="company"></div>
      <div id="icon" class="company"></div>
      <h2>Do you want to run {source}?</h2>
      <p>This will have a cost of {cost} wei.</p>
      <p>
        In order to read your data with {source}, you need to sign
        <a onClick={props.onOpenDetail}> {messageCount} {messageCountPrefix}</a>
      </p>
    </div>
  );
}
