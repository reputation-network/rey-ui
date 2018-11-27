import { h } from "preact";

export interface Props {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function CtaButton(props: Props) {
  return (
    <div disabled={props.disabled} class="cta-button">
      <button onClick={props.onClick}>{props.text}</button>
    </div>
  );
}
