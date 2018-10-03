import { AppManifest } from "rey-sdk/dist/app/types";
const manifestCache = new Map<string, AppManifest>();
export default manifestCache;

// Testing values
manifestCache.set(`0x${"a".repeat(40)}`, {
  address: `0x${"a".repeat(40)}`,
  name: "Company A",
  app_dependencies: [],
} as any);
manifestCache.set(`0x${"b".repeat(40)}`, {
  address: `0x${"b".repeat(40)}`,
  name: "Company B",
  app_dependencies: [`0x${"c".repeat(40)}`],
} as any);
manifestCache.set(`0x${"c".repeat(40)}`, {
  address: `0x${"c".repeat(40)}`,
  name: "Company C",
  app_dependencies: [`0x${"d".repeat(40)}`],
} as any);
manifestCache.set(`0x${"d".repeat(40)}`, {
  address: `0x${"d".repeat(40)}`,
  name: "Company D",
  app_dependencies: [`0x${"e".repeat(40)}`],
} as any);
manifestCache.set(`0x${"e".repeat(40)}`, {
  address: `0x${"e".repeat(40)}`,
  name: "Company E",
  app_dependencies: [`0x${"f".repeat(40)}`],
} as any);
manifestCache.set(`0x${"f".repeat(40)}`, {
  address: `0x${"f".repeat(40)}`,
  name: "Company F",
  app_dependencies: [],
} as any);
manifestCache.set("0xe414023d26b472e862f327aad1bf2bf047d90ce8", {
  // tslint:disable-next-line
  "version": "1.0", "name": "AgeGroup", "description": "Returns the age group of the subject", "homepage_url": "https://rey-example-agegroup.herokuapp.com", "picture_url": "https://rey-example-agegroup.herokuapp.com/icon.png", "address": "0xe414023d26b472e862f327aad1bf2bf047d90ce8", "app_url": "https://rey-example-agegroup.herokuapp.com/data", "app_reward": 0, "app_dependencies": ["0x8b756515ff1929ee4388e118e53cdf1eeff5904f"]
} as any);
manifestCache.set("0x8d8b3c89fc3ff7739c4aa6ee0a6e629e2472433f", {
  // tslint:disable-next-line
  "version": "1.0", "name": "Magicnumber", "description": "Returns a magic number based on your public key", "homepage_url": "http://rey-example-magicnumber.herokuapp.com", "picture_url": "https://rey-example-magicnumber.herokuapp.com/icon.png", "address": "0x8d8b3c89fc3ff7739c4aa6ee0a6e629e2472433f", "app_url": "https://rey-example-magicnumber.herokuapp.com/data", "app_reward": 0, "app_dependencies": [],
} as any);
