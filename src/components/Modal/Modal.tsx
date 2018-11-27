import { h } from "preact";

interface Props {
  className?: string;
  header: JSX.Element;
  preface: JSX.Element;
  overlayContents: JSX.Element[];
  acceptButton?: JSX.Element;
  overlayOpen: boolean;
  onClose: () => void;
  onOverlayBack: () => void;
}

export default function StatelessModal(props: Props) {
  const overlayStateClassName = !props.overlayOpen ? "hidden" : "";
  return (
    <div class={`modal ${props.className || ""}`}>
      <div class="header">
        {props.header}
        <a class="close" title="Close" onClick={props.onClose}>&times;</a>
      </div>
      <div class="body">
        <div class="preface">{props.preface}</div>
        <div class="footer">{props.acceptButton}</div>
      </div>
      <div className={`overlay ${overlayStateClassName}`}>
        <div className="back-container">
          <a className="back" title="back" onClick={props.onOverlayBack}>
            <span className="ang">&lang;</span> Back
          </a>
        </div>
        <div className="overlay-content">
          {props.overlayContents}
        </div>
      </div>
    </div>
  );
}
