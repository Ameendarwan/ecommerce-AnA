import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UpdatePasswordForm } from "./UpdatePasswordForm";

type UpdatePasswordProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function UpdatePassword({
  searchParams,
}: UpdatePasswordProps) {
  const params = await searchParams;
  const message = params.message ? String(params.message) : null;

  return (
    <div className="bg-background flex h-[calc(100svh-var(--app-header-height,6rem))] items-center justify-center overflow-hidden p-4">
      <Card className="flex max-h-full w-full max-w-md flex-col overflow-hidden">
        <CardHeader className="shrink-0">
          <CardTitle className="text-2xl">Update Password</CardTitle>
          <CardDescription>
            Create a new password for your account
          </CardDescription>
        </CardHeader>
        <UpdatePasswordForm message={message} />
      </Card>
    </div>
  );
}
