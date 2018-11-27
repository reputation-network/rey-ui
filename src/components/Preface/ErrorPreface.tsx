import { h } from "preact";

interface Props {
  text: JSX.Element|string;
}

export default function ErrorPreface(props: Props) {
  return (
    <div>{props.text}</div>
  );
}
