import { h } from "preact";
import AppName from "../AppName";

interface Props {
  writerAddress: string;
  writerName: string;
  onOpenDetail?: () => void;
}

export default function OptInPreface(props: Props) {
  const messageCount = 1;
  const writer = <AppName address={props.writerAddress} name={props.writerName} />;
  return (
    <div>
      <div id="icon" class="company"></div>
      <h2>Do you allow {writer} to offer your data in the Reputation Newtork?</h2>
      <p>
        No one will have access to your data until you give them read access explicitly.
      </p>
      <br />
      <p>
        In order to share your data with {writer}, you need to sign
        <a onClick={props.onOpenDetail}> {messageCount} message</a>
      </p>
    </div>
  );
}
