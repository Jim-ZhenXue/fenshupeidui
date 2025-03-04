"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import FractionGrid from "./fraction-grid"
import Balance from "./balance"

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
  const flashingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    if (side === "left") {
      setLeftBalance(item)
    } else {
      setRightBalance(item)
    }
  }
  
  // 处理检查按钮点击
  const handleCheckClick = () => {
    if (leftBalance && rightBalance) {
      const isEqual = areFractionsEqual(leftBalance, rightBalance)
      
      if (isEqual) {
        // 设置为正确匹配，但还不添加到列表
        setIsCorrectMatch(true)
        setFeedback({ message: "😊", isSuccess: true })
      } else {
        setFeedback({ message: "再试一次", isSuccess: false })
        
        // 重置天平
        setLeftBalance(null)
        setRightBalance(null)
        
        // 设置反馈消失的定时器
        if (feedbackTimeoutRef.current) {
          clearTimeout(feedbackTimeoutRef.current)
        }
        
        feedbackTimeoutRef.current = setTimeout(() => {
          setFeedback(null)
        }, 2000)
      }
      
      if (flashingIntervalRef.current) {
        clearInterval(flashingIntervalRef.current)
        flashingIntervalRef.current = null
      }
    }
  }
  
  // 处理确认按钮点击
  const handleConfirmClick = () => {
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
  
  // 监控天平两侧的状态，决定是否显示检查按钮
  useEffect(() => {
    // 当两侧都有分数时，清除任何"再试一次"消息
    if (leftBalance && rightBalance && feedback && !feedback.isSuccess) {
      setFeedback(null);
    }
    
    if (leftBalance && rightBalance) {
      setShowCheckButton(true)
      setCheckButtonFlashing(true)
      
      // 创建闪烁效果
      if (flashingIntervalRef.current) {
        clearInterval(flashingIntervalRef.current)
      }
      
      flashingIntervalRef.current = setInterval(() => {
        setCheckButtonFlashing(prev => !prev)
      }, 500)
    } else {
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
            <div className="w-8 h-8 flex items-center justify-center">
              <RefreshCw className="h-4 w-4 text-white" />
            </div>
          </div>
          
          {/* 正确配对列表 */}
          <div className="mt-4 w-full">
            <div className="text-sm font-semibold text-white mb-2">正确配对:</div>
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {correctPairs.map((pair, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 p-1 rounded">
                  <div className="w-[45%] h-8 flex items-center justify-center">
                    {renderMiniatureFraction(pair.left)}
                  </div>
                  <div className="text-white">=</div>
                  <div className="w-[45%] h-8 flex items-center justify-center">
                    {renderMiniatureFraction(pair.right)}
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
            
            {/* 检查按钮/笑脸+确认按钮/再试一次消息 - 都在同一位置显示 */}
            <div className="flex items-center">
              {feedback && !feedback.isSuccess ? (
                <div className="text-lg font-semibold text-yellow-400">
                  {feedback.message}
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
    return <div className="text-xs text-white">{fraction.value}</div>
  } else if (fraction.type === "block" && fraction.parts) {
    return (
      <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${fraction.parts}, 1fr)` }}>
        {Array.from({ length: fraction.parts }).map((_, i) => (
          <div key={i} className={`border border-gray-700 ${i < (fraction.filled || 0) ? fraction.color : ""}`} />
        ))}
      </div>
    )
  } else if (fraction.type === "circle") {
    return (
      <div className="relative h-full w-full rounded-full border border-gray-700">
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
