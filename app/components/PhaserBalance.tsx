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

    // 添加全局倾斜事件监听器
    const handleGlobalTiltEvent = (event: any) => {
      console.log('Global tilt event received in useEffect:', event.detail);
      if (event.detail && typeof event.detail.angle === 'number') {
        if (gameRef.current) {
          const scene = gameRef.current.scene.getScene('default');
          if (scene) {
            scene.events.emit('tilt-balance', event.detail.angle);
          }
        }
      }
    };

    // 添加全局事件监听器
    window.addEventListener('global-tilt-balance', handleGlobalTiltEvent);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: parentRef.current,
      width: 500,
      height: 300,
      backgroundColor: '#000000',
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
          
          // 监听canvas上的phaser-tilt事件
          const canvas = this.sys.game.canvas;
          if (canvas) {
            canvas.addEventListener('phaser-tilt', (event: any) => {
              console.log('Received phaser-tilt event on canvas:', event.detail);
              if (event.detail && typeof event.detail.angle === 'number') {
                this.events.emit('tilt-balance', event.detail.angle);
              }
            });
          }
          
          // 创建底座
          this.add.rectangle(250, 280, 200, 20, 0xffffff)
          
          // 创建支柱
          this.add.rectangle(250, 182.5, 20, 215, 0xffffff)
          
          // 创建支柱尖头
          const pillarTip = this.add.triangle(250, 65, 0, 20, 10, 0, 20, 20, 0xffffff)
          
          // 创建横梁组
          const beam = this.add.container(250, 100)
          
          // 创建横梁主体
          const beamRect = this.add.rectangle(0, 0, 400, 10, 0xffffff)
          
          // 暴露横梁对象以便直接操作
          if (typeof window !== 'undefined') {
            (window as any).phaserBalanceBeam = beam;
            
            // 添加直接倾斜方法
            (window as any).directTiltBalance = (angle: number) => {
              console.log('Direct beam tilt called with angle:', angle);
              // 直接设置角度
              beam.angle = angle;
              // 更新吊线
              updateLines();
            };
          }
          
          // 创建左盒子
          const leftBox = this.add.rectangle(60, 152, 78, 78, 0x000000)
          leftBox.setStrokeStyle(4, 0xffffff)
          
          // 创建右盒子
          const rightBox = this.add.rectangle(440, 152, 78, 78, 0x000000)
          rightBox.setStrokeStyle(4, 0xffffff)
          
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
            leftLine.lineStyle(2, 0xffffff)
            leftLine.beginPath()
            leftLine.moveTo(leftWorldPoint.x, leftWorldPoint.y)
            leftLine.lineTo(leftWorldPoint.x, leftWorldPoint.y + (52 - boxHalfHeight) * 2) // 延长吊线为原来的两倍
            leftLine.strokePath()
            
            rightLine.clear()
            rightLine.lineStyle(2, 0xffffff)
            rightLine.beginPath()
            rightLine.moveTo(rightWorldPoint.x, rightWorldPoint.y)
            rightLine.lineTo(rightWorldPoint.x, rightWorldPoint.y + (52 - boxHalfHeight) * 2) // 延长吊线为原来的两倍
            rightLine.strokePath()
            
            // 更新盒子位置 - 根据延长的吊线调整位置
            leftBox.setPosition(leftWorldPoint.x, leftWorldPoint.y + (52 - boxHalfHeight) * 2 + boxHalfHeight)
            rightBox.setPosition(rightWorldPoint.x, rightWorldPoint.y + (52 - boxHalfHeight) * 2 + boxHalfHeight)
            
            // 确保盒子轮廓线为白色
            leftBox.setStrokeStyle(4, 0xffffff)
            rightBox.setStrokeStyle(4, 0xffffff)
            
            // 更新分数容器位置到盒子中心 - 根据延长的吊线调整位置
            leftFractionContainer.setPosition(leftWorldPoint.x, leftWorldPoint.y + (52 - boxHalfHeight) * 2 + boxHalfHeight)
            rightFractionContainer.setPosition(rightWorldPoint.x, rightWorldPoint.y + (52 - boxHalfHeight) * 2 + boxHalfHeight)
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
                  color: '#ffffff',
                  align: 'center'
                }).setOrigin(0.5)
                
                // 创建分数线
                const line = this.add.rectangle(0, 0, 20, 2, 0xffffff)
                line.setStrokeStyle(2, 0xffffff)  // 添加白色轮廓线
                
                // 创建分母
                const denominatorText = this.add.text(0, 12, denominator, { 
                  font: '18px Arial', 
                  color: '#ffffff',
                  align: 'center'
                }).setOrigin(0.5)
                
                // 添加到容器
                leftFractionContainer.add([numeratorText, line, denominatorText])
              } else if (leftItem.type === "block") {
                // 方块分数
                const blockWidth = 60 / leftItem.parts
                const blockHeight = 60
                
                // 判断是否应该垂直排列（f3和f10）
                const isVertical = leftItem.id === "f3" || leftItem.id === "f10"
                
                if (isVertical) {
                  // 垂直排列
                  const blockWidth = 60
                  const blockHeight = 60 / leftItem.parts
                  const startY = -(blockHeight * leftItem.parts) / 2 + blockHeight / 2
                  
                  for (let i = 0; i < leftItem.parts; i++) {
                    const block = this.add.rectangle(
                      0, 
                      startY + i * blockHeight, 
                      blockWidth - 2, 
                      blockHeight - 2, 
                      i < leftItem.filled ? this.getColorFromTailwind(leftItem.color) : 0x000000
                    )
                    block.setStrokeStyle(2, 0xffffff)
                    leftFractionContainer.add(block)
                  }
                } else {
                  // 水平排列
                  const startX = -(blockWidth * leftItem.parts) / 2 + blockWidth / 2
                  
                  for (let i = 0; i < leftItem.parts; i++) {
                    const block = this.add.rectangle(
                      startX + i * blockWidth, 
                      0, 
                      blockWidth - 2, 
                      blockHeight - 2, 
                      i < leftItem.filled ? this.getColorFromTailwind(leftItem.color) : 0x000000
                    )
                    block.setStrokeStyle(2, 0xffffff)
                    leftFractionContainer.add(block)
                  }
                }
              } else if (leftItem.type === "circle") {
                // 圆形分数
                const circle = this.add.circle(0, 0, 30, 0x000000)
                circle.setStrokeStyle(2, 0xffffff)
                leftFractionContainer.add(circle)
                
                // 创建扇形填充
                const pie = this.add.graphics()
                pie.lineStyle(2, 0xffffff)  // 添加白色轮廓线
                pie.fillStyle(this.getColorFromTailwind(leftItem.color), 1)
                pie.slice(0, 0, 30, 0, (leftItem.percentage / 100) * Math.PI * 2, true)
                pie.fillPath()
                pie.strokePath()  // 描边路径
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
                  color: '#ffffff',
                  align: 'center'
                }).setOrigin(0.5)
                
                // 创建分数线
                const line = this.add.rectangle(0, 0, 20, 2, 0xffffff)
                line.setStrokeStyle(2, 0xffffff)  // 添加白色轮廓线
                
                // 创建分母
                const denominatorText = this.add.text(0, 12, denominator, { 
                  font: '18px Arial', 
                  color: '#ffffff',
                  align: 'center'
                }).setOrigin(0.5)
                
                // 添加到容器
                rightFractionContainer.add([numeratorText, line, denominatorText])
              } else if (rightItem.type === "block") {
                // 方块分数
                const blockWidth = 60 / rightItem.parts
                const blockHeight = 60
                
                // 判断是否应该垂直排列（f3和f10）
                const isVertical = rightItem.id === "f3" || rightItem.id === "f10"
                
                if (isVertical) {
                  // 垂直排列
                  const blockWidth = 60
                  const blockHeight = 60 / rightItem.parts
                  const startY = -(blockHeight * rightItem.parts) / 2 + blockHeight / 2
                  
                  for (let i = 0; i < rightItem.parts; i++) {
                    const block = this.add.rectangle(
                      0, 
                      startY + i * blockHeight, 
                      blockWidth - 2, 
                      blockHeight - 2, 
                      i < rightItem.filled ? this.getColorFromTailwind(rightItem.color) : 0x000000
                    )
                    block.setStrokeStyle(2, 0xffffff)
                    rightFractionContainer.add(block)
                  }
                } else {
                  // 水平排列
                  const startX = -(blockWidth * rightItem.parts) / 2 + blockWidth / 2
                  
                  for (let i = 0; i < rightItem.parts; i++) {
                    const block = this.add.rectangle(
                      startX + i * blockWidth, 
                      0, 
                      blockWidth - 2, 
                      blockHeight - 2, 
                      i < rightItem.filled ? this.getColorFromTailwind(rightItem.color) : 0x000000
                    )
                    block.setStrokeStyle(2, 0xffffff)
                    rightFractionContainer.add(block)
                  }
                }
              } else if (rightItem.type === "circle") {
                // 圆形分数
                const circle = this.add.circle(0, 0, 30, 0x000000)
                circle.setStrokeStyle(2, 0xffffff)
                rightFractionContainer.add(circle)
                
                // 创建扇形填充
                const pie = this.add.graphics()
                pie.lineStyle(2, 0xffffff)  // 添加白色轮廓线
                pie.fillStyle(this.getColorFromTailwind(rightItem.color), 1)
                pie.slice(0, 0, 30, 0, (rightItem.percentage / 100) * Math.PI * 2, true)
                pie.fillPath()
                pie.strokePath()  // 描边路径
                rightFractionContainer.add(pie)
              }
            }
            
            // 确保所有元素的轮廓线为白色
            leftBox.setStrokeStyle(4, 0xffffff)
            rightBox.setStrokeStyle(4, 0xffffff)
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
                // 移除色调变化，保持白色轮廓
                // target.setTint(0xaaaaaa)
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
              // 确保清除任何可能的色调
              dragTarget.clearTint()
              // 重新设置轮廓线为白色
              dragTarget.setStrokeStyle(4, 0xffffff)
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
            angle: leftItem && !rightItem ? -1.7 : rightItem && !leftItem ? 1.7 : 0,
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
          
          // 监听倾斜事件
          this.events.on('tilt-balance', (angle: number | any) => {
            console.log('Received tilt-balance event with angle:', angle);
            
            // 处理不同类型的输入
            let targetAngle = 0;
            if (typeof angle === 'number') {
              targetAngle = angle;
            } else if (angle && typeof angle.angle === 'number') {
              targetAngle = angle.angle;
            } else if (angle && typeof angle.detail === 'object' && typeof angle.detail.angle === 'number') {
              targetAngle = angle.detail.angle;
            }
            
            console.log('Using target angle for tilt:', targetAngle);
            
            // 添加倾斜动画
            this.tweens.add({
              targets: beam,
              angle: targetAngle,
              duration: 1000,
              ease: 'Power2',
              onUpdate: () => {
                updateLines()
              },
              onComplete: () => {
                console.log('Tilt animation completed with angle:', targetAngle);
              }
            })
          })
          
          // 监听重置事件
          this.events.on('reset-balance', () => {
            console.log('Received reset-balance event');
            // 重置天平到初始状态
            this.tweens.add({
              targets: beam,
              angle: 0,
              duration: 500,
              ease: 'Power2',
              onUpdate: () => {
                updateLines()
              }
            })
          })
          
          // 当有新的物品放入时更新动画
          this.events.on('update-balance', () => {
            // 更新容器位置到盒子中心
            const leftBoxPos = leftBox.getCenter()
            const rightBoxPos = rightBox.getCenter()
            leftFractionContainer.setPosition(leftBoxPos.x, leftBoxPos.y)
            rightFractionContainer.setPosition(rightBoxPos.x, rightBoxPos.y)
            
            // 确保两个盒子的轮廓线为白色
            leftBox.setStrokeStyle(4, 0xffffff)
            rightBox.setStrokeStyle(4, 0xffffff)
            
            // 计算分数的数值函数
            const getFractionValue = (item: any): number => {
              if (!item) return 0;
              
              if (item.type === "numeric" && item.value) {
                const [num, den] = item.value.split('/').map(Number);
                return num / den;
              } else if (item.type === "block" && item.parts) {
                return item.filled / item.parts;
              } else if (item.type === "circle" && item.percentage) {
                return item.percentage / 100;
              }
              return 0;
            };
            
            // 确定天平倾斜方向
            let targetAngle = 0;
            
            if (leftItem && rightItem) {
              // 当两边都有物品时，比较大小决定倾斜方向
              const leftValue = getFractionValue(leftItem);
              const rightValue = getFractionValue(rightItem);
              
              if (Math.abs(leftValue - rightValue) < 0.01) {
                // 数值几乎相等，保持平衡
                targetAngle = 0;
              } else if (leftValue > rightValue) {
                // 左边更大，向左倾斜
                targetAngle = -1.7;
              } else {
                // 右边更大，向右倾斜
                targetAngle = 1.7;
              }
            } else if (leftItem && !rightItem) {
              // 只有左边有物品
              targetAngle = -1.7;
            } else if (!leftItem && rightItem) {
              // 只有右边有物品
              targetAngle = 1.7;
            } else {
              // 两边都没有物品
              targetAngle = 0;
            }
            
            this.tweens.add({
              targets: beam,
              angle: targetAngle,
              duration: 500,
              ease: 'Power2',
              onUpdate: () => {
                updateLines()
                
                // 在每一帧更新时确保分数图形保持在盒子中心
                const leftBoxPos = leftBox.getCenter()
                const rightBoxPos = rightBox.getCenter()
                leftFractionContainer.setPosition(leftBoxPos.x, leftBoxPos.y)
                rightFractionContainer.setPosition(rightBoxPos.x, rightBoxPos.y)
                
                // 确保盒子轮廓线为白色
                leftBox.setStrokeStyle(4, 0xffffff)
                rightBox.setStrokeStyle(4, 0xffffff)
                
                // 重新遍历所有fraction container子元素，确保它们的轮廓线为白色
                try {
                  leftFractionContainer.each((child: any) => {
                    try {
                      if (child && child.setStrokeStyle) {
                        child.setStrokeStyle(2, 0xffffff);
                      }
                    } catch (err) {
                      console.error('Error updating left fraction child stroke style:', err);
                    }
                  });
                  
                  rightFractionContainer.each((child: any) => {
                    try {
                      if (child && child.setStrokeStyle) {
                        child.setStrokeStyle(2, 0xffffff);
                      }
                    } catch (err) {
                      console.error('Error updating right fraction child stroke style:', err);
                    }
                  });
                } catch (err) {
                  console.error('Error updating fraction container children:', err);
                }
              },
              onComplete: () => {
                // 动画完成后再次确保分数图形在盒子中心
                const leftBoxPos = leftBox.getCenter()
                const rightBoxPos = rightBox.getCenter()
                leftFractionContainer.setPosition(leftBoxPos.x, leftBoxPos.y)
                rightFractionContainer.setPosition(rightBoxPos.x, rightBoxPos.y)
                
                // 确保两个盒子的轮廓线为白色
                leftBox.setStrokeStyle(4, 0xffffff)
                rightBox.setStrokeStyle(4, 0xffffff)
                
                // 重新遍历所有fraction container子元素，确保它们的轮廓线为白色
                try {
                  leftFractionContainer.each((child: any) => {
                    try {
                      if (child && child.setStrokeStyle) {
                        child.setStrokeStyle(2, 0xffffff);
                      }
                    } catch (err) {
                      console.error('Error updating left fraction child stroke style:', err);
                    }
                  });
                  
                  rightFractionContainer.each((child: any) => {
                    try {
                      if (child && child.setStrokeStyle) {
                        child.setStrokeStyle(2, 0xffffff);
                      }
                    } catch (err) {
                      console.error('Error updating right fraction child stroke style:', err);
                    }
                  });
                } catch (err) {
                  console.error('Error updating fraction container children:', err);
                }
                
                updateBoxContents()
              }
            })
          })
        }
      }
    }

    // 创建游戏实例
    gameRef.current = new Phaser.Game(config)

    // 暴露游戏实例给父组件
    if (typeof window !== 'undefined') {
      (window as any).phaserBalanceGame = gameRef.current;
      
      // 添加直接触发倾斜的方法
      (window as any).tiltPhaserBalance = function(angle: number) {
        console.log('Direct tilt called with angle:', angle);
        if (gameRef.current) {
          const scene = gameRef.current.scene.getScene('default');
          if (scene) {
            scene.events.emit('tilt-balance', angle);
          }
        }
      };
    }

    // 添加自定义事件监听器
    const handleCustomDrop = (event: CustomEvent) => {
      const { data, side } = event.detail
      if (side === 'left') {
        onLeftDrop(data)
      } else {
        onRightDrop(data)
      }
    }

    // 添加全局倾斜事件监听
    const handleGlobalTilt = (event: CustomEvent) => {
      console.log('Received global tilt event:', event.detail);
      if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('default');
        if (scene) {
          scene.events.emit('tilt-balance', event.detail.angle);
        }
      }
    };
    
    // 添加游戏重置事件监听
    const handleGameReset = (event: CustomEvent) => {
      console.log('Received game reset event');
      if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('default');
        if (scene) {
          // 重置天平到初始状态
          scene.events.emit('tilt-balance', 0);
          scene.events.emit('reset-balance');
          
          // 清空左右两侧的内容
          if (typeof onLeftDrop === 'function') {
            onLeftDrop(null);
          }
          if (typeof onRightDrop === 'function') {
            onRightDrop(null);
          }
        }
      }
    };

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
    window.addEventListener('global-tilt-balance', handleGlobalTilt as EventListener)
    window.addEventListener('reset-game', handleGameReset as EventListener)

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
      }
      parentRef.current?.removeEventListener('custom-drop', handleCustomDrop as EventListener)
      window.removeEventListener('dragstart', handleDragStart)
      window.removeEventListener('get-drag-data', handleGetDragData as EventListener)
      window.removeEventListener('global-tilt-balance', handleGlobalTilt as EventListener)
      window.removeEventListener('global-tilt-balance', handleGlobalTiltEvent)
      window.removeEventListener('reset-game', handleGameReset as EventListener)
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