import type React from "react"
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="overflow-hidden">{children}</body>
    </html>
  )
}



import './globals.css'