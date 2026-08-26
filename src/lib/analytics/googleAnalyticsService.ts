import { BetaAnalyticsDataClient } from "@google-analytics/data";

export type AnalyticsRange = "weekly" | "monthly" | "6months" | "yearly";

export interface AnalyticsSummary {
  users: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
}

export interface AnalyticsDataPoint {
  label: string;
  users: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
}

export interface TopPage {
  path: string;
  views: number;
}

export interface AnalyticsReport {
  range: AnalyticsRange;
  summary: AnalyticsSummary;
  timeSeries: AnalyticsDataPoint[];
  topPages: TopPage[];
}

const RANGE_CONFIG: Record<
  AnalyticsRange,
  { startDate: string; endDate: string; dimension: "date" | "yearMonth" }
> = {
  weekly: { startDate: "7daysAgo", endDate: "today", dimension: "date" },
  monthly: { startDate: "30daysAgo", endDate: "today", dimension: "date" },
  "6months": {
    startDate: "180daysAgo",
    endDate: "today",
    dimension: "yearMonth",
  },
  yearly: { startDate: "365daysAgo", endDate: "today", dimension: "yearMonth" },
};

function getAnalyticsClient() {
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    return null;
  }

  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
}

export function isGoogleAnalyticsApiConfigured() {
  return Boolean(
    process.env.GA_PROPERTY_ID &&
      process.env.GA_CLIENT_EMAIL &&
      process.env.GA_PRIVATE_KEY,
  );
}

function formatDimensionLabel(
  dimension: "date" | "yearMonth",
  value: string,
): string {
  if (dimension === "date" && value.length === 8) {
    const year = value.slice(0, 4);
    const month = value.slice(4, 6);
    const day = value.slice(6, 8);
    return new Date(`${year}-${month}-${day}`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  if (dimension === "yearMonth" && value.length === 6) {
    const year = value.slice(0, 4);
    const month = value.slice(4, 6);
    return new Date(`${year}-${month}-01`).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }

  return value;
}

function parseMetricValue(value: string | null | undefined) {
  return Number(value ?? 0);
}

export async function getAnalyticsReport(
  range: AnalyticsRange,
): Promise<AnalyticsReport> {
  const propertyId = process.env.GA_PROPERTY_ID;
  const client = getAnalyticsClient();

  if (!propertyId || !client) {
    throw new Error("Google Analytics API is not configured");
  }

  const config = RANGE_CONFIG[range];

  const [timeSeriesResponse, summaryResponse, topPagesResponse] =
    await Promise.all([
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: config.startDate, endDate: config.endDate }],
        dimensions: [{ name: config.dimension }],
        metrics: [
          { name: "activeUsers" },
          { name: "newUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
        ],
        orderBys: [{ dimension: { dimensionName: config.dimension } }],
      }),
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: config.startDate, endDate: config.endDate }],
        metrics: [
          { name: "activeUsers" },
          { name: "newUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
        ],
      }),
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: config.startDate, endDate: config.endDate }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
    ]);

  const timeSeriesRows = timeSeriesResponse[0].rows ?? [];
  const timeSeries: AnalyticsDataPoint[] = timeSeriesRows.map((row) => {
    const dimensionValue = row.dimensionValues?.[0]?.value ?? "";
    const metrics = row.metricValues ?? [];

    return {
      label: formatDimensionLabel(config.dimension, dimensionValue),
      users: parseMetricValue(metrics[0]?.value),
      newUsers: parseMetricValue(metrics[1]?.value),
      sessions: parseMetricValue(metrics[2]?.value),
      pageViews: parseMetricValue(metrics[3]?.value),
    };
  });

  const summaryMetrics = summaryResponse[0].rows?.[0]?.metricValues ?? [];
  const summary: AnalyticsSummary = {
    users: parseMetricValue(summaryMetrics[0]?.value),
    newUsers: parseMetricValue(summaryMetrics[1]?.value),
    sessions: parseMetricValue(summaryMetrics[2]?.value),
    pageViews: parseMetricValue(summaryMetrics[3]?.value),
  };

  const topPages: TopPage[] = (topPagesResponse[0].rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "/",
    views: parseMetricValue(row.metricValues?.[0]?.value),
  }));

  return {
    range,
    summary,
    timeSeries,
    topPages,
  };
}
