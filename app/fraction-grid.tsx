"use client"

import { useEffect } from "react"
import type { DragEvent } from "react"

interface FractionType {
  type: "numeric" | "block" | "circle"
  value?: string
  color?: string
  parts?: number
  filled?: number
  percentage?: number
}

interface FractionGridProps {
  onMatch: (matched: boolean) => void
}

export default function FractionGrid({ onMatch }: FractionGridProps) {
  const fractions: FractionType[] = [
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

  const handleDragStart = (e: DragEvent | React.TouchEvent, fraction: FractionType) => {
    if ('dataTransfer' in e) {
      // Mouse drag event
      e.dataTransfer.setData("text/plain", JSON.stringify(fraction))
    } else {
      // Touch event
      const touch = e.touches[0]
      const target = e.target as HTMLElement
      const clone = target.cloneNode(true) as HTMLElement
      
      clone.style.position = 'fixed'
      clone.style.left = touch.clientX - target.offsetWidth / 2 + 'px'
      clone.style.top = touch.clientY - target.offsetHeight / 2 + 'px'
      clone.style.opacity = '0.8'
      clone.style.pointerEvents = 'none'
      clone.id = 'dragging-clone'
      
      document.body.appendChild(clone)
      
      // Store the fraction data on the clone element
      ;(window as any).dragData = fraction
    }
  }

  const handleTouchMove = (e: Event) => {
    const clone = document.getElementById('dragging-clone')
    if (clone && e instanceof TouchEvent) {
      const touch = e.touches[0]
      clone.style.left = touch.clientX - clone.offsetWidth / 2 + 'px'
      clone.style.top = touch.clientY - clone.offsetHeight / 2 + 'px'
    }
  }

  const handleTouchEnd = (e: Event) => {
    const clone = document.getElementById('dragging-clone')
    if (clone && e instanceof TouchEvent) {
      const touch = e.changedTouches[0]
      const elements = document.elementsFromPoint(touch.clientX, touch.clientY)
      const dropTarget = elements.find(el => el.classList.contains('phaser-balance'))
      
      if (dropTarget) {
        const rect = dropTarget.getBoundingClientRect()
        const x = touch.clientX - rect.left
        const event = new CustomEvent('custom-drop', {
          detail: {
            data: (window as any).dragData,
            side: x < rect.width / 2 ? 'left' : 'right'
          }
        })
        dropTarget.dispatchEvent(event)
      }
      
      clone.remove()
      delete (window as any).dragData
    }
  }

  useEffect(() => {
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  return (
    <div className="w-full grid grid-cols-2 gap-1 border border-gray-700 p-1 bg-gray-900">
      {fractions.map((fraction, index) => (
        <div
          key={index}
          className="aspect-square border border-gray-700 p-1 cursor-move text-[0.6rem] bg-gray-800"
          draggable
          onDragStart={(e) => handleDragStart(e, fraction)}
          onTouchStart={(e) => handleDragStart(e, fraction)}
        >
          {fraction.type === "numeric" ? (
            <div className="flex h-full items-center justify-center text-xl text-white">{fraction.value}</div>
          ) : fraction.type === "block" && fraction.parts ? (
            <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${fraction.parts}, 1fr)` }}>
              {Array.from({ length: fraction.parts }).map((_, i) => (
                <div key={i} className={`border border-gray-700 ${i < (fraction.filled || 0) ? fraction.color : ""}`} />
              ))}
            </div>
          ) : (
            <div className="relative h-full w-full rounded-full border border-gray-700">
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

