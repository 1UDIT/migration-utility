

type KpiStatus = "Healthy" | "Warning" | "Critical" | "Info" |"Unknown";

type KpiCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  status?: KpiStatus;
  icon?: React.ReactNode;
  progress?: number; // 0 - 100
  progressLabel?: string;
};

export const KpiCard = ({
  title,
  value,
  subtitle,
  status = "Info",
  icon,
  progress,
  progressLabel,
}: KpiCardProps) => {
  const statusStyle = {
    Healthy: {
      border: "border-slate-500/40",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      bar: "bg-emerald-500",
      glow: "shadow-emerald-500/10",
    },
    Warning: {
      border: "border-slate-500/50",
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      bar: "bg-yellow-500",
      glow: "shadow-yellow-500/10",
    },
    Critical: {
      border: "border-slate-500/60",
      bg: "bg-red-500/10",
      text: "text-red-400",
      bar: "bg-red-500",
      glow: "shadow-red-500/10",
    },
    Info: {
      border: "border-slate-600/70",
      bg: "bg-slate-800/40",
      text: "text-blue-400",
      bar: "bg-blue-500",
      glow: "shadow-black/20",
    },
    Unknown: {
      border: "border-slate-500/50",
      bg: "bg-gray-500/10",
      text: "text-gray-400",
      bar: "bg-gray-500",
      glow: "shadow-gray-500/10",
    },
  };

  const style = statusStyle[status];

  return (
    <div
      className={`rounded-2xl border ${style.border} bg-[#142233] p-4 shadow-lg ${style.glow}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-200">
            {title}
          </div>

          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-extrabold leading-none text-white">
              {value}
            </span>
          </div>

          {subtitle ? (
            <div className={`mt-2 text-xs font-semibold ${style.text}`}>
              {subtitle}
            </div>
          ) : null}
        </div>

        {icon? (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.text}`}
          >
            {icon}
          </div>
        ) : null}
      </div>

      {typeof progress === "number" ? (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-slate-400">{progressLabel ?? "Usage"}</span>
            <span className={`font-bold ${style.text}`}>{progress}%</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className={`h-full rounded-full ${style.bar}`}
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}