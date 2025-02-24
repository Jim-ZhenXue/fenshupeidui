"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import FractionGrid from "./fraction-grid"
import FractionDisplay from "./fraction-display"
import Balance from "./balance"

export default function FractionMatcher() {
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [currentFraction, setCurrentFraction] = useState({ numerator: 1, denominator: 4 })
  const [leftBalance, setLeftBalance] = useState<any>(null)
  const [rightBalance, setRightBalance] = useState<any>(null)

  const handleDrop = (side: "left" | "right", item: any) => {
    if (side === "left") {
      setLeftBalance(item)
    } else {
      setRightBalance(item)
    }

    // 如果两边都有值，进行比较
    if ((side === "left" && rightBalance) || (side === "right" && leftBalance)) {
      setTimeout(() => {
        // 这里添加比较逻辑
        const isMatch = true // 实际应该比较两个分数是否相等
        if (isMatch) {
          setScore(score + 1)
        }
        // 重置天平
        setLeftBalance(null)
        setRightBalance(null)
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="w-[800px] mx-auto">
        <div className="mb-4 flex items-center justify-between text-white">
          <div className="text-xl font-bold">配对</div>
          <div className="text-lg font-semibold absolute left-1/2 -translate-x-1/2">Score: {score}</div>
          <div className="w-8 h-8 flex items-center justify-center">
            <RefreshCw className="h-4 w-4 text-white" />
          </div>
        </div>

        <div className="mb-8 flex justify-center">
          <FractionDisplay numerator={currentFraction.numerator} denominator={currentFraction.denominator} />
        </div>

        <div className="flex justify-center mb-8">
          <Balance
            leftItem={leftBalance}
            rightItem={rightBalance}
            onLeftDrop={(item) => handleDrop("left", item)}
            onRightDrop={(item) => handleDrop("right", item)}
          />
        </div>

        <div className="flex justify-center">
          <FractionGrid onMatch={(matched) => setScore(score + 1)} />
        </div>
      </div>
    </div>
  )
}

