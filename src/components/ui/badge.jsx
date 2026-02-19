import { cn } from "@/lib/utils"

export function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-white/10 text-slate-200 border-white/10",
    success: "bg-emerald-500/15 text-emerald-200 border-emerald-500/20",
    destructive: "bg-red-500/15 text-red-200 border-red-500/20",
    warning: "bg-amber-500/15 text-amber-200 border-amber-500/20",
    info: "bg-sky-500/15 text-sky-200 border-sky-500/20",
  }

  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)} {...props} />
  )
}
