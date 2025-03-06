import type React from "react"
import './globals.css'
import HomeButton from './components/HomeButton'

// 为window.wx添加类型声明
declare global {
  interface Window {
    wx?: {
      miniProgram?: {
        navigateBack: (options: { delta: number }) => void;
      };
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        {/* 页面元数据 */}
      </head>
      <body className="overflow-hidden">
        <HomeButton />
        {children}
        <script src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js"></script>
      </body>
    </html>
  )
}