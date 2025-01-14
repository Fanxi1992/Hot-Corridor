// 导入必要的类型和组件
import type { Metadata, Viewport } from "next"; // 导入Next.js的元数据和视口类型定义
import "./globals.css"; // 导入全局CSS样式
import { ThemeProvider } from "@/components/theme-provider"; // 导入主题提供者组件,用于管理暗/亮主题
import { IOSHandler } from "@/components/ios-handler"; // 导入iOS相关处理组件
import Script from "next/script"; // 导入Next.js的Script组件,用于管理JavaScript脚本

// 配置视口(viewport)设置
// 这些设置对移动端体验很重要,控制页面在移动设备上的显示方式
export const viewport: Viewport = {
  width: "device-width", // 视口宽度设置为设备宽度
  initialScale: 1, // 初始缩放比例
  maximumScale: 1, // 最大缩放比例
  userScalable: false, // 禁止用户缩放
  viewportFit: "cover", // 视口适配方式
  themeColor: "#f7f7f7" // 主题颜色
};

// 配置网站元数据
// 这些信息用于SEO优化和社交媒体分享
export const metadata: Metadata = {
  // 网站标题
  title:
    "Epigram: Open-Source, Free, and AI-Powered News in Short.",
  // 网站描述  
  description:
    "An open-source, AI-powered news app for busy people. Stay updated with bite-sized news, real-time updates, and in-depth analysis. Experience balanced, trustworthy reporting tailored for fast-paced lifestyles in a sleek, user-friendly interface.",
  manifest: "/manifest.json", // PWA配置文件路径
  metadataBase: new URL(process.env.BASE_URL!), // 元数据基础URL
  alternates: {
    canonical: "/", // 规范链接
  },
  // iOS Web App配置
  appleWebApp: {
    capable: true, // 启用iOS Web App功能
    statusBarStyle: "black-translucent", // 状态栏样式
    title: "Epigram", // App名称
  },
  // Open Graph协议配置(用于社交媒体分享)
  openGraph: {
    title: "Epigram: Open-Source, Free, and AI-Powered News in Short.",
    description:
      "An open-source, AI-powered news app for busy people. Stay updated with bite-sized news, real-time updates, and in-depth analysis. Experience balanced, trustworthy reporting tailored for fast-paced lifestyles in a sleek, user-friendly interface.",
    images: [{ url: "/static/images/epigram-og.png" }], // 社交分享图片
  },
  // Twitter卡片配置
  twitter: {
    card: "summary_large_image",
    title: "Epigram: Open-Source, Free, and AI-Powered News in Short.",
    description:
      "An open-source, AI-powered news app for busy people. Stay updated with bite-sized news, real-time updates, and in-depth analysis. Experience balanced, trustworthy reporting tailored for fast-paced lifestyles in a sleek, user-friendly interface.",
    images: ["/static/images/epigram-og.png"],
  },
  // 网站图标配置
  icons: {
    // 常规图标
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/icons/192x192_1.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/512x512_1.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    // iOS设备图标
    apple: [
      {
        url: "/icons/192x192_1.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/512x512_1.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.ico"], // 快捷方式图标
  },
};

// 根布局组件
// 这是Next.js应用的最外层组件,所有页面都会被包裹在这个布局中
export default function RootLayout({
  children, // 子组件/页面内容
}: {
  children: React.ReactNode;
}) {
  return (
    // lang属性设置为英文,suppressHydrationWarning用于抑制hydration警告
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* iOS Web App相关meta标签 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* iOS启动画面和图标配置 */}
        <link rel="apple-touch-startup-image" href="/splash.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/192x192_1.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/512x512_1.png" />
        {/* Google Analytics脚本配置 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      {/* 主体内容 */}
      <body className="min-h-screen">
        {/* ThemeProvider用于提供主题上下文 */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* iOS特定处理组件 */}
          <IOSHandler />
          {/* 渲染子组件/页面内容 */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
