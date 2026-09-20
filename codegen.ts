import type { CodegenConfig } from "@graphql-codegen/cli";
import { typeDefs } from "./src/server/graphql/type-defs";

// The browser queries /api/graphql. Codegen consumes the same route's SDL
// directly so it can run without a local server already listening.
const BFF_SCHEMA = typeDefs;

const config: CodegenConfig = {
  schema: BFF_SCHEMA,
  documents: ["src/**/*.{ts,tsx}", "!src/lib/graphql/generated/**"],
  generates: {
    "src/lib/graphql/generated/": {
      preset: "client",
    },
  },
};

export default config;
