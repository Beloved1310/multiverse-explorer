import type { CodegenConfig } from "@graphql-codegen/cli";

const GRAPHQL_API_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_API_URL ??
  "https://rickandmortyapi.com/graphql";

const config: CodegenConfig = {
  schema: GRAPHQL_API_URL,
  documents: ["src/**/*.graphql"],
  ignoreNoDocuments: true,
  generates: {
    "src/gql/generated.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
        avoidOptionals: true,
      },
    },
  },
};

export default config;
