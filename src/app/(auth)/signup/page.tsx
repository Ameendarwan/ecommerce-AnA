import SignUpForm from "./SignUpForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function SignUp() {
  return (
    <div className="bg-background flex h-[calc(100svh-var(--app-header-height,6rem))] items-center justify-center overflow-hidden p-4">
      <Card className="flex max-h-full w-full max-w-md flex-col overflow-hidden">
        <CardHeader className="shrink-0">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <SignUpForm />
      </Card>
    </div>
  );
}
