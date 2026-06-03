import { useEffect, useMemo } from "react";
import { AlertTriangle, XCircle } from "lucide-react";

type GlobalStorageAlertProps = {
  rows: any[];
  refreshKey?: number;
};

export function GlobalStorageAlert({ rows, refreshKey }: GlobalStorageAlertProps) {
  const alertData = useMemo(() => {
    const safeRows = Array.isArray(rows) ? rows : [];

    const criticalRows = safeRows.filter(
      (row) => String(row.storageStatus ?? "").toLowerCase() === "critical"
    );

    const warningRows = safeRows.filter(
      (row) => String(row.storageStatus ?? "").toLowerCase() === "warning"
    );

    const isCritical = criticalRows.length > 0;
    const activeRows = isCritical ? criticalRows : warningRows;

    return {
      isCritical,
      criticalRows,
      warningRows,
      activeRows,
      criticalCount: criticalRows.length,
      warningCount: warningRows.length,
      hasAlert: criticalRows.length > 0 || warningRows.length > 0,
    };
  }, [rows]);

  // useEffect(() => {
  //   if (!alertData.hasAlert) return;

  //   const title = alertData.isCritical
  //     ? "Critical Storage Alert"
  //     : "Storage Warning";

  //   const firstItem = alertData.activeRows[0];

  //   const body = alertData.isCritical
  //     ? `${alertData.criticalCount} instance(s) are critical. Example: ${
  //         firstItem?.instanceName ?? firstItem?.ip ?? "instance"
  //       } used ${firstItem?.driveUsedPercent ?? 0}%.`
  //     : `${alertData.warningCount} instance(s) are in warning. Example: ${
  //         firstItem?.instanceName ?? firstItem?.ip ?? "instance"
  //       } used ${firstItem?.driveUsedPercent ?? 0}%.`;

  //   if (!("Notification" in window)) return;

  //   if (Notification.permission === "granted") {
  //     new Notification(title, { body });
  //   } else if (Notification.permission !== "denied") {
  //     Notification.requestPermission();
  //   }
  // }, [refreshKey]); // important: runs every successful API refresh

  if (!alertData.hasAlert) return null;

  const title = alertData.isCritical
    ? "Critical Storage Alert"
    : "Storage Warning";

  const message = alertData.isCritical
    ? `${alertData.criticalCount} instance(s) have critical storage usage.`
    : `${alertData.warningCount} instance(s) have warning storage usage.`;

  const className = alertData.isCritical
    ? "border-red-500 bg-red-500/15 text-red-300"
    : "border-yellow-500 bg-yellow-500/15 text-yellow-300";

  const Icon = alertData.isCritical ? XCircle : AlertTriangle;

  return (
    <div className={`mb-4 rounded-xl border px-4 py-3 shadow-lg ${className}`}>
      <div className="flex items-start gap-3">
        <Icon size={22} className="mt-0.5 shrink-0" />

        <div>
          <div className="text-sm font-bold">{title}</div>
          <div className="mt-1 text-xs font-medium">{message}</div>

          <div className="mt-2 flex flex-wrap gap-2">
            {alertData.activeRows.slice(0, 5).map((item, index) => (
              <span
                key={`${item.ip ?? index}-${index}`}
                className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                  alertData.isCritical
                    ? "bg-red-500/20"
                    : "bg-yellow-500/20"
                }`}
              >
                {item.ip ?? "Unknown"} —{" "}
                {item.driveUsedPercent ?? 0}% used
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}