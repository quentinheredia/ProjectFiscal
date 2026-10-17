"use client"

import type React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { motion, type HTMLMotionProps } from "motion/react"

const buttonVariants = cva(
  // Base styles
  "flex items-center justify-center px-4 text-sm font-medium transition-[box-shadow,background-color] active:transition-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      intent: {
        default: [
          "bg-[#36322F]",
          "text-white",
          "hover:enabled:bg-[#4a4542]",
          "disabled:bg-[#8c8885]",
          "[box-shadow:inset_0px_-2.108433723449707px_0px_0px_#171310,0px_1.2048193216323853px_6.325301647186279px_0px_rgba(58,33,8,58%)]",
          "hover:enabled:[box-shadow:inset_0px_-2.53012px_0px_0px_#171310,0px_1.44578px_7.59036px_0px_rgba(58,33,8,64%)]",
          "disabled:shadow-none",
          "active:bg-[#2A2724]",
          "active:[box-shadow:inset_0px_-1.5px_0px_0px_#171310,0px_0.5px_2px_0px_rgba(58,33,8,70%)]",
        ],
        primary: [
          "bg-[#2C7BE5]",
          "text-white",
          "hover:enabled:bg-[#3D8DF5]",
          "disabled:bg-[#9FC3F5]",
          "[box-shadow:inset_0px_-2.108433723449707px_0px_0px_#1A68D1,0px_1.2048193216323853px_6.325301647186279px_0px_rgba(28,100,242,58%)]",
          "hover:enabled:[box-shadow:inset_0px_-2.53012px_0px_0px_#2C7BE5,0px_1.44578px_7.59036px_0px_rgba(28,100,242,64%)]",
          "disabled:shadow-none",
          "active:bg-[#1A68D1]",
          "active:[box-shadow:inset_0px_-1.5px_0px_0px_#1554AB,0px_0.5px_2px_0px_rgba(28,100,242,70%)]",
        ],
        secondary: [
          "bg-[#FFFFFF]",
          "text-[#36322F]",
          "hover:enabled:bg-[#F8F8F8]",
          "disabled:bg-[#F0F0F0]",
          "[box-shadow:inset_0px_-2.108433723449707px_0px_0px_#E0E0E0,0px_1.2048193216323853px_6.325301647186279px_0px_rgba(0,0,0,10%)]",
          "hover:enabled:[box-shadow:inset_0px_-2.53012px_0px_0px_#E8E8E8,0px_1.44578px_7.59036px_0px_rgba(0,0,0,12%)]",
          "disabled:shadow-none",
          "border",
          "border-[#E0E0E0]",
          "active:bg-[#F0F0F0]",
          "active:[box-shadow:inset_0px_-1.5px_0px_0px_#D8D8D8,0px_0.5px_2px_0px_rgba(0,0,0,15%)]",
        ],
        danger: [
          "bg-[#E6492D]",
          "text-white",
          "hover:enabled:bg-[#F05B41]",
          "disabled:bg-[#F5A799]",
          "[box-shadow:inset_0px_-2.108433723449707px_0px_0px_#D63A1F,0px_1.2048193216323853px_6.325301647186279px_0px_rgba(214,58,31,58%)]",
          "hover:enabled:[box-shadow:inset_0px_-2.53012px_0px_0px_#E6492D,0px_1.44578px_7.59036px_0px_rgba(214,58,31,64%)]",
          "disabled:shadow-none",
          "active:bg-[#D63A1F]",
          "active:[box-shadow:inset_0px_-1.5px_0px_0px_#B22E17,0px_0.5px_2px_0px_rgba(214,58,31,70%)]",
        ],
      },
      size: {
        small: ["text-xs", "py-1", "px-2", "h-9", "rounded-[8px]"],
        medium: ["text-base", "py-2", "px-4", "h-11", "rounded-[9px]"],
        large: ["text-lg", "py-3", "px-6", "h-14", "rounded-[11px]"],
      },
      fullWidth: {
        true: "w-full",
      },
    },
    compoundVariants: [
      {
        intent: ["default", "primary", "secondary", "danger"],
        size: "medium",
        className: "uppercase",
      },
    ],
    defaultVariants: {
      intent: "default",
      size: "medium",
    },
  }
)

export interface NeumorphButtonProps
  extends HTMLMotionProps<"button">,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode
  loading?: boolean
}

const NeumorphButton: React.FC<NeumorphButtonProps> = ({
  className,
  intent,
  size,
  fullWidth,
  children,
  loading = false,
  disabled,
  ...props
}) => {
  return (
    <motion.button
      className={buttonVariants({ intent, size, fullWidth, className })}
      disabled={disabled || loading}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      {...props}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      <motion.span
        initial={{ opacity: 1 }}
        animate={{ opacity: loading ? 0.7 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    </motion.button>
  )
}

export default NeumorphButton
