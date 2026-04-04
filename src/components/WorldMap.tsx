'use client'

import { useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DottedMap from 'dotted-map'
import Image from 'next/image'

interface MapDot {
  start: { lat: number; lng: number; label?: string }
  end: { lat: number; lng: number; label?: string }
  color?: string
  routeLabel?: string
}

interface WorldMapProps {
  dots?: MapDot[]
  lineColor?: string
  mapBg?: string
  animationDuration?: number
  loop?: boolean
}

export function WorldMap({
  dots = [],
  lineColor = '#C84B31',
  mapBg = '#0E0E0E',
  animationDuration = 2.2,
  loop = true,
}: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)

  const map = useMemo(() => new DottedMap({ height: 100, grid: 'diagonal' }), [])

  const svgMap = useMemo(
    () =>
      map.getSVG({
        radius: 0.22,
        color: 'rgba(200,75,49,0.28)',
        shape: 'circle',
        backgroundColor: mapBg,
      }),
    [map, mapBg]
  )

  const projectPoint = (lat: number, lng: number) => ({
    x: (lng + 180) * (800 / 360),
    y: (90 - lat) * (400 / 180),
  })

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2
    const midY = Math.min(start.y, end.y) - 55
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`
  }

  const staggerDelay = 0.4
  const totalAnimationTime = dots.length * staggerDelay + animationDuration
  const pauseTime = 2.5
  const fullCycleDuration = totalAnimationTime + pauseTime

  return (
    <div className="world-map-wrap">
      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="world-map-img"
        alt="Carte du monde -routes vers le Dagestan"
        height={495}
        width={1056}
        draggable={false}
        priority
      />

      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="world-map-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {dots.map((dot, i) => {
            const c = dot.color || lineColor
            return (
              <linearGradient key={`grad-${i}`} id={`path-gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="5%" stopColor={c} stopOpacity="1" />
                <stop offset="95%" stopColor={c} stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            )
          })}
          <filter id="glow">
            <feMorphology operator="dilate" radius="0.5" />
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Animated paths */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng)
          const endPoint = projectPoint(dot.end.lat, dot.end.lng)
          const pathD = createCurvedPath(startPoint, endPoint)

          const startTime = (i * staggerDelay) / fullCycleDuration
          const endTime = (i * staggerDelay + animationDuration) / fullCycleDuration
          const resetTime = totalAnimationTime / fullCycleDuration

          const dotColor = dot.color || lineColor

          return (
            <g key={`path-${i}`}>
              <motion.path
                d={pathD}
                fill="none"
                stroke={`url(#path-gradient-${i})`}
                strokeWidth="1.2"
                initial={{ pathLength: 0 }}
                animate={loop ? { pathLength: [0, 0, 1, 1, 0] } : { pathLength: 1 }}
                transition={
                  loop
                    ? {
                        duration: fullCycleDuration,
                        times: [0, startTime, endTime, resetTime, 1],
                        ease: 'easeInOut',
                        repeat: Infinity,
                      }
                    : { duration: animationDuration, delay: i * staggerDelay, ease: 'easeInOut' }
                }
              />
              {loop && (
                <motion.circle
                  r="3.5"
                  fill={dotColor}
                  filter="url(#glow)"
                  initial={{ offsetDistance: '0%', opacity: 0 }}
                  animate={{
                    offsetDistance: [null, '0%', '100%', '100%', '100%'],
                    opacity: [0, 0, 1, 0, 0],
                  }}
                  transition={{
                    duration: fullCycleDuration,
                    times: [0, startTime, endTime, resetTime, 1],
                    ease: 'easeInOut',
                    repeat: Infinity,
                  }}
                  style={{ offsetPath: `path('${pathD}')` }}
                />
              )}
            </g>
          )
        })}

        {/* Points + Labels */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng)
          const endPoint = projectPoint(dot.end.lat, dot.end.lng)
          const endColor = dot.color || lineColor
          const midX = (startPoint.x + endPoint.x) / 2
          const midY = Math.min(startPoint.y, endPoint.y) - 55

          return (
            <g key={`pts-${i}`}>
              {/* Start */}
              <motion.g
                onHoverStart={() => setHoveredLocation(dot.start.label ?? null)}
                onHoverEnd={() => setHoveredLocation(null)}
                whileHover={{ scale: 1.25 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={startPoint.x} cy={startPoint.y} r="3" fill={lineColor} filter="url(#glow)" />
                <circle cx={startPoint.x} cy={startPoint.y} r="3" fill={lineColor} opacity="0.45">
                  <animate attributeName="r" from="3" to="11" dur="2s" begin="0s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="2s" begin="0s" repeatCount="indefinite" />
                </circle>
              </motion.g>
              {dot.start.label && (
                <motion.g
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 * i + 0.3, duration: 0.5 }}
                  style={{ pointerEvents: 'none' }}
                >
                  <foreignObject x={startPoint.x - 45} y={startPoint.y - 32} width="90" height="26">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <span className="map-label">{dot.start.label}</span>
                    </div>
                  </foreignObject>
                </motion.g>
              )}

              {/* Route label above arc */}
              {dot.routeLabel && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 * i + 0.8, duration: 0.6 }}
                  style={{ pointerEvents: 'none' }}
                >
                  <foreignObject x={midX - 55} y={midY - 24} width="110" height="22">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <span className="map-route-label" style={{ color: endColor }}>{dot.routeLabel}</span>
                    </div>
                  </foreignObject>
                </motion.g>
              )}

              {/* End */}
              <motion.g
                onHoverStart={() => setHoveredLocation(dot.end.label ?? null)}
                onHoverEnd={() => setHoveredLocation(null)}
                whileHover={{ scale: 1.25 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={endPoint.x} cy={endPoint.y} r="3" fill={endColor} filter="url(#glow)" />
                <circle cx={endPoint.x} cy={endPoint.y} r="3" fill={endColor} opacity="0.45">
                  <animate attributeName="r" from="3" to="11" dur="2s" begin="0.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="2s" begin="0.5s" repeatCount="indefinite" />
                </circle>
              </motion.g>
              {dot.end.label && (
                <motion.g
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 * i + 0.5, duration: 0.5 }}
                  style={{ pointerEvents: 'none' }}
                >
                  <foreignObject x={endPoint.x - 45} y={endPoint.y - 32} width="90" height="26">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <span className="map-label">{dot.end.label}</span>
                    </div>
                  </foreignObject>
                </motion.g>
              )}
            </g>
          )
        })}
      </svg>

      <AnimatePresence>
        {hoveredLocation && (
          <motion.div
            className="map-tooltip"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            {hoveredLocation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
