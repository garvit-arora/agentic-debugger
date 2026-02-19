import { cn } from "@/lib/utils"

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-slate-100 shadow-xl",
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
    return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
}

export function CardTitle({ className, ...props }) {
    return <h3 className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
}

export function CardContent({ className, ...props }) {
    return <div className={cn("p-6 pt-0", className)} {...props} />
}
