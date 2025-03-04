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
      input: {
        activePointers: 2,
        touch: {
          capture: true
        }
      },
      scene: {
        create: function(this: Phaser.Scene) {
          // 颜色转换辅助函数
          this.getColorFromTailwind = (tailwindColor: string) => {
            const colorMap: Record<string, number> = {
              'bg-red-400': 0xfc8181,
              'bg-green-400': 0x68d391,
              'bg-sky-400': 0x38bdf8,
              'bg-blue-400': 0x63b3ed,
              'bg-yellow-400': 0xf6e05e,
              'bg-purple-400': 0xb794f4,
              'bg-pink-400': 0xf687b3,
              'bg-gray-400': 0xcbd5e0
            }
            return colorMap[tailwindColor] || 0x38bdf8 // 默认蓝色
          }
          
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
          const leftBox = this.add.rectangle(60, 152, 78, 78, 0xffffff)
          leftBox.setStrokeStyle(4, 0x4a5568)
          
          // 创建右盒子
          const rightBox = this.add.rectangle(440, 152, 78, 78, 0xffffff)
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
            const boxHalfHeight = 39  // 78/2
            
            // 清除并重绘吊线
            leftLine.clear()
            leftLine.lineStyle(2, 0x4a5568)
            leftLine.beginPath()
            leftLine.moveTo(leftWorldPoint.x, leftWorldPoint.y)
            leftLine.lineTo(leftWorldPoint.x, leftWorldPoint.y + 52 - boxHalfHeight)
            leftLine.strokePath()
            
            rightLine.clear()
            rightLine.lineStyle(2, 0x4a5568)
            rightLine.beginPath()
            rightLine.moveTo(rightWorldPoint.x, rightWorldPoint.y)
            rightLine.lineTo(rightWorldPoint.x, rightWorldPoint.y + 52 - boxHalfHeight)
            rightLine.strokePath()
            
            // 更新盒子位置
            leftBox.setPosition(leftWorldPoint.x, leftWorldPoint.y + 52)
            rightBox.setPosition(rightWorldPoint.x, rightWorldPoint.y + 52)
            
            // 更新分数容器位置到盒子中心
            leftFractionContainer.setPosition(leftWorldPoint.x, leftWorldPoint.y + 52)
            rightFractionContainer.setPosition(rightWorldPoint.x, rightWorldPoint.y + 52)
          }
          
          beam.add([beamRect])
          
          // 添加交互
          leftBox.setInteractive()
          rightBox.setInteractive()
          
          // 创建分数图形容器
          const leftFractionContainer = this.add.container(0, 0)
          const rightFractionContainer = this.add.container(0, 0)
          
          // 更新盒子内容函数
          const updateBoxContents = () => {
            // 清空容器
            leftFractionContainer.removeAll(true)
            rightFractionContainer.removeAll(true)
            
            // 获取盒子的世界坐标
            const leftBoxPos = leftBox.getCenter()
            const rightBoxPos = rightBox.getCenter()
            
            // 更新容器位置到盒子中心
            leftFractionContainer.setPosition(leftBoxPos.x, leftBoxPos.y)
            rightFractionContainer.setPosition(rightBoxPos.x, rightBoxPos.y)
            
            // 如果有左侧物品，创建其图形表示
            if (leftItem) {
              if (leftItem.type === "numeric" && leftItem.value) {
                // 数字分数 - 使用分数线代替斜杠
                const [numerator, denominator] = leftItem.value.split('/')
                
                // 创建分子
                const numeratorText = this.add.text(0, -12, numerator, { 
                  font: '18px Arial', 
                  color: '#000000',
                  align: 'center'
                }).setOrigin(0.5)
                
                // 创建分数线
                const line = this.add.rectangle(0, 0, 20, 2, 0x000000)
                
                // 创建分母
                const denominatorText = this.add.text(0, 12, denominator, { 
                  font: '18px Arial', 
                  color: '#000000',
                  align: 'center'
                }).setOrigin(0.5)
                
                // 添加到容器
                leftFractionContainer.add([numeratorText, line, denominatorText])
              } else if (leftItem.type === "block" && leftItem.parts) {
                // 方块分数
                const blockWidth = 60 / leftItem.parts
                const blockHeight = 60
                const startX = -(blockWidth * leftItem.parts) / 2 + blockWidth / 2
                
                for (let i = 0; i < leftItem.parts; i++) {
                  const block = this.add.rectangle(
                    startX + i * blockWidth, 
                    0, 
                    blockWidth - 2, 
                    blockHeight - 2, 
                    i < leftItem.filled ? this.getColorFromTailwind(leftItem.color) : 0xffffff
                  )
                  block.setStrokeStyle(1, 0x000000)
                  leftFractionContainer.add(block)
                }
              } else if (leftItem.type === "circle" && leftItem.percentage) {
                // 圆形分数
                const circle = this.add.circle(0, 0, 30, 0xffffff)
                circle.setStrokeStyle(1, 0x000000)
                leftFractionContainer.add(circle)
                
                // 创建扇形填充
                const pie = this.add.graphics()
                pie.fillStyle(this.getColorFromTailwind(leftItem.color), 1)
                pie.slice(0, 0, 30, 0, (leftItem.percentage / 100) * Math.PI * 2, true)
                pie.fillPath()
                leftFractionContainer.add(pie)
              }
            }
            
            // 如果有右侧物品，创建其图形表示
            if (rightItem) {
              if (rightItem.type === "numeric" && rightItem.value) {
                // 数字分数 - 使用分数线代替斜杠
                const [numerator, denominator] = rightItem.value.split('/')
                
                // 创建分子
                const numeratorText = this.add.text(0, -12, numerator, { 
                  font: '18px Arial', 
                  color: '#000000',
                  align: 'center'
                }).setOrigin(0.5)
                
                // 创建分数线
                const line = this.add.rectangle(0, 0, 20, 2, 0x000000)
                
                // 创建分母
                const denominatorText = this.add.text(0, 12, denominator, { 
                  font: '18px Arial', 
                  color: '#000000',
                  align: 'center'
                }).setOrigin(0.5)
                
                // 添加到容器
                rightFractionContainer.add([numeratorText, line, denominatorText])
              } else if (rightItem.type === "block" && rightItem.parts) {
                // 方块分数
                const blockWidth = 60 / rightItem.parts
                const blockHeight = 60
                const startX = -(blockWidth * rightItem.parts) / 2 + blockWidth / 2
                
                for (let i = 0; i < rightItem.parts; i++) {
                  const block = this.add.rectangle(
                    startX + i * blockWidth, 
                    0, 
                    blockWidth - 2, 
                    blockHeight - 2, 
                    i < rightItem.filled ? this.getColorFromTailwind(rightItem.color) : 0xffffff
                  )
                  block.setStrokeStyle(1, 0x000000)
                  rightFractionContainer.add(block)
                }
              } else if (rightItem.type === "circle" && rightItem.percentage) {
                // 圆形分数
                const circle = this.add.circle(0, 0, 30, 0xffffff)
                circle.setStrokeStyle(1, 0x000000)
                rightFractionContainer.add(circle)
                
                // 创建扇形填充
                const pie = this.add.graphics()
                pie.fillStyle(this.getColorFromTailwind(rightItem.color), 1)
                pie.slice(0, 0, 30, 0, (rightItem.percentage / 100) * Math.PI * 2, true)
                pie.fillPath()
                rightFractionContainer.add(pie)
              }
            }
          }
          
          // 初始更新内容
          updateBoxContents()
          
          let dragTarget: Phaser.GameObjects.Rectangle | null = null
          
          // 触摸/鼠标按下事件
          this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, targets: Phaser.GameObjects.GameObject[]) => {
            if (targets.length > 0) {
              const target = targets[0] as Phaser.GameObjects.Rectangle
              if (target === leftBox || target === rightBox) {
                dragTarget = target
                target.setTint(0xaaaaaa)
              }
            }
          })

          // 触摸/鼠标移动事件
          this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (dragTarget && pointer.isDown) {
              dragTarget.x = pointer.x
              dragTarget.y = pointer.y
            }
          })

          // 触摸/鼠标松开事件
          this.input.on('pointerup', () => {
            if (dragTarget) {
              dragTarget.clearTint()
              const dropZone = dragTarget === leftBox ? onLeftDrop : onRightDrop
              const item = dragTarget === leftBox ? leftItem : rightItem
              dropZone(item)
              updateLines()
              dragTarget = null
            }
          })

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
          
          // 监听外部更新
          this.events.on('update-contents', updateBoxContents)
          
          // 当有新的物品放入时更新动画
          this.events.on('update-balance', () => {
            // 更新容器位置到盒子中心
            const leftBoxPos = leftBox.getCenter()
            const rightBoxPos = rightBox.getCenter()
            leftFractionContainer.setPosition(leftBoxPos.x, leftBoxPos.y)
            rightFractionContainer.setPosition(rightBoxPos.x, rightBoxPos.y)
            
            this.tweens.add({
              targets: beam,
              angle: leftItem && !rightItem ? -5 : rightItem && !leftItem ? 5 : 0,
              duration: 500,
              ease: 'Power2',
              onUpdate: () => {
                updateLines()
                
                // 在每一帧更新时确保分数图形保持在盒子中心
                const leftBoxPos = leftBox.getCenter()
                const rightBoxPos = rightBox.getCenter()
                leftFractionContainer.setPosition(leftBoxPos.x, leftBoxPos.y)
                rightFractionContainer.setPosition(rightBoxPos.x, rightBoxPos.y)
              },
              onComplete: () => {
                // 动画完成后再次确保分数图形在盒子中心
                const leftBoxPos = leftBox.getCenter()
                const rightBoxPos = rightBox.getCenter()
                leftFractionContainer.setPosition(leftBoxPos.x, leftBoxPos.y)
                rightFractionContainer.setPosition(rightBoxPos.x, rightBoxPos.y)
                
                updateBoxContents()
              }
            })
          })
        }
      }
    }

    // 创建游戏实例
    gameRef.current = new Phaser.Game(config)

    // 添加自定义事件监听器
    const handleCustomDrop = (event: CustomEvent) => {
      const { data, side } = event.detail
      if (side === 'left') {
        onLeftDrop(data)
      } else {
        onRightDrop(data)
      }
    }

    // 存储当前拖拽的数据
    let currentDragData: any = null

    // 添加拖拽数据存储和获取的事件处理
    const handleDragStart = (e: DragEvent) => {
      try {
        currentDragData = JSON.parse(e.dataTransfer.getData('text/plain'))
      } catch (err) {
        console.error('Failed to parse drag data:', err)
      }
    }

    const handleGetDragData = (e: CustomEvent) => {
      if (e.detail && e.detail.callback && typeof e.detail.callback === 'function') {
        e.detail.callback(currentDragData)
        currentDragData = null
      }
    }

    parentRef.current.addEventListener('custom-drop', handleCustomDrop as EventListener)
    window.addEventListener('dragstart', handleDragStart)
    window.addEventListener('get-drag-data', handleGetDragData as EventListener)

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
      }
      parentRef.current?.removeEventListener('custom-drop', handleCustomDrop as EventListener)
      window.removeEventListener('dragstart', handleDragStart)
      window.removeEventListener('get-drag-data', handleGetDragData as EventListener)
    }
  }, [leftItem, rightItem])

  useEffect(() => {
    // 当leftItem或rightItem变化时，通知Phaser场景更新
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('default');
      if (scene) {
        scene.events.emit('update-contents');
        scene.events.emit('update-balance');
      }
    }
  }, [leftItem, rightItem]);

  return (
    <div 
      ref={parentRef} 
      className="w-full h-[300px] phaser-balance"
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }}
      onDrop={(e) => {
        e.preventDefault()
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'))
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          
          if (x < rect.width / 2) {
            onLeftDrop(data)
          } else {
            onRightDrop(data)
          }
          
          // 触发自定义事件，通知分数网格移除该项
          window.dispatchEvent(new CustomEvent('balance-drop'))
        } catch (err) {
          console.error('Error handling drop:', err)
        }
      }}
    />
  )
} 