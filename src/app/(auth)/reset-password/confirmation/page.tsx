import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResetPasswordConfirmation() {
  return (
    <div className="bg-background flex h-[calc(100svh-var(--app-header-height,6rem))] items-center justify-center overflow-hidden p-4">
      <Card className="flex max-h-full w-full max-w-md flex-col gap-4 overflow-hidden">
        <CardHeader className="shrink-0">
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          <div className="rounded-md bg-green-100 p-4 text-sm text-green-800">
            <p>
              If an account exists with the email you entered, we&apos;ve sent a
              link to reset your password. Please check your email and follow
              the instructions.
            </p>
            <p className="mt-2">
              The link will expire in 1 hour for security reasons.
            </p>
          </div>
        </CardContent>
        <CardFooter className="mt-auto flex shrink-0 flex-col">
          <Link href="/signin" className="w-full">
            <Button className="hover:bg-primary/90 w-full cursor-pointer">
              Back to Sign In
            </Button>
          </Link>
          <div className="mt-4 text-center text-sm">
            Didn&apos;t receive the email?{" "}
            <Link
              href="/reset-password"
              className="text-primary hover:text-primary/90 cursor-pointer underline"
            >
              Try again
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
