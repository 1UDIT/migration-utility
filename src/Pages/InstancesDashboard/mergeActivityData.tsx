export interface MigrationSummaryRow {
  Hour: number;
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
  migrationCompleted: number;
  decodedCompleted: number;
}



export function mergeActivityData(
  migration: MigrationSummaryResponse,
  decoded: MigrationSummaryResponse
): ActivityChartPoint[] {
  const hourlyData = new Map<number, ActivityChartPoint>();

  console.log("Merging activity data:", {
    migration,
    decoded,
  });

  const addRows = (
    rows: MigrationSummaryRow[],
    key: "migrationCompleted" | "decodedCompleted"
  ) => {
    rows.forEach((row) => {
      const hour = Number(row.Hour);

      const existing = hourlyData.get(hour) ?? {
        time: `${String(hour).padStart(2, "0")}:00`,
        migrationCompleted: 0,
        decodedCompleted: 0,
      };

      existing[key] += Number(row.ObjectCount) || 0;
      hourlyData.set(hour, existing);
    });
    console.log(`Added rows for ${key}:`, rows);
  };

  addRows(migration.rows, "migrationCompleted");
  addRows(decoded.rows, "decodedCompleted");

  return Array.from(hourlyData.entries())
    .sort(([a], [b]) => a - b)
    .map(([, value]) => value);
}
