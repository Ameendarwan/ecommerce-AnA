"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  AnalyticsSummaryCards,
  TopPagesTable,
} from "@/components/admin/analytics/AnalyticsSummaryCards";
import { TrafficChart } from "@/components/admin/analytics/TrafficChart";
import { PageViewsChart } from "@/components/admin/analytics/PageViewsChart";
import type {
  AnalyticsRange,
  AnalyticsReport,
} from "@/lib/analytics/googleAnalyticsService";
import { cn } from "@/lib/utils";

const RANGE_OPTIONS: { value: AnalyticsRange; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "6months", label: "6 Months" },
  { value: "yearly", label: "Yearly" },
];

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>("monthly");
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);

  const fetchAnalytics = useCallback(async (selectedRange: AnalyticsRange) => {
    try {
      setLoading(true);
      setError(null);
      setSetupRequired(false);

      const response = await fetch(
        `/api/admin/analytics?range=${selectedRange}`,
      );
      const data = await response.json();

      if (response.status === 503 && data.error === "not_configured") {
        setSetupRequired(true);
        setReport(null);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to load analytics");
      }

      setReport(data as AnalyticsReport);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load analytics data",
      );
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAnalytics(range);
  }, [fetchAnalytics, range]);

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/admin"
            className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
              <BarChart3 className="h-8 w-8" />
              Analytics
            </h1>
            <p className="text-muted-foreground">
              Website traffic, users, and page performance
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-muted/50 flex rounded-lg p-1">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRange(option.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  range === option.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchAnalytics(range)}
            disabled={loading}
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {GA_MEASUREMENT_ID ? (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="pt-6">
            <p className="text-sm text-emerald-800">
              Tracking is active with measurement ID{" "}
              <span className="font-mono font-medium">{GA_MEASUREMENT_ID}</span>
              . Data may take 24–48 hours to appear in charts after your first
              visitors.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-800">
              Add{" "}
              <span className="font-mono">
                NEXT_PUBLIC_GA_MEASUREMENT_ID=G-X8J6YBC9LC
              </span>{" "}
              to your <span className="font-mono">.env.local</span> file to
              enable site tracking.
            </p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : setupRequired ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Google Analytics API</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            <p>
              Site tracking can work without this, but admin charts need API
              access. Add these to your environment:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="font-mono text-foreground">GA_PROPERTY_ID</span>{" "}
                — numeric property ID from GA4 settings
              </li>
              <li>
                <span className="font-mono text-foreground">GA_CLIENT_EMAIL</span>{" "}
                — service account email
              </li>
              <li>
                <span className="font-mono text-foreground">GA_PRIVATE_KEY</span>{" "}
                — service account private key
              </li>
            </ul>
            <p>
              Grant the service account <strong>Viewer</strong> access in GA4 →
              Admin → Property access management.
            </p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      ) : report ? (
        <>
          <AnalyticsSummaryCards summary={report.summary} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <TrafficChart data={report.timeSeries} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Page Views</CardTitle>
              </CardHeader>
              <CardContent>
                <PageViewsChart data={report.timeSeries} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <TopPagesTable pages={report.topPages} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
