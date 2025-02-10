"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xl font-bold">My Matches</div>
          <div className="text-right">
            <div className="text-lg font-semibold">Level: {level}</div>
            <div className="text-lg font-semibold">Score: {score}</div>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-8">
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

        <FractionGrid onMatch={(matched) => setScore(score + 1)} />
      </div>
    </div>
  )
}

