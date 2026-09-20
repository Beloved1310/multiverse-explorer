import "server-only";

export interface GraphQLContext {
  userId: string | null;
}

export async function createGraphQLContext(
  request: Request,
): Promise<GraphQLContext> {
  // Public catalogue queries do not need a database session lookup. This keeps
  // the anonymous explorer and its snapshot fallback available even when an
  // account database has not been configured yet.
  if (!request.headers.get("cookie")?.includes("better-auth.session_token")) {
    return { userId: null };
  }
  const { auth } = await import("@/server/auth");
  const session = await auth.api.getSession({ headers: request.headers });
  return { userId: session?.user.id ?? null };
}
