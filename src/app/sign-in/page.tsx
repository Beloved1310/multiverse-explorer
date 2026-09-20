import { AuthForm } from "@/features/auth/components/auth-form";

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const { next } = await searchParams;
  return (
    <AuthForm
      mode="sign-in"
      nextPath={typeof next === "string" ? next : undefined}
    />
  );
}
