"use client"

import type React from "react"

interface FractionGridProps {
  onMatch: (matched: boolean) => void
}

export default function FractionGrid({ onMatch }: FractionGridProps) {
  const fractions = [
    { type: "numeric", value: "2/3" },
    { type: "block", color: "bg-sky-400", parts: 3, filled: 2 },
    { type: "block", color: "bg-green-400", parts: 3, filled: 1 },
    { type: "block", color: "bg-red-400", parts: 2, filled: 1 },
    { type: "numeric", value: "1/1" },
    { type: "block", color: "bg-green-400", parts: 4, filled: 3 },
    { type: "block", color: "bg-red-400", parts: 3, filled: 1 },
    { type: "circle", color: "bg-sky-400", percentage: 50 },
    { type: "block", color: "bg-green-400", parts: 1, filled: 1 },
    { type: "block", color: "bg-sky-400", parts: 3, filled: 2 },
  ]

  const handleDragStart = (e: React.DragEvent, fraction: any) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(fraction))
  }

  return (
    <div className="grid grid-cols-5 gap-4 border border-gray-200 p-4">
      {fractions.map((fraction, index) => (
        <div
          key={index}
          className="aspect-square border border-gray-300 p-2 cursor-move"
          draggable
          onDragStart={(e) => handleDragStart(e, fraction)}
        >
          {fraction.type === "numeric" ? (
            <div className="flex h-full items-center justify-center text-xl">{fraction.value}</div>
          ) : fraction.type === "block" ? (
            <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${fraction.parts}, 1fr)` }}>
              {Array.from({ length: fraction.parts }).map((_, i) => (
                <div key={i} className={`border border-gray-300 ${i < fraction.filled ? fraction.color : ""}`} />
              ))}
            </div>
          ) : (
            <div className="relative h-full w-full rounded-full border border-gray-300">
              <div
                className={`absolute h-full w-full rounded-full ${fraction.color}`}
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% ${fraction.percentage}%, 0 ${fraction.percentage}%)`,
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

