import { h } from "preact";

export interface Props {
  name: string;
  address: string;
}

export default function ReyAppName(props: Props) {
  return (
    <span className="app-name">{props.name}</span>
  );
}
