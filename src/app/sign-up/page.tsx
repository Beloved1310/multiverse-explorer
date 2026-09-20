import { AuthForm } from "@/features/auth/components/auth-form";

export default async function SignUpPage({
  searchParams,
}: PageProps<"/sign-up">) {
  const { next } = await searchParams;
  return (
    <AuthForm
      mode="sign-up"
      nextPath={typeof next === "string" ? next : undefined}
    />
  );
}
