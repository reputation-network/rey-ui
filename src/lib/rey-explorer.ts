export function urlForAddress(address: string) {
  address = address.toLocaleLowerCase();
  return `https://explorer.reputation.network/address/${address}`;
}
