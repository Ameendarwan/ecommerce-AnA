import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResetPasswordForm } from "./ResetPasswordForm";

type ResetPasswordProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ResetPassword({
  searchParams,
}: ResetPasswordProps) {
  const params = await searchParams;
  const message = params.message ? String(params.message) : null;

  return (
    <div className="bg-background flex h-[calc(100svh-var(--app-header-height,6rem))] items-center justify-center overflow-hidden p-4">
      <Card className="flex max-h-full w-full max-w-md flex-col overflow-hidden">
        <CardHeader className="shrink-0">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <ResetPasswordForm message={message} />
      </Card>
    </div>
  );
}
