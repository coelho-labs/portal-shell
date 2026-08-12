import { createModuleFederationConfig } from "@module-federation/vite";
import pkg from "./package.json" with { type: "json" };

const { dependencies } = pkg;

export default function mfConfig(env: Record<string, string>) {
  return createModuleFederationConfig({
    name: "portal-shell",
    remotes: {
      "planning-poker": {
        type: "module",
        name: "planning-poker",
        entry: env.VITE_PLANNING_POKER_ENTRY ?? "http://localhost:4175/mf-manifest.json",
      },
    },
    shared: {
      "react": { singleton: true, requiredVersion: dependencies["react"] },
      "react-dom": { singleton: true, requiredVersion: dependencies["react-dom"] },
      "react-router-dom": { singleton: true, requiredVersion: dependencies["react-router-dom"] },
    },
    dts: {
      consumeTypes: {
        typesFolder: "@mf-types",
        typesOnBuild: true,
      },
    },
  });
}