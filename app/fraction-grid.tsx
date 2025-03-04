"use client"

import { useEffect, useState } from "react"
import type { DragEvent } from "react"

interface FractionType {
  id?: string;
  type: "numeric" | "block" | "circle"
  value?: string
  color?: string
  parts?: number
  filled?: number
  percentage?: number
}

interface GridItem {
  fraction: FractionType | null;
  id: string;
}

interface FractionGridProps {
  onMatch: (matched: boolean) => void
}

export default function FractionGrid({ onMatch }: FractionGridProps) {
  const initialFractions: FractionType[] = [
    { id: "f1", type: "numeric", value: "3/4" },
    { id: "f2", type: "block", color: "bg-sky-400", parts: 3, filled: 2 },
    { id: "f3", type: "block", color: "bg-green-400", parts: 3, filled: 1 },
    { id: "f4", type: "block", color: "bg-red-400", parts: 2, filled: 1 },
    { id: "f5", type: "numeric", value: "1/1" },
    { id: "f6", type: "block", color: "bg-green-400", parts: 4, filled: 3 },
    { id: "f7", type: "block", color: "bg-red-400", parts: 3, filled: 1 },
    { id: "f8", type: "circle", color: "bg-sky-400", percentage: 50 },
    { id: "f9", type: "block", color: "bg-green-400", parts: 1, filled: 1 },
    { id: "f10", type: "block", color: "bg-red-400", parts: 3, filled: 2 },
  ]
  
  // 创建一个固定的网格，每个位置可以有分数或为空
  const [gridItems, setGridItems] = useState<GridItem[]>(
    initialFractions.map((fraction, index) => ({
      fraction,
      id: `grid-${index}`
    }))
  );
  
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleDragStart = (e: DragEvent | React.TouchEvent, fraction: FractionType, gridItemId: string) => {
    if (fraction) {
      setDraggedItemId(gridItemId);
    }
    
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
        
        // 如果拖放到天平上，将该位置设为空
        if (draggedItemId) {
          setGridItems(items => 
            items.map(item => 
              item.id === draggedItemId 
                ? { ...item, fraction: null } 
                : item
            )
          );
          setDraggedItemId(null);
        }
      }
      
      clone.remove()
      delete (window as any).dragData
    }
  }
  
  // 处理拖放结束事件
  const handleDragEnd = (e: DragEvent) => {
    // 检查是否成功放置
    if (e.dataTransfer.dropEffect === 'move' && draggedItemId) {
      // 将该位置设为空，而不是移除
      setGridItems(items => 
        items.map(item => 
          item.id === draggedItemId 
            ? { ...item, fraction: null } 
            : item
        )
      );
      setDraggedItemId(null);
    }
  }

  useEffect(() => {
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
    
    // 监听自定义事件，当天平接收到拖放时触发
    const handleBalanceDrop = () => {
      if (draggedItemId) {
        setGridItems(items => 
          items.map(item => 
            item.id === draggedItemId 
              ? { ...item, fraction: null } 
              : item
          )
        );
        setDraggedItemId(null);
      }
    };
    
    window.addEventListener('balance-drop', handleBalanceDrop);
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('balance-drop', handleBalanceDrop);
    }
  }, [draggedItemId]);

  return (
    <div className="w-full grid grid-cols-2 gap-1 border border-gray-700 p-1 bg-gray-900">
      {gridItems.map((gridItem) => (
        <div
          key={gridItem.id}
          className="aspect-square border border-gray-700 p-1 bg-gray-800"
        >
          {gridItem.fraction ? (
            <div 
              className="w-full h-full cursor-move"
              draggable
              onDragStart={(e) => handleDragStart(e, gridItem.fraction!, gridItem.id)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleDragStart(e, gridItem.fraction!, gridItem.id)}
            >
              {gridItem.fraction.type === "numeric" ? (
                <div className="flex h-full items-center justify-center">
                  {gridItem.fraction.value && (
                    <div className="flex flex-col items-center">
                      <div className="text-xl text-white">{gridItem.fraction.value.split('/')[0]}</div>
                      <div className="w-full h-[2px] bg-white"></div>
                      <div className="text-xl text-white">{gridItem.fraction.value.split('/')[1]}</div>
                    </div>
                  )}
                </div>
              ) : gridItem.fraction.type === "block" && gridItem.fraction.parts ? (
                <div className={`h-full ${gridItem.fraction.id === "f3" || gridItem.fraction.id === "f10" ? "flex flex-col" : "grid"}`} style={{ 
                  ...(gridItem.fraction.id !== "f3" && gridItem.fraction.id !== "f10" ? { gridTemplateColumns: `repeat(${gridItem.fraction.parts}, 1fr)` } : {})
                }}>
                  {Array.from({ length: gridItem.fraction.parts }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`border border-gray-700 ${i < (gridItem.fraction.filled || 0) ? gridItem.fraction.color : ""} ${gridItem.fraction.id === "f3" || gridItem.fraction.id === "f10" ? "flex-1" : ""}`} 
                    />
                  ))}
                </div>
              ) : (
                <div className="relative h-full w-full rounded-full border border-gray-700">
                  <div
                    className={`absolute h-full w-full rounded-full ${gridItem.fraction.color}`}
                    style={{
                      clipPath: `polygon(0 0, 100% 0, 100% ${gridItem.fraction.percentage}%, 0 ${gridItem.fraction.percentage}%)`,
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            // 空白单元格
            <div className="w-full h-full"></div>
          )}
        </div>
      ))}
    </div>
  )
}
