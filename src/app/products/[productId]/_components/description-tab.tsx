

import { Card, CardContent } from "@/components/ui/card";
import { useProduct } from '@/hooks/queries'

type DescriptionTabProps = {
    productId: string;
};
export function DescriptionTab({ productId }: DescriptionTabProps) {

    const { data: product } = useProduct(productId);

    if (!product) {
        return <div>Loading...</div>;
    }

    
    return (
        <Card>
        <CardContent className="p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {/<[a-z][\s\S]*>/i.test(product.description || "") ? (
              <div
                className="text-muted-foreground mb-4 leading-relaxed [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_hr]:my-3"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-muted-foreground mb-4 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}
            {product.sku && (
              <div className="border-border mt-4 border-t pt-4">
                <p className="text-muted-foreground text-sm">
                  <strong>SKU:</strong> {product.sku}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
}