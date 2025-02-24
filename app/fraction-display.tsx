interface FractionDisplayProps {
  numerator: number
  denominator: number
}

export default function FractionDisplay({ numerator, denominator }: FractionDisplayProps) {
  return (
    <div className="inline-flex items-center gap-4 rounded-lg bg-gray-800 p-4">
      <div className="text-2xl text-white">
        <div className="border-b border-white text-center">{numerator}</div>
        <div className="text-center">{denominator}</div>
      </div>
      <div className="text-2xl text-white">=</div>
      <div className="h-16 w-16 border border-white">
        <div className="h-full bg-red-500" style={{ width: `${(numerator / denominator) * 100}%` }} />
      </div>
    </div>
  )
}

