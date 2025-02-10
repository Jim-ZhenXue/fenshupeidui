"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface BalanceProps {
  leftItem: any
  rightItem: any
  onLeftDrop: (item: any) => void
  onRightDrop: (item: any) => void
}

export default function Balance({ leftItem, rightItem, onLeftDrop, onRightDrop }: BalanceProps) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (leftItem && !rightItem) {
      setRotation(-5)
    } else if (rightItem && !leftItem) {
      setRotation(5)
    } else {
      setRotation(0)
    }
  }, [leftItem, rightItem])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (side: "left" | "right") => (e: React.DragEvent) => {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer.getData("text/plain"))
    if (side === "left") {
      onLeftDrop(data)
    } else {
      onRightDrop(data)
    }
  }

  const renderItem = (item: any) => {
    if (!item) return null
    return (
      <div className="w-full h-full flex items-center justify-center">
        {item.type === "numeric" ? (
          <div className="text-xl">{item.value}</div>
        ) : item.type === "block" ? (
          <div className="w-12 h-12 grid" style={{ gridTemplateColumns: `repeat(${item.parts}, 1fr)` }}>
            {Array.from({ length: item.parts }).map((_, i) => (
              <div key={i} className={`border border-gray-300 ${i < item.filled ? item.color : ""}`} />
            ))}
          </div>
        ) : (
          <div className="w-12 h-12 relative rounded-full border border-gray-300">
            <div
              className={`absolute h-full w-full rounded-full ${item.color}`}
              style={{
                clipPath: `polygon(0 0, 100% 0, 100% ${item.percentage}%, 0 ${item.percentage}%)`,
              }}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative w-80 h-40">
      <div
        className="absolute inset-0 transition-transform duration-500 ease-in-out"
        style={{
          transformOrigin: "bottom center",
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {/* 支柱 */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-2 h-32 bg-gray-700" />

        {/* 横梁 */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-80 h-2 bg-gray-700 rounded" />

        {/* 左盘 */}
        <div
          className="absolute left-0 top-10 -translate-x-1/2 w-20 h-20 rounded-lg border-4 border-gray-700 bg-white"
          onDragOver={handleDragOver}
          onDrop={handleDrop("left")}
        >
          {renderItem(leftItem)}
        </div>

        {/* 右盘 */}
        <div
          className="absolute right-0 top-10 translate-x-1/2 w-20 h-20 rounded-lg border-4 border-gray-700 bg-white"
          onDragOver={handleDragOver}
          onDrop={handleDrop("right")}
        >
          {renderItem(rightItem)}
        </div>
      </div>

      {/* 底座 */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-40 h-2 bg-gray-800 rounded" />
    </div>
  )
}

