import { AlertTriangle, CheckCircle2, X } from "lucide-react";

type StorageStatus = "Healthy" | "Warning" | "Critical" | "Unknown";

type StorageWarningBannerProps = {
  status?: StorageStatus | string | null;
  instanceName?: string | null;
  usedPercent?: number | string | null;
  freePercent?: number | string | null;
  onClose?: () => void;
};

export function StorageWarningBanner({
  status,
  instanceName,
  usedPercent,
  freePercent,
  onClose,
}: StorageWarningBannerProps) {
  const normalizedStatus = String(status ?? "Unknown").toLowerCase();

  if (normalizedStatus !== "warning" && normalizedStatus !== "critical") {
    return null;
  }

  const isCritical = normalizedStatus === "critical";

  const title = isCritical
    ? "Critical Storage Warning"
    : "Storage Warning";

  const message = isCritical
    ? `${instanceName ?? "Selected instance"} storage is critical. Used  space is ${freePercent ?? 0}%.`
    : `${instanceName ?? "Selected instance"} storage usage is high. Used  space is ${freePercent ?? 0}%.`;

  const wrapperClass = isCritical
    ? "border-red-500 bg-red-500/15 text-red-300"
    : "border-yellow-500 bg-yellow-500/15 text-yellow-300";

  const iconClass = isCritical ? "text-red-300" : "text-yellow-300";

  return (
    <div
      className={`mb-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 shadow-lg ${wrapperClass}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={`mt-0.5 shrink-0 ${iconClass}`} size={20} />

        <div>
          <div className="text-sm font-bold">{title}</div>

          <div className="mt-1 text-xs font-medium">
            {message}
            {/* {freePercent !== null && freePercent !== undefined ? (
              <span className="ml-1">Free space: {freePercent}%.</span>
            ) : null} */}
          </div>
        </div>
      </div>

      {onClose ? (
        <button
          onClick={onClose}
          className="rounded-lg p-1 opacity-80 hover:bg-white/10 hover:opacity-100"
          title="Dismiss"
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}