"use client"

import { ReactNode } from "react"

import { motion, useSpring, useTransform } from "framer-motion"
import { useEffect } from "react"

interface ResultCardProps {
  icon: ReactNode
  label: ReactNode
  value?: ReactNode
  numericValue?: number
  prefix?: string
  suffix?: string
  highlight?: boolean
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) {
  const springValue = useSpring(0, { bounce: 0, duration: 1500 });
  
  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  const display = useTransform(springValue, (current) => {
    const formatter = new Intl.NumberFormat('en-US', { 
      notation: 'compact', 
      maximumFractionDigits: 2 
    });
    return `${prefix}${formatter.format(current)}${suffix}`;
  });

  return <motion.span>{display}</motion.span>;
}

export default function ResultCard({
  icon,
  label,
  value,
  numericValue,
  prefix = "",
  suffix = "",
  highlight = false
}: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`
        relative p-5 rounded-xl border
        transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg
        overflow-hidden group
        ${
          highlight
            ? "border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 shadow-md"
            : "border-border/60 bg-card hover:border-primary/30"
        }
      `}
    >
      {/* Decorative gradient blob for highlighted cards */}
      {highlight && (
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/20 blur-2xl rounded-full pointer-events-none" />
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-[11px] tracking-wider uppercase text-muted-foreground font-medium">
          <span className={`p-1.5 rounded-lg ${highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary transition-colors duration-300"}`}>
            {icon}
          </span>
          <span>{label}</span>
        </div>
      </div>

      {/* VALUE */}
      <div
        className={`
          mt-4 text-2xl font-bold tracking-tight relative z-10 tabular-nums whitespace-nowrap overflow-hidden text-ellipsis
          ${highlight ? "text-foreground" : "text-foreground group-hover:text-primary transition-colors duration-300"}
        `}
      >
        {numericValue !== undefined ? (
          <AnimatedNumber value={numericValue} prefix={prefix} suffix={suffix} />
        ) : (
          value
        )}
      </div>

      {/* SUBTLE BOTTOM LINE */}
      <div className={`w-full h-[2px] mt-4 rounded-full transition-all duration-300 ${highlight ? "bg-gradient-to-r from-primary/50 to-transparent" : "bg-border/50 group-hover:bg-primary/20"}`} />
    </motion.div>
  )
}