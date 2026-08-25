import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function CheckoutSuccessLoading() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-3 py-12">
      <LoadingSpinner />
      <p className="text-muted-foreground text-sm">Loading your order…</p>
    </div>
  );
}
