"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { AnalyticsDataPoint } from "@/lib/analytics/googleAnalyticsService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface PageViewsChartProps {
  data: AnalyticsDataPoint[];
}

export function PageViewsChart({ data }: PageViewsChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-muted/10 flex h-64 items-center justify-center rounded-lg border">
        <p className="text-muted-foreground text-sm">
          No page view data for this period yet
        </p>
      </div>
    );
  }

  const chartData = {
    labels: data.map((point) => point.label),
    datasets: [
      {
        label: "Page Views",
        data: data.map((point) => point.pageViews),
        backgroundColor: "rgba(139, 92, 246, 0.5)",
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Bar options={options} data={chartData} />
    </div>
  );
}
