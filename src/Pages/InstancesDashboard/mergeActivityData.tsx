export interface MigrationSummaryRow {
  Hour: string | number;
  ObjectCount: number;
  TotalSizeGB: number;
  TotalSizeTB: number;
}

export interface MigrationSummaryResponse {
  status: string;
  mediaType: string;
  from: string;
  to: string;
  rows: MigrationSummaryRow[];
  totals: {
    objectCount: number;
    totalSizeGB: number;
    totalSizeTB: number;
  };
}

export interface ActivityChartPoint {
  time: string;
  migrationSizeTB: number;
  migrationCount: number;
  decodedSizeTB: number;
  decodedCount: number;
}



export function mergeActivityData(
  migration: MigrationSummaryResponse,
  decoded: MigrationSummaryResponse
): ActivityChartPoint[] {
  const hourlyData = new Map<string, ActivityChartPoint>();

  console.log("Merging activity data:", {
    migration,
    decoded,
  });

  const addRows = (
    rows: MigrationSummaryRow[],
    sizeKey: "migrationSizeTB" | "decodedSizeTB",
    countKey: "migrationCount" | "decodedCount"
  ) => {
    rows.forEach((row) => {
      const rawHour = String(row.Hour);
      const isNumericHour = /^\d{1,2}$/.test(rawHour);
      const hour = isNumericHour
        ? rawHour.padStart(2, "0")
        : rawHour;

      const existing = hourlyData.get(hour) ?? {
        time: isNumericHour ? `${hour}:00` : hour,
        migrationSizeTB: 0,
        migrationCount: 0,
        decodedSizeTB: 0,
        decodedCount: 0,
      };

      existing[sizeKey] += Number(row.TotalSizeTB) || 0;
      existing[countKey] += Number(row.ObjectCount) || 0;
      hourlyData.set(hour, existing);
    });
    console.log(`Added rows for ${sizeKey}:`, rows);
  };

  addRows(migration.rows, "migrationSizeTB", "migrationCount");
  addRows(decoded.rows, "decodedSizeTB", "decodedCount");

  return Array.from(hourlyData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);
}
