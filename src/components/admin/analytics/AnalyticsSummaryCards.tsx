import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopPage } from "@/lib/analytics/googleAnalyticsService";

interface TopPagesTableProps {
  pages: TopPage[];
}

export function TopPagesTable({ pages }: TopPagesTableProps) {
  if (pages.length === 0) {
    return (
      <div className="bg-muted/10 flex h-48 items-center justify-center rounded-lg border">
        <p className="text-muted-foreground text-sm">No page data yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="text-muted-foreground pb-3 font-medium">Page</th>
            <th className="text-muted-foreground pb-3 text-right font-medium">
              Views
            </th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.path} className="border-b last:border-0">
              <td className="py-3 pr-4 font-mono text-xs break-all">
                {page.path}
              </td>
              <td className="py-3 text-right font-medium">
                {page.views.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface AnalyticsSummaryCardsProps {
  summary: {
    users: number;
    newUsers: number;
    sessions: number;
    pageViews: number;
  };
}

export function AnalyticsSummaryCards({ summary }: AnalyticsSummaryCardsProps) {
  const cards = [
    { label: "Users", value: summary.users },
    { label: "New Users", value: summary.newUsers },
    { label: "Sessions", value: summary.sessions },
    { label: "Page Views", value: summary.pageViews },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {card.value.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
