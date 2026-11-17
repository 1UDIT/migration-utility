import { useState } from "react";
import { mergeActivityData, type MigrationSummaryResponse } from "./mergeActivityData";
import type { ActivityChartPoint } from "./MigrationActivityChart";

// const [chartData, setChartData] = useState<ActivityChartPoint[]>([]);
// const [chartLoading, setChartLoading] = useState(false);

export const fetchChartData = async (
  mediaType: string,
  dateFrom: string,
  dateTo: string
) => {
  // setChartLoading(true);

  try {
    const [migrationResponse, decodedResponse] = await Promise.all([
      fetch("/migrationSummary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "MIGRATION_COMPLETED",
          mediaType,
          from: dateFrom,
          to: dateTo,
        }),
      }),
      fetch("/migrationSummary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DECODE_COMPLETED",
          mediaType,
          from: dateFrom,
          to: dateTo,
        }),
      }),
    ]);

    if (!migrationResponse.ok || !decodedResponse.ok) {
      throw new Error("Failed to fetch activity chart data");
    }

    const migration: MigrationSummaryResponse =
      await migrationResponse.json();

    const decoded: MigrationSummaryResponse =
      await decodedResponse.json();

    mergeActivityData(migration, decoded);
  } catch (error) {
    console.error("Chart API error:", error);
    // setChartData([]);
  } finally {
    // setChartLoading(false);
  }
};
