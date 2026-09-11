export type InfoRowStatus = "normal" | "success" | "Warning" | "Critical" | "Unknown" | "Healthy";

export function InfoRow({
  k,
  v,
  status = "normal",
  progress,
  progressLabel,
}: {
  k: string;
  v: string | number;
  status?: InfoRowStatus;
  progress?: number;
  progressLabel?: string;
}) {
  const statusClass: Record<InfoRowStatus, string> = {
    normal: "text-white",
    success: "text-green-400",
    Warning: "text-yellow-400",
    Critical: "text-red-400",
    Unknown: "text-slate-400",
    Healthy: "text-green-400",
  };

  const barClass: Record<InfoRowStatus, string> = {
    normal: "bg-blue-500",
    success: "bg-green-500",
    Warning: "bg-yellow-500",
    Critical: "bg-red-500",
    Unknown: "bg-slate-500",
    Healthy: "bg-green-500",
  };

  const safeProgress =
    typeof progress === "number"
      ? Math.min(Math.max(progress, 0), 100)
      : undefined;


  return (
    <div className="border-b border-slate-700/50 py-1 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-[95px] text-xs font-medium text-slate-300">
          {k}
        </div>

        <div
          className={`max-w-[220px] break-words text-right text-xs font-bold ${statusClass[status]} line-clamp-2 break-words`} 
          title={String(v)}
        >
          {v}
        </div>
      </div>

      {typeof safeProgress === "number" && (
        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              {progressLabel ?? "Progress"}
            </span>

            <span className={`font-bold ${statusClass[status]}`}>
              {safeProgress}%
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className={`h-full rounded-full ${barClass[status]} transition-all duration-500`}
              style={{ width: `${safeProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}