import { NextRequest, NextResponse } from "next/server";
import {
  getAnalyticsReport,
  isGoogleAnalyticsApiConfigured,
  type AnalyticsRange,
} from "@/lib/analytics/googleAnalyticsService";
import { requireAdmin } from "@/lib/supabase/requireAdmin";

const VALID_RANGES: AnalyticsRange[] = [
  "weekly",
  "monthly",
  "6months",
  "yearly",
];

function isValidRange(value: string | null): value is AnalyticsRange {
  return VALID_RANGES.includes(value as AnalyticsRange);
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: auth.status },
    );
  }

  if (!isGoogleAnalyticsApiConfigured()) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "Google Analytics API credentials are missing. Add GA_PROPERTY_ID, GA_CLIENT_EMAIL, and GA_PRIVATE_KEY to your environment.",
      },
      { status: 503 },
    );
  }

  const rangeParam = request.nextUrl.searchParams.get("range");
  const range = isValidRange(rangeParam) ? rangeParam : "monthly";

  try {
    const report = await getAnalyticsReport(range);
    return NextResponse.json(report);
  } catch (error) {
    console.error("Failed to fetch Google Analytics report:", error);
    return NextResponse.json(
      {
        error: "fetch_failed",
        message: "Failed to fetch analytics data from Google Analytics.",
      },
      { status: 500 },
    );
  }
}
