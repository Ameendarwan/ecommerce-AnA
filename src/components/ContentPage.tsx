import type { ReactNode } from "react";

interface ContentPageProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ContentPage({ title, description, children }: ContentPageProps) {
  return (
    <div className="bg-background min-h-[60vh]">
      <div className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
        <header className="mb-8 space-y-2">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="text-muted-foreground text-base">{description}</p>
          ) : null}
        </header>
        <div className="text-muted-foreground prose prose-neutral dark:prose-invert max-w-none space-y-4 text-sm leading-relaxed sm:text-base [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}
