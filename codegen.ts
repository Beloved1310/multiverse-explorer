import type { CodegenConfig } from "@graphql-codegen/cli";

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ??
  "https://rickandmortyapi.com/graphql";

const config: CodegenConfig = {
  schema: GRAPHQL_ENDPOINT,
  documents: ["src/**/*.{ts,tsx}", "!src/lib/graphql/generated/**"],
  generates: {
    "src/lib/graphql/generated/": {
      preset: "client",
    },
  },
};

export default config;
