"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { AnalyticsDataPoint } from "@/lib/analytics/googleAnalyticsService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface TrafficChartProps {
  data: AnalyticsDataPoint[];
}

export function TrafficChart({ data }: TrafficChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-muted/10 flex h-72 items-center justify-center rounded-lg border">
        <p className="text-muted-foreground text-sm">
          No traffic data for this period yet
        </p>
      </div>
    );
  }

  const chartData = {
    labels: data.map((point) => point.label),
    datasets: [
      {
        label: "Users",
        data: data.map((point) => point.users),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "New Users",
        data: data.map((point) => point.newUsers),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.08)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Sessions",
        data: data.map((point) => point.sessions),
        borderColor: "rgb(249, 115, 22)",
        backgroundColor: "rgba(249, 115, 22, 0.08)",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
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
    <div className="h-72 w-full">
      <Line options={options} data={chartData} />
    </div>
  );
}
