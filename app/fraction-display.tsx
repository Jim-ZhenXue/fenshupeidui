interface FractionDisplayProps {
  numerator: number
  denominator: number
}

export default function FractionDisplay({ numerator, denominator }: FractionDisplayProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-gray-800 p-2">
      <div className="text-lg text-white">
        <div className="border-b border-white text-center">{numerator}</div>
        <div className="text-center">{denominator}</div>
      </div>
      <div className="text-lg text-white">=</div>
      <div className="h-8 w-8 border border-white">
        <div className="h-full bg-red-500" style={{ width: `${(numerator / denominator) * 100}%` }} />
      </div>
    </div>
  )
}

