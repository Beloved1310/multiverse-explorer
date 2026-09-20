import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { createDepthLimitRule } from "@/server/graphql/depth-limit";
import { resolvers } from "@/server/graphql/schema";
import { typeDefs } from "@/server/graphql/type-defs";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [createDepthLimitRule(8)],
});

const handler = startServerAndCreateNextHandler(server);

export async function GET(request: Request): Promise<Response> {
  return handler(request);
}

export async function POST(request: Request): Promise<Response> {
  return handler(request);
}
