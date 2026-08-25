import { BrandLoader } from "@/components/BrandLoader";

export function LoadingSpinner() {
  return (
    <div className="container mx-auto h-full py-8">
      <div className="flex h-full items-center justify-center">
        <BrandLoader size="md" className="w-full" />
      </div>
    </div>
  );
}
