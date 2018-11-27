import { h } from "preact";
import ReyAppName from "./AppName";

export interface Props {
  address: string;
  name: string;
  iconUrl: string;
  description: string;
}

export default function AppHeader(props: Props) {
  return (
    <div className="app-header">
      <img src={props.iconUrl}/>
      <div>
        <h2><ReyAppName name={props.name} address={props.address}/></h2>
        <p id="description">{props.description}</p>
        <p><a>View app details</a></p>
      </div>
    </div>
  );
}
