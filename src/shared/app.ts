import AppClient from "rey-sdk/dist/app";
import { TestnetContract } from "rey-sdk/dist/contracts";
import manifestCache from "./manifest-cache";
import { ethereumProvider } from "./metamask";

export default async function App(address: string) {
  const web3Provider = await ethereumProvider();
  const contract = TestnetContract(web3Provider);
  return new AppClient(address, { contract, manifestCache });
}
