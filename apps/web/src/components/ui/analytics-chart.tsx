"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

/* ═══════════════════════════════════════════════════════════════════════
 *  AnalyticsLineChart
 *  Vercel-style gradient line chart with floating tooltip cards.
 *
 *  Props:
 *   data            — { date: string, label: string, value: number }[]
 *   gradientStops   — { offset: string, color: string }[]
 *   dotColors       — string[] (per-index overrides)
 *   gridLines       — number  (default 5)
 *   height          — number  (viewBox height, default 280)
 *   pinnedIndices   — number[] (always-visible tooltip indices)
 *   valueLabel      — string  (unit shown in tooltip, default "clicks")
 * ═══════════════════════════════════════════════════════════════════════ */

export interface AnalyticsDataPoint {
  date: string
  label: string
  value: number
  header?: string
  hideDate?: boolean
  xLabel?: string
  xValue?: number
  tooltipHeader?: string
  tooltipBody?: string
  tooltipSubtext?: string
}

export interface ChartAnnotationMarker {
  xValue: number
  label: string
  sublabel?: string
  color?: string
}

export interface AnalyticsGradientStop {
  offset: string
  color: string
}

export const DEFAULT_DATA: AnalyticsDataPoint[] = [
  { date: "2023-09-10", label: "buy-it-now", value: 8420 },
  { date: "2023-10-15", label: "buy-it-now", value: 12_891 },
  { date: "2023-12-10", label: "buy-it-now", value: 21_291 },
  { date: "2024-01-20", label: "buy-it-now", value: 28_530 },
  { date: "2024-02-15", label: "buy-it-now", value: 30_102 },
  { date: "2024-03-10", label: "buy-it-now", value: 33_847 },
  { date: "2024-04-10", label: "buy-it-now", value: 40_171 },
]

export const DEFAULT_GRADIENT: AnalyticsGradientStop[] = [
  { offset: "0%", color: "#FF975C" },
  { offset: "33%", color: "#E9EB4E" },
  { offset: "66%", color: "#9AE13E" },
  { offset: "100%", color: "#35C442" },
]

export const PALETTE = [
  "#FF975C",
  "#EDBE4D",
  "#CBE749",
  "#A8E040",
  "#7DD83C",
  "#5CCC41",
  "#35C442",
]

export function dotColor(i: number, n: number, overrides?: string[]): string {
  if (overrides?.[i]) {
    return overrides[i]!
  }
  const t = n <= 1 ? 1 : i / (n - 1)
  return (
    PALETTE[
      Math.min(Math.round(t * (PALETTE.length - 1)), PALETTE.length - 1)
    ] ?? "#5CCC41"
  )
}

export function fmtDate(s: string) {
  try {
    const d = new Date(`${s}T00:00:00`)
    if (Number.isNaN(d.getTime())) return ""
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return ""
  }
}

export function fmtNum(n: number) {
  return n.toLocaleString("en-US")
}

/* ── Easing ── */
export const EASE_OUT = "cubic-bezier(0.23,1,0.32,1)"

/* ── Tooltip ────────────────────────────────────────────────────────── */
export interface AnalyticsTooltipPoint extends AnalyticsDataPoint {
  x: number
  y: number
  formattedDate: string
  color: string
}

export interface AnalyticsTooltipProps {
  point: AnalyticsTooltipPoint
  color: string
  px: number
  py: number
  side: "top" | "bottom"
  valueLabel: string
  show: boolean
  /** When true, stacks above pinned/static tooltip cards */
  isHovered?: boolean
  isRightEdge?: boolean
  isLeftEdge?: boolean
}

