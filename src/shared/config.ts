import {
  DEVELOPMENT_REGISTRY_CONTRACT_ADDRESS,
  DEVELOPMENT_REY_CONTRACT_ADDRESS,
  RINKEBY_REGISTRY_CONTRACT_ADDRESS,
  RINKEBY_REY_CONTRACT_ADDRESS,
} from "rey-sdk/dist/contracts/constants";
import EthereumNetwork from "../lib/ethereum-networks";

export type Environment = "prod" | "test" | "dev" | "custom";
export interface Config {
  environment: Environment;
  chainId: string;
  registryContractAddress: string;
  reyContractAddress: string;
}

export default function createConfig(environmentOrConfig: Environment | Partial<Config>): Config {
  const config = typeof environmentOrConfig === "string"
    ? { environment: environmentOrConfig }
    : environmentOrConfig;
  const environment = config.environment;

  const configByEnvironment: Record<Environment, () => Config> = {
    custom() {
      return {
        environment: "custom",
        chainId: requireProperty(config, "chainId"),
        registryContractAddress: requireProperty(config, "registryContractAddress"),
        reyContractAddress: requireProperty(config, "reyContractAddress"),
      };
    },

    dev() {
      return {
        environment: "dev",
        chainId: (config.chainId || EthereumNetwork.REY).toString(),
        registryContractAddress: config.registryContractAddress || DEVELOPMENT_REGISTRY_CONTRACT_ADDRESS,
        reyContractAddress: config.reyContractAddress || DEVELOPMENT_REY_CONTRACT_ADDRESS,
      };
    },

    test() {
      return {
        environment: "test",
        chainId: (config.chainId || EthereumNetwork.RINKEBY).toString(),
        registryContractAddress: config.registryContractAddress || RINKEBY_REGISTRY_CONTRACT_ADDRESS,
        reyContractAddress: config.reyContractAddress || RINKEBY_REY_CONTRACT_ADDRESS,
      };
    },

    prod() {
      // FIXME: Change once production contract is available
      return this.test();
    },
  };
  if (typeof configByEnvironment[environment] !== "function") {
    throw new TypeError(`Unkown envirnoment provided: ${environment}`);
  }
  return configByEnvironment[environment]();
}

function requireProperty(obj: any, property: string) {
  if (!Object.prototype.hasOwnProperty.call(obj, property)) {
    throw new Error(`missing config property: ${property}`);
  } else {
    return obj[property];
  }
}
