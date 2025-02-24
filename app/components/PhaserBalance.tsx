"use client"

import { useEffect, useRef } from 'react'
import * as Phaser from 'phaser'

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
      width: 500,
      height: 300,
      backgroundColor: '#ffffff',
      scene: {
        create: function(this: Phaser.Scene) {
          // 创建底座
          this.add.rectangle(250, 280, 200, 20, 0x2d3748)
          
          // 创建支柱
          this.add.rectangle(250, 182.5, 20, 215, 0x4a5568)
          
          // 创建支柱尖头
          const pillarTip = this.add.triangle(250, 65, 0, 20, 10, 0, 20, 20, 0x4a5568)
          
          // 创建横梁组
          const beam = this.add.container(250, 100)
          
          // 创建横梁主体
          const beamRect = this.add.rectangle(0, 0, 400, 10, 0x4a5568)
          
          // 创建左盒子
          const leftBox = this.add.rectangle(60, 152, 60, 60, 0xffffff)
          leftBox.setStrokeStyle(4, 0x4a5568)
          
          // 创建右盒子
          const rightBox = this.add.rectangle(440, 152, 60, 60, 0xffffff)
          rightBox.setStrokeStyle(4, 0x4a5568)
          
          // 创建左边吊线
          const leftLine = this.add.graphics()
          
          // 创建右边吊线
          const rightLine = this.add.graphics()
          
          // 更新吊线函数
          const updateLines = () => {
            // 获取横梁端点的世界坐标
            const leftBeamPoint = new Phaser.Math.Vector2(-190, 0)
            const rightBeamPoint = new Phaser.Math.Vector2(190, 0)
            const rotationMatrix = new Phaser.GameObjects.Components.TransformMatrix()
            beam.getWorldTransformMatrix(rotationMatrix)
            const leftWorldPoint = rotationMatrix.transformPoint(leftBeamPoint.x, leftBeamPoint.y)
            const rightWorldPoint = rotationMatrix.transformPoint(rightBeamPoint.x, rightBeamPoint.y)
            
            // 盒子高度的一半（用于计算吊线终点）
            const boxHalfHeight = 30  // 60/2
            
            // 清除并重绘吊线
            leftLine.clear()
            leftLine.lineStyle(2, 0x4a5568)
            leftLine.beginPath()
            leftLine.moveTo(leftWorldPoint.x, leftWorldPoint.y)
            leftLine.lineTo(leftWorldPoint.x, leftWorldPoint.y + 52 - boxHalfHeight)  // 减去盒子高度的一半
            leftLine.strokePath()
            
            rightLine.clear()
            rightLine.lineStyle(2, 0x4a5568)
            rightLine.beginPath()
            rightLine.moveTo(rightWorldPoint.x, rightWorldPoint.y)
            rightLine.lineTo(rightWorldPoint.x, rightWorldPoint.y + 52 - boxHalfHeight)  // 减去盒子高度的一半
            rightLine.strokePath()
            
            // 更新盒子位置
            leftBox.setPosition(leftWorldPoint.x, leftWorldPoint.y + 52)
            rightBox.setPosition(rightWorldPoint.x, rightWorldPoint.y + 52)
          }
          
          beam.add([beamRect])
          
          // 添加交互
          leftBox.setInteractive()
          rightBox.setInteractive()
          
          this.input.setDraggable(leftBox)
          this.input.setDraggable(rightBox)
          
          // 添加动画效果
          this.tweens.add({
            targets: beam,
            angle: leftItem && !rightItem ? -5 : rightItem && !leftItem ? 5 : 0,
            duration: 500,
            ease: 'Power2',
            onUpdate: () => {
              updateLines()
            }
          })
          
          // 初始化吊线位置
          updateLines()
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
      className="w-full h-[300px]"
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