export function AnalyticsTooltip({
  point,
  color,
  px,
  py,
  side,
  valueLabel,
  show,
  isHovered = false,
  isRightEdge = false,
  isLeftEdge = false,
}: AnalyticsTooltipProps) {
  if (!show) return null

  const isTop = side === "top" // card sits ABOVE the point
  const circR = 11 // connector circle outer radius
  const gap = 12 // generous vertical clearance to float cleanly above data points and SVG line strokes

  // Horizontal positioning:
  // If at right edge (x > 75%), anchor card to the RIGHT so it extends LEFT into the chart without clipping
  // If at left edge (x < 25%), anchor card to the LEFT so it extends RIGHT into the chart
  // Otherwise center the card over the circle
  const horizontalPosition = isRightEdge
    ? { right: -(circR - 4), left: "auto" }
    : isLeftEdge
    ? { left: -(circR - 4), right: "auto" }
    : { left: "50%", transform: "translateX(-50%)", right: "auto" }

  const verticalPosition = isTop
    ? { bottom: circR * 2 + gap }
    : { top: circR * 2 + gap }

  return (
    <div
      data-slot="analytics-tooltip"
      style={{
        position: "absolute",
        left: px,
        top: py,
        // Center the anchor on the data point
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: isHovered ? 50 : 20,
      }}
    >
      {/* Connector circle — sits right on the data point (center of wrapper) */}
      <svg
        aria-hidden="true"
        focusable="false"
        height={circR * 2}
        style={{ display: "block" }}
        width={circR * 2}
      >
        <circle
          cx={circR}
          cy={circR}
          fill="#0c121e"
          r={circR - 0.5}
          stroke="rgba(51, 65, 85, 0.8)"
          strokeWidth="1"
        />
        <circle cx={circR} cy={circR} fill={color} r={4.5} />
      </svg>

      {/* Card — positioned absolutely above or below the circle */}
      <div
        data-slot="analytics-tooltip-card"
        style={{
          position: "absolute",
          whiteSpace: "nowrap",
          ...verticalPosition,
          ...horizontalPosition,
          background: "#0c121e",
          backgroundColor: "rgba(12, 18, 30, 0.96)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: 10,
          padding: "9px 13px",
          border: "1px solid rgba(51, 65, 85, 0.8)",
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.05)",
        }}
      >
        {/* Tooltip Header line */}
        {point.tooltipHeader ? (
          <div
            data-slot="analytics-tooltip-header"
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#94a3b8",
              fontFamily: "ui-monospace, monospace",
              marginBottom: 4,
              letterSpacing: "0.01em",
            }}
          >
            {point.tooltipHeader}
          </div>
        ) : point.formattedDate ? (
          <div
            data-slot="analytics-tooltip-date"
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--muted-foreground)",
              letterSpacing: "0.005em",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              marginBottom: 5,
            }}
          >
            {point.formattedDate}
          </div>
        ) : null}

        {/* Tooltip Body line */}
        {point.tooltipBody ? (
          <div
            data-slot="analytics-tooltip-body"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 13.5,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.3,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: color,
                display: "inline-block",
                boxShadow: `0 0 8px ${color}`,
              }}
            />
            <span>{point.tooltipBody}</span>
          </div>
        ) : (
          <div
            data-slot="analytics-tooltip-value"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--foreground)",
                background: `color-mix(in srgb, ${color} 14%, transparent)`,
                padding: "1.5px 6px",
                borderRadius: 4,
                lineHeight: "19px",
              }}
            >
              {point.label}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--muted-foreground)",
                fontVariantNumeric: "tabular-nums",
                lineHeight: "19px",
              }}
            >
              {fmtNum(point.value)} {valueLabel}
            </span>
          </div>
        )}

        {/* Tooltip Subtext line */}
        {point.tooltipSubtext ? (
          <div
            data-slot="analytics-tooltip-subtext"
            style={{
              fontSize: 11,
              color: "#94a3b8",
              marginTop: 4,
              fontFamily: "ui-monospace, monospace",
              fontWeight: 500,
            }}
          >
            {point.tooltipSubtext}
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ── Chart ───────────────────────────────────────────────────────────── */
export interface AnalyticsLineChartProps {
  data?: AnalyticsDataPoint[]
  secondaryData?: { value: number; label?: string }[]
  secondaryColor?: string
  gradientStops?: AnalyticsGradientStop[]
  dotColors?: string[]
  gridLines?: number
  height?: number
  pinnedIndices?: number[]
  valueLabel?: string
  className?: string
  yFormat?: (val: number) => string
  minY?: number
  maxY?: number
  annotations?: ChartAnnotationMarker[]
  legend?: {
    primary: string
    secondary?: string
  }
}

export function AnalyticsLineChart({
  data = DEFAULT_DATA,
  secondaryData,
  secondaryColor = "#38bdf8",
  gradientStops = DEFAULT_GRADIENT,
  dotColors,
  gridLines = 5,
  height = 320,
  pinnedIndices,
  valueLabel = "clicks",
  className,
  yFormat,
  minY,
  maxY,
  annotations,
  legend,
}: AnalyticsLineChartProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [wrapRect, setWrapRect] = useState({ w: 1000, h: 320 })

  const VB_W = 1000
  const VB_H = height
  const pad = useMemo(() => ({ t: 36, r: 48, b: 54, l: 64 }), [])
  const iW = VB_W - pad.l - pad.r
  const iH = VB_H - pad.t - pad.b

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => {
      cancelAnimationFrame(id)
      setMounted(false)
    }
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) {
      return
    }
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const r = entry.contentRect
      setWrapRect({ w: r.width, h: r.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const hasXValues = useMemo(() => data.some((d) => d.xValue !== undefined), [data])
  const minX = useMemo(() => {
    const xs = data.map((d) => d.xValue).filter((x): x is number => x !== undefined)
    return xs.length > 0 ? Math.min(...xs) : 0
  }, [data])
  const maxX = useMemo(() => {
    const xs = data.map((d) => d.xValue).filter((x): x is number => x !== undefined)
    return xs.length > 0 ? Math.max(...xs) : 1
  }, [data])
  const rngX = maxX - minX || 1

  const vs = useMemo(() => {
    const primaryVs = data.map((d) => d.value)
    const secVs = secondaryData ? secondaryData.map((d) => d.value) : []
    return [...primaryVs, ...secVs]
  }, [data, secondaryData])

  const mnVal = minY !== undefined ? minY : Math.min(...vs)
  const mxVal = maxY !== undefined ? maxY : Math.max(...vs)
  const rngVal = mxVal - mnVal || 1

  const points = useMemo(() => {
    return data.map((d, i) => {
      const x =
        hasXValues && d.xValue !== undefined
          ? pad.l + ((d.xValue - minX) / rngX) * iW
          : pad.l + (i / Math.max(data.length - 1, 1)) * iW
      const y = pad.t + iH - ((d.value - mnVal) / rngVal) * iH
      return {
        ...d,
        x,
        y,
        formattedDate: d.header ?? (d.hideDate ? "" : fmtDate(d.date)),
        color: dotColor(i, data.length, dotColors),
      }
    })
  }, [data, iW, iH, pad, dotColors, hasXValues, minX, rngX, mnVal, rngVal])

  const pathD = useMemo(
    () =>
      points
        .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(""),
    [points]
  )

  const secondaryPoints = useMemo(() => {
    if (!secondaryData || secondaryData.length === 0) return []
    return secondaryData.map((d, i) => {
      const matchPoint = points[i]
      const x = matchPoint
        ? matchPoint.x
        : pad.l + (i / Math.max(secondaryData.length - 1, 1)) * iW
      const y = pad.t + iH - ((d.value - mnVal) / rngVal) * iH
      return { x, y, value: d.value }
    })
  }, [secondaryData, points, mnVal, rngVal, pad.l, iW, pad.t, iH])

  const secondaryPathD = useMemo(() => {
    if (secondaryPoints.length === 0) return ""
    return secondaryPoints
      .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join("")
  }, [secondaryPoints])

  const pathLen = useMemo(() => {
    let l = 0
    for (let i = 1; i < points.length; i++) {
      const curr = points[i]
      const prev = points[i - 1]
      if (curr && prev) {
        const dx = curr.x - prev.x,
          dy = curr.y - prev.y
        l += Math.sqrt(dx * dx + dy * dy)
      }
    }
    return Math.ceil(l)
  }, [points])

  const pinned = useMemo(() => {
    if (pinnedIndices) {
      return pinnedIndices
    }
    if (points.length >= 3) {
      return [2, points.length - 1]
    }
    return points.length === 2 ? [0, 1] : [0]
  }, [pinnedIndices, points.length])

  const onMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current
      if (!svg) {
        return
      }
      const r = svg.getBoundingClientRect()
      const mx = ((e.clientX - r.left) / r.width) * VB_W
      let ci = 0,
        md = Number.POSITIVE_INFINITY
      points.forEach((p, i) => {
        const d = Math.abs(p.x - mx)
        if (d < md) {
          md = d
          ci = i
        }
      })
      setHovered(md < 48 ? ci : null)
    },
    [points]
  )

  const active = useMemo(() => {
    const s = new Set(pinned)
    if (hovered !== null) {
      s.add(hovered)
    }
    return s
  }, [pinned, hovered])

  const sx = wrapRect.w / VB_W

  const gradId = `g-${useId().replaceAll(":", "")}`

  return (
    <div
      className={cn("w-full", className)}
      data-slot="analytics-line-chart"
      ref={wrapRef}
      style={{
        position: "relative",
        width: "100%",
        userSelect: "none",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Chart Legend if secondary series is active */}
      {legend && (
        <div className="flex items-center justify-end gap-5 text-xs text-slate-300 font-medium mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="text-slate-200">{legend.primary}</span>
          </div>
          {legend.secondary && (
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-0.5 rounded-full inline-block"
                style={{
                  borderTop: `2px dashed ${secondaryColor || "#38bdf8"}`,
                }}
              />
              <span className="text-sky-300">{legend.secondary}</span>
            </div>
          )}
        </div>
      )}

      <svg
        aria-label="Analytics line chart"
        data-slot="analytics-line-chart-svg"
        onMouseLeave={() => setHovered(null)}
        onMouseMove={onMove}
        ref={svgRef}
        role="img"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          overflow: "visible",
        }}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" x2="100%" y1="0%" y2="0%">
            {gradientStops.map((s) => (
              <stop
                key={`${s.offset}-${s.color}`}
                offset={s.offset}
                stopColor={s.color}
              />
            ))}
          </linearGradient>
          <linearGradient id={`${gradId}-area`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="65%" stopColor="#10b981" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid and Y-axis labels with precision dashed financial gridlines */}
        {Array.from({ length: gridLines }).map((_, i) => {
          const y = pad.t + (i / (gridLines - 1)) * iH
          const tickVal = mxVal - (i / (gridLines - 1)) * rngVal
          const labelText = yFormat
            ? yFormat(tickVal)
            : `$${Math.round(tickVal / 1000)}k`
          return (
            <g key={`grid-row-${y.toFixed(2)}`}>
              <line
                stroke="rgba(51, 65, 85, 0.45)"
                strokeDasharray="4 4"
                strokeWidth="1"
                style={{
                  opacity: mounted ? 0.75 : 0,
                  transition: `opacity 600ms ease ${80 + i * 50}ms`,
                }}
                x1={pad.l}
                x2={pad.l + iW}
                y1={y}
                y2={y}
              />
              <text
                x={pad.l - 12}
                y={y + 3.5}
                textAnchor="end"
                fill="#64748b"
                fontSize="10"
                fontFamily="ui-monospace, monospace"
                fontWeight="500"
                className="tabular-nums"
              >
                {labelText}
              </text>
            </g>
          )
        })}

        {/* Area fill under curve */}
        {points.length > 0 && (
          <path
            d={`${pathD} L ${points[points.length - 1]?.x ?? pad.l + iW} ${pad.t + iH} L ${points[0]?.x ?? pad.l} ${pad.t + iH} Z`}
            fill={`url(#${gradId}-area)`}
            style={{
              opacity: mounted ? 1 : 0,
              transition: "opacity 800ms ease",
            }}
          />
        )}

        {/* Vertical Tax Bracket Annotation Markers */}
        {annotations &&
          annotations.map((ann) => {
            const ax =
              hasXValues && ann.xValue !== undefined
                ? pad.l + ((ann.xValue - minX) / rngX) * iW
                : pad.l + iW * 0.5
            return (
              <g key={`annotation-${ann.xValue}-${ann.label}`}>
                {/* Subtle vertical dashed divider */}
                <line
                  x1={ax}
                  x2={ax}
                  y1={pad.t}
                  y2={pad.t + iH}
                  stroke="rgba(148, 163, 184, 0.22)"
                  strokeDasharray="3 3"
                  strokeWidth="1.2"
                />
                {/* Top bracket badge pill */}
                <rect
                  x={ax - 42}
                  y={pad.t - 22}
                  width={84}
                  height={18}
                  rx={5}
                  fill="#0c121e"
                  stroke="rgba(148, 163, 184, 0.35)"
                  strokeWidth="1"
                />
                <text
                  x={ax}
                  y={pad.t - 9}
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="9.5"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="600"
                >
                  {ann.label}
                </text>
                {ann.sublabel && (
                  <text
                    x={ax}
                    y={pad.t + iH + 13}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="500"
                  >
                    {ann.sublabel}
                  </text>
                )}
              </g>
            )
          })}

        {/* X-axis baseline */}
        <line
          stroke="var(--border)"
          strokeWidth="1.5"
          x1={pad.l}
          x2={pad.l + iW}
          y1={pad.t + iH}
          y2={pad.t + iH}
        />

        {/* X-axis tick labels */}
        {points.map((p, i) => {
          const label = p.xLabel ?? (p.label ? p.label.split(" ")[0] : "")
          if (!label) return null
          return (
            <text
              key={`x-axis-tick-${p.date}-${i}`}
              x={p.x}
              y={pad.t + iH + 26}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="11"
              fontFamily="ui-monospace, monospace"
              fontWeight="600"
              className="tabular-nums"
            >
              {label}
            </text>
          )
        })}

        {/* Secondary Series: Effective Tax Rate (dashed line) */}
        {secondaryPathD && (
          <path
            d={secondaryPathD}
            fill="none"
            stroke={secondaryColor || "#38bdf8"}
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            style={{
              opacity: mounted ? 0.9 : 0,
              transition: "opacity 800ms ease",
            }}
          />
        )}

        {/* Primary Series: Line — stroke-dashoffset draw */}
        <path
          d={pathD}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          style={{
            strokeDasharray: pathLen,
            strokeDashoffset: mounted ? 0 : pathLen,
            transition: `stroke-dashoffset 1000ms ${EASE_OUT}`,
          }}
        />

        {/* Dots — hidden when tooltip is active (connector circle takes over) */}
        {points.map((p, i) => {
          const isActive = active.has(i)
          const enterDelay = 700 + i * 80
          return (
            <g key={`${p.date}-${p.label}-${p.value}`}>
              {/* Main dot — fade out when tooltip connector is showing */}
              <circle
                cx={p.x}
                cy={p.y}
                fill={p.color}
                r="4"
                stroke="var(--card)"
                strokeWidth="2.5"
                style={{
                  opacity: mounted ? (isActive ? 0 : 1) : 0,
                  transition: [
                    `opacity ${isActive ? "120ms" : "350ms"} ease ${mounted ? "0ms" : `${enterDelay}ms`}`,
                  ].join(","),
                }}
              />
              {/* Hit target */}
              <circle
                cx={p.x}
                cy={p.y}
                fill="transparent"
                r="22"
                style={{ cursor: "pointer" }}
              />
            </g>
          )
        })}
      </svg>

      {/* Tooltip layer */}
      {points.map((p, i) => {
        const isRightEdge = p.x > VB_W * 0.75
        const isLeftEdge = p.x < VB_W * 0.25
        return (
          <AnalyticsTooltip
            color={p.color}
            isHovered={hovered === i}
            isLeftEdge={isLeftEdge}
            isRightEdge={isRightEdge}
            key={`tooltip-${p.date}-${p.label}-${p.value}`}
            point={p}
            px={p.x * sx}
            py={p.y * sx}
            show={active.has(i) && mounted}
            side={p.y < pad.t + iH * 0.45 ? "bottom" : "top"}
            valueLabel={valueLabel}
          />
        )
      })}
    </div>
  )
}
