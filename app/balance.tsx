"use client"

import type React from "react"
import { useState } from "react"
import dynamic from 'next/dynamic'

const PhaserBalance = dynamic(() => import('./components/PhaserBalance'), { ssr: false })

interface BalanceProps {
  leftItem: any
  rightItem: any
  onLeftDrop: (item: any) => void
  onRightDrop: (item: any) => void
}

export default function Balance({ leftItem, rightItem, onLeftDrop, onRightDrop }: BalanceProps) {
  return (
    <div className="w-full bg-black">
      <PhaserBalance
        leftItem={leftItem}
        rightItem={rightItem}
        onLeftDrop={onLeftDrop}
        onRightDrop={onRightDrop}
      />
    </div>
  )
}
