"use client"

import { useEffect, useRef } from 'react'
import Phaser from 'phaser'

interface PhaserBalanceProps {
  leftItem: any
  rightItem: any
  onLeftDrop: (item: any) => void
  onRightDrop: (item: any) => void
}

export default function PhaserBalance({ leftItem, rightItem, onLeftDrop, onRightDrop }: PhaserBalanceProps) {
  const gameRef = useRef<Phaser.Game | null>(null)
  const parentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!parentRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: parentRef.current,
      width: 800,
      height: 400,
      backgroundColor: '#ffffff',
      scene: {
        create: function(this: Phaser.Scene) {
          // 创建支柱
          this.add.rectangle(400, 350, 20, 200, 0x4a5568)
          // 创建底座
          this.add.rectangle(400, 380, 200, 20, 0x2d3748)
          
          // 创建横梁组
          const beam = this.add.container(400, 250)
          const beamRect = this.add.rectangle(0, 0, 400, 10, 0x4a5568)
          
          // 创建左盘
          const leftPlate = this.add.rectangle(-180, 30, 100, 100, 0xffffff)
          leftPlate.setStrokeStyle(4, 0x4a5568)
          
          // 创建右盘
          const rightPlate = this.add.rectangle(180, 30, 100, 100, 0xffffff)
          rightPlate.setStrokeStyle(4, 0x4a5568)
          
          beam.add([beamRect, leftPlate, rightPlate])
          
          // 添加交互
          leftPlate.setInteractive()
          rightPlate.setInteractive()
          
          this.input.setDraggable(leftPlate)
          this.input.setDraggable(rightPlate)
          
          // 添加动画效果
          this.tweens.add({
            targets: beam,
            angle: leftItem && !rightItem ? -5 : rightItem && !leftItem ? 5 : 0,
            duration: 500,
            ease: 'Power2'
          })
        }
      }
    }

    // 创建游戏实例
    gameRef.current = new Phaser.Game(config)

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
      }
    }
  }, [leftItem, rightItem])

  return (
    <div 
      ref={parentRef} 
      className="w-full h-[400px]"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const data = JSON.parse(e.dataTransfer.getData('text/plain'))
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        
        if (x < rect.width / 2) {
          onLeftDrop(data)
        } else {
          onRightDrop(data)
        }
      }}
    />
  )
} 