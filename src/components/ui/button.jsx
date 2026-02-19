import { cn } from "@/lib/utils"

export function Button({ className, variant = "primary", size = "default", ...props }) {
  const variants = {
    primary: "bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20",
    secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
    ghost: "hover:bg-white/5 text-slate-300 hover:text-white",
    outline: "border border-white/20 text-slate-300 hover:border-white/40 hover:text-white bg-transparent"
  }
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6 text-lg"
  }

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}
