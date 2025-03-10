"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import FractionGrid from "./fraction-grid"
import Balance from "./balance"
import { playSound, initSounds, SoundType } from "./utils/sounds"

export default function FractionMatcher() {
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [leftBalance, setLeftBalance] = useState<any>(null)
  const [rightBalance, setRightBalance] = useState<any>(null)
  const [showCheckButton, setShowCheckButton] = useState(false)
  const [checkButtonFlashing, setCheckButtonFlashing] = useState(false)
  const [correctPairs, setCorrectPairs] = useState<any[]>([])
  const [feedback, setFeedback] = useState<{ message: string, isSuccess: boolean } | null>(null)
  const [isCorrectMatch, setIsCorrectMatch] = useState(false)
  const [showTryAgainButton, setShowTryAgainButton] = useState(false)
  const flashingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const gameRef = useRef<any>(null)
  
  // 初始化音效系统
  useEffect(() => {
    // 预加载所有音效
    initSounds();
  }, []);

  // 获取Phaser游戏实例
  useEffect(() => {
    // 等待Phaser游戏实例创建完成
    const checkGameInstance = () => {
      if (typeof window !== 'undefined' && (window as any).phaserBalanceGame) {
        gameRef.current = (window as any).phaserBalanceGame;
      } else {
        setTimeout(checkGameInstance, 100);
      }
    };
    
    checkGameInstance();
    
    return () => {
      gameRef.current = null;
    };
  }, []);

  // 计算分数的实际值
  const getFractionValue = (fraction: any): number => {
    if (fraction.type === "numeric") {
      const [num, den] = fraction.value.split("/").map(Number)
      return num / den
    }
    if (fraction.type === "block") {
      return fraction.filled / fraction.parts
    }
    if (fraction.type === "circle") {
      return fraction.percentage / 100
    }
    return 0
  }

  // 检查两个分数是否相等的函数
  const areFractionsEqual = (fraction1: any, fraction2: any) => {
    // 对于数字类型的分数
    if (fraction1.type === "numeric" && fraction2.type === "numeric") {
      const [num1, den1] = fraction1.value.split("/").map(Number)
      const [num2, den2] = fraction2.value.split("/").map(Number)
      return (num1 / den1) === (num2 / den2)
    }
    
    // 对于块状分数
    if (fraction1.type === "block" && fraction2.type === "block") {
      const ratio1 = fraction1.filled / fraction1.parts
      const ratio2 = fraction2.filled / fraction2.parts
      return Math.abs(ratio1 - ratio2) < 0.01 // 允许小误差
    }
    
    // 对于圆形分数
    if (fraction1.type === "circle" && fraction2.type === "circle") {
      return Math.abs(fraction1.percentage - fraction2.percentage) < 1 // 允许1%的误差
    }
    
    // 不同类型分数之间的比较
    if (fraction1.type === "numeric" && fraction2.type === "block") {
      const [num, den] = fraction1.value.split("/").map(Number)
      const ratio = fraction2.filled / fraction2.parts
      return Math.abs(num/den - ratio) < 0.01
    }
    
    if (fraction1.type === "block" && fraction2.type === "numeric") {
      const [num, den] = fraction2.value.split("/").map(Number)
      const ratio = fraction1.filled / fraction1.parts
      return Math.abs(num/den - ratio) < 0.01
    }
    
    if (fraction1.type === "numeric" && fraction2.type === "circle") {
      const [num, den] = fraction1.value.split("/").map(Number)
      return Math.abs(num/den - fraction2.percentage/100) < 0.01
    }
    
    if (fraction1.type === "circle" && fraction2.type === "numeric") {
      const [num, den] = fraction2.value.split("/").map(Number)
      return Math.abs(num/den - fraction1.percentage/100) < 0.01
    }
    
    if (fraction1.type === "block" && fraction2.type === "circle") {
      const ratio = fraction1.filled / fraction1.parts
      return Math.abs(ratio - fraction2.percentage/100) < 0.01
    }
    
    if (fraction1.type === "circle" && fraction2.type === "block") {
      const ratio = fraction2.filled / fraction2.parts
      return Math.abs(ratio - fraction1.percentage/100) < 0.01
    }
    
    return false
  }

  const handleDrop = (side: "left" | "right", item: any) => {
    // 播放放置音效
    playSound('drop');
    
    // 检查该侧天平是否已有物品，若有则需要将其放回原位
    const existingItem = side === "left" ? leftBalance : rightBalance;
    
    if (existingItem && existingItem.originalIndex !== undefined) {
      // 触发自定义事件，通知分数网格将原物品放回原位
      window.dispatchEvent(new CustomEvent('balance-reset', {
        detail: {
          leftItem: side === "left" ? existingItem : null,
          rightItem: side === "right" ? existingItem : null
        }
      }));
    }
    
    // 保留原始位置信息
    if (side === "left") {
      setLeftBalance(item)
    } else {
      setRightBalance(item)
    }
  }
  
  // 处理检查按钮点击
  const handleCheckClick = () => {
    // 播放点击音效
    playSound('click');
    
    if (leftBalance && rightBalance) {
      // 在比较时忽略originalIndex
      const leftCompare = {...leftBalance}
      const rightCompare = {...rightBalance}
      delete leftCompare.originalIndex
      delete rightCompare.originalIndex
      
      const isEqual = areFractionsEqual(leftCompare, rightCompare)
      
      if (isEqual) {
        // 播放正确音效
        playSound('correct');
        
        // 设置为正确匹配，但还不添加到列表
        setIsCorrectMatch(true)
        setFeedback({ message: "😊", isSuccess: true })
      } else {
        // 播放错误音效
        playSound('incorrect');
        
        // 显示失败反馈，但不立即重置天平
        setFeedback({ message: "再试一次", isSuccess: false })
        
        // 计算两边的实际值
        const leftValue = getFractionValue(leftBalance)
        const rightValue = getFractionValue(rightBalance)
        
        // 触发天平倾斜动画 - 尝试多种方式确保成功
        // 1. 通过游戏实例直接触发
        if (gameRef.current) {
          const scene = gameRef.current.scene.getScene('default')
          if (scene) {
            // 根据大小关系设置倾斜角度（-5表示左倾，5表示右倾）
            const targetAngle = leftValue > rightValue ? -5 : 5
            scene.events.emit('tilt-balance', targetAngle)
            console.log('Emitting tilt-balance event with angle:', targetAngle);
          } else {
            console.log('Scene not found');
          }
        } else {
          console.log('Game reference not found');
        }
        
        // 2. 尝试使用直接方法
        if (typeof window !== 'undefined' && 
            (window as any).tiltPhaserBalance && 
            typeof (window as any).tiltPhaserBalance === 'function') {
          const targetAngle = leftValue > rightValue ? -5 : 5
          try {
            (window as any).tiltPhaserBalance(targetAngle);
            console.log('Using direct tilt method with angle:', targetAngle);
          } catch (error) {
            console.error('Error using direct tilt method:', error);
          }
        }
        
        // 3. 尝试使用全局事件
        if (typeof window !== 'undefined') {
          const targetAngle = leftValue > rightValue ? -5 : 5
          window.dispatchEvent(new CustomEvent('global-tilt-balance', {
            detail: { angle: targetAngle }
          }));
          console.log('Dispatched global-tilt-balance event with angle:', targetAngle);
        }
        
        // 4. 尝试直接找到Phaser画布并触发事件
        try {
          const phaserCanvas = document.querySelector('.phaser-balance canvas');
          if (phaserCanvas) {
            const targetAngle = leftValue > rightValue ? -5 : 5;
            const event = new CustomEvent('phaser-tilt', {
              detail: { angle: targetAngle }
            });
            phaserCanvas.dispatchEvent(event);
            console.log('Dispatched phaser-tilt event directly to canvas');
          }
        } catch (error) {
          console.error('Error dispatching event to canvas:', error);
        }
        
        // 5. 尝试直接操作横梁
        try {
          if (typeof window !== 'undefined' && (window as any).directTiltBalance && 
              typeof (window as any).directTiltBalance === 'function') {
            const targetAngle = leftValue > rightValue ? -5 : 5;
            (window as any).directTiltBalance(targetAngle);
            console.log('Used direct beam tilt method with angle:', targetAngle);
          }
        } catch (error) {
          console.error('Error using direct beam tilt method:', error);
        }
        
        // 隐藏检查按钮，显示"再试一次"按钮
        setShowCheckButton(false)
        setShowTryAgainButton(true)
      }
      
      if (flashingIntervalRef.current) {
        clearInterval(flashingIntervalRef.current)
        flashingIntervalRef.current = null
      }
    }
  }
  
  // 处理"再试一次"按钮点击
  const handleTryAgainClick = () => {
    // 播放"再试一次"音效
    playSound('tryAgain');
    
    // 重置天平倾斜 - 尝试多种方式确保成功
    // 1. 通过游戏实例直接触发
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('default')
      if (scene) {
        scene.events.emit('tilt-balance', 0)  // 重置为水平
      }
    }
    
    // 2. 尝试使用直接方法
    if (typeof window !== 'undefined' && 
        (window as any).tiltPhaserBalance && 
        typeof (window as any).tiltPhaserBalance === 'function') {
      try {
        (window as any).tiltPhaserBalance(0);
        console.log('Using direct tilt method to reset balance');
      } catch (error) {
        console.error('Error using direct tilt method to reset:', error);
      }
    }
    
    // 3. 尝试使用全局事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('global-tilt-balance', {
        detail: { angle: 0 }
      }));
      console.log('Dispatched global-tilt-balance event to reset balance');
    }
    
    // 4. 尝试直接找到Phaser画布并触发事件
    try {
      const phaserCanvas = document.querySelector('.phaser-balance canvas');
      if (phaserCanvas) {
        const event = new CustomEvent('phaser-tilt', {
          detail: { angle: 0 }
        });
        phaserCanvas.dispatchEvent(event);
        console.log('Dispatched phaser-tilt event directly to canvas to reset');
      }
    } catch (error) {
      console.error('Error dispatching event to canvas for reset:', error);
    }
    
    // 5. 尝试直接操作横梁
    try {
      if (typeof window !== 'undefined' && (window as any).directTiltBalance && 
          typeof (window as any).directTiltBalance === 'function') {
        (window as any).directTiltBalance(0);
        console.log('Used direct beam tilt method to reset');
      }
    } catch (error) {
      console.error('Error using direct beam tilt method for reset:', error);
    }
    
    // 重置天平
    setLeftBalance(null)
    setRightBalance(null)
    
    // 隐藏"再试一次"按钮
    setShowTryAgainButton(false)
    
    // 清除反馈消息
    setFeedback(null)
    
    // 触发自定义事件，通知分数网格将两个分数都放回原位
    window.dispatchEvent(new CustomEvent('balance-reset', {
      detail: {
        leftItem: leftBalance,
        rightItem: rightBalance
      }
    }))
  }
  
  // 处理确认按钮点击
  const handleConfirmClick = () => {
    // 播放点击音效
    playSound('click');
    
    if (isCorrectMatch && leftBalance && rightBalance) {
      // 添加到正确配对列表
      setCorrectPairs(prev => [...prev, { left: leftBalance, right: rightBalance }])
      setScore(score + 1)
      
      // 重置所有状态
      setLeftBalance(null)
      setRightBalance(null)
      setShowCheckButton(false)
      setCheckButtonFlashing(false)
      setFeedback(null)
      setIsCorrectMatch(false)
    }
  }
  
  // 处理重置按钮点击
  const handleResetGame = () => {
    // 播放点击音效
    playSound('click');
    
    // 重置所有状态
    setScore(0);
    setLevel(1);
    setLeftBalance(null);
    setRightBalance(null);
    setShowCheckButton(false);
    setCheckButtonFlashing(false);
    setCorrectPairs([]);
    setFeedback(null);
    setIsCorrectMatch(false);
    setShowTryAgainButton(false);
    
    // 重置天平位置
    try {
      // 1. 通过游戏实例直接触发
      if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('default')
        if (scene) {
          scene.events.emit('tilt-balance', 0)
          console.log('Emitting tilt-balance event to reset');
        }
      }
      
      // 2. 尝试使用直接方法
      if (typeof window !== 'undefined' && 
          (window as any).tiltPhaserBalance && 
          typeof (window as any).tiltPhaserBalance === 'function') {
        (window as any).tiltPhaserBalance(0);
        console.log('Using direct tilt method to reset');
      }
      
      // 3. 尝试使用全局事件
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('global-tilt-balance', {
          detail: { angle: 0 }
        }));
        console.log('Dispatched global-tilt-balance event to reset');
      }
      
      // 4. 尝试直接找到Phaser画布并触发事件
      const phaserCanvas = document.querySelector('.phaser-balance canvas');
      if (phaserCanvas) {
        const event = new CustomEvent('phaser-tilt', {
          detail: { angle: 0 }
        });
        phaserCanvas.dispatchEvent(event);
        console.log('Dispatched phaser-tilt event directly to canvas to reset');
      }
      
      // 5. 尝试直接操作横梁
      if (typeof window !== 'undefined' && (window as any).directTiltBalance && 
          typeof (window as any).directTiltBalance === 'function') {
        (window as any).directTiltBalance(0);
        console.log('Used direct beam tilt method to reset');
      }
      
      // 触发重置事件，通知分数网格将所有物品放回原位
      window.dispatchEvent(new CustomEvent('reset-game', {
        detail: { resetAll: true }
      }));
      
    } catch (error) {
      console.error('Error resetting game:', error);
    }
  }
  
  // 监控天平两侧的状态，决定是否显示检查按钮
  useEffect(() => {
    // 当两侧都有分数时，清除任何"再试一次"消息
    if (leftBalance && rightBalance && feedback && !feedback.isSuccess && !showTryAgainButton) {
      setFeedback(null);
    }
    
    if (leftBalance && rightBalance && !showTryAgainButton) {
      setShowCheckButton(true)
      setCheckButtonFlashing(true)
      
      // 创建闪烁效果
      if (flashingIntervalRef.current) {
        clearInterval(flashingIntervalRef.current)
      }
      
      flashingIntervalRef.current = setInterval(() => {
        setCheckButtonFlashing(prev => !prev)
      }, 500)
    } else if (!showTryAgainButton) {
      setShowCheckButton(false)
      setCheckButtonFlashing(false)
      
      if (flashingIntervalRef.current) {
        clearInterval(flashingIntervalRef.current)
        flashingIntervalRef.current = null
      }
    }
    
    return () => {
      if (flashingIntervalRef.current) {
        clearInterval(flashingIntervalRef.current)
        flashingIntervalRef.current = null
      }
      
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current)
        feedbackTimeoutRef.current = null
      }
    }
  }, [leftBalance, rightBalance, feedback])

  return (
    <div className="h-screen overflow-hidden bg-black p-4">
      <div className="w-[800px] mx-auto flex gap-2">
        {/* 左侧区域 */}
        <div className="w-[150px] flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-xl font-bold text-white">配对</div>
            <div 
              className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-gray-700 rounded-full transition-colors"
              onClick={handleResetGame}
              title="重置游戏"
            >
              <RefreshCw className="h-4 w-4 text-white" />
            </div>
          </div>
          
          {/* 正确配对列表 */}
          <div className="mt-4 w-full">
            <div className="space-y-2">
              {correctPairs.map((pair, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 p-1 rounded">
                  <div className="w-[45%] flex items-center justify-center">
                    <div className="w-1/2 aspect-square">
                      {renderMiniatureFraction(pair.left)}
                    </div>
                  </div>
                  <div className="text-white">=</div>
                  <div className="w-[45%] flex items-center justify-center">
                    <div className="w-1/2 aspect-square">
                      {renderMiniatureFraction(pair.right)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 中间区域 - 天平 */}
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center justify-between w-full px-4 mb-4">
            <div className="text-lg font-semibold text-white">Score: {score}</div>
            
            {/* 检查按钮/笑脸+确认按钮/再试一次按钮/再试一次消息 - 都在同一位置显示 */}
            <div className="flex items-center">
              {feedback && !feedback.isSuccess && !showTryAgainButton ? (
                <div className="text-lg font-semibold text-yellow-400">
                  {feedback.message}
                </div>
              ) : showTryAgainButton ? (
                <div className="flex items-center gap-2">
                  <div className="text-2xl">😢</div>
                  <Button 
                    onClick={handleTryAgainClick}
                    className="bg-yellow-600 hover:bg-yellow-700 transition-all"
                  >
                    再试一次
                  </Button>
                </div>
              ) : showCheckButton ? (
                feedback && feedback.isSuccess ? (
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">😊</div>
                    <Button 
                      onClick={handleConfirmClick}
                      className="bg-blue-600 hover:bg-blue-700 transition-all"
                    >
                      确认
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={handleCheckClick}
                    className={`bg-green-600 hover:bg-green-700 transition-all ${checkButtonFlashing ? 'animate-pulse' : ''}`}
                  >
                    检查
                  </Button>
                )
              ) : null}
            </div>
          </div>
          <Balance
            leftItem={leftBalance}
            rightItem={rightBalance}
            onLeftDrop={(item) => handleDrop("left", item)}
            onRightDrop={(item) => handleDrop("right", item)}
          />
        </div>

        {/* 右侧区域 */}
        <div className="w-[150px] flex flex-col items-center">
          <FractionGrid onMatch={(matched) => setScore(score + 1)} />
        </div>
      </div>
    </div>
  )
}

// 渲染小型分数显示
function renderMiniatureFraction(fraction: any) {
  if (!fraction) return null
  
  if (fraction.type === "numeric") {
    return (
      <div className="flex flex-col items-center">
        <div className="text-xs text-white">{fraction.value.split('/')[0]}</div>
        <div className="w-full h-[1px] bg-white"></div>
        <div className="text-xs text-white">{fraction.value.split('/')[1]}</div>
      </div>
    )
  } else if (fraction.type === "block" && fraction.parts) {
    // 判断是否应该垂直排列（f3和f10）
    const isVertical = fraction.id === "f3" || fraction.id === "f10";
    
    if (isVertical) {
      return (
        <div className="h-full aspect-square grid" style={{ gridTemplateRows: `repeat(${fraction.parts}, 1fr)` }}>
          {Array.from({ length: fraction.parts }).map((_, i) => (
            <div key={i} className={`border border-white ${i < (fraction.filled || 0) ? fraction.color : ""}`} />
          ))}
        </div>
      )
    } else {
      return (
        <div className="h-full aspect-square grid" style={{ gridTemplateColumns: `repeat(${fraction.parts}, 1fr)` }}>
          {Array.from({ length: fraction.parts }).map((_, i) => (
            <div key={i} className={`border border-white ${i < (fraction.filled || 0) ? fraction.color : ""}`} />
          ))}
        </div>
      )
    }
  } else if (fraction.type === "circle") {
    return (
      <div className="h-full aspect-square relative rounded-full border border-white">
        <div
          className={`absolute h-full w-full rounded-full ${fraction.color}`}
          style={{
            clipPath: `polygon(0 0, 100% 0, 100% ${fraction.percentage}%, 0 ${fraction.percentage}%)`,
          }}
        />
      </div>
    )
  }
  
  return null
}
