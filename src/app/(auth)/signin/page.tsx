import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInForm } from "./SignInForm";

type SignInProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SignIn({ searchParams }: SignInProps) {
  const params = await searchParams;
  const message = params.message ? String(params.message) : null;

  return (
    <div className="bg-background flex h-[calc(100svh-var(--app-header-height,6rem))] items-center justify-center overflow-hidden p-4">
      <Card className="flex max-h-full w-full max-w-md flex-col overflow-hidden">
        <CardHeader className="shrink-0">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <SignInForm message={message} />
      </Card>
    </div>
  );
}
