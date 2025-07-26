// 导入必要的类型和组件
import type { Metadata, Viewport } from "next"; // 导入Next.js的元数据和视口类型定义
import "./globals.css"; // 导入全局CSS样式
import { ThemeProvider } from "@/components/theme-provider"; // 导入主题提供者组件,用于管理暗/亮主题
import { IOSHandler } from "@/components/ios-handler"; // 导入iOS相关处理组件
import Script from "next/script"; // 导入Next.js的Script组件,用于管理JavaScript脚本
import { getPublicUrl } from "@/lib/url-utils"; // 导入智能URL管理功能

// 配置视口(viewport)设置
// 这些设置对移动端体验很重要,控制页面在移动设备上的显示方式
export const viewport: Viewport = {
  // width: "device-width" 确保网页宽度与设备屏幕宽度完全匹配
  // 这对于响应式设计至关重要,可以确保内容在不同设备上正确显示
  width: "device-width", 

  // initialScale: 1 设置初始缩放比例为1:1
  // 防止浏览器自动缩放页面,保持原始设计的精确呈现
  initialScale: 1, 

  // maximumScale: 1 限制最大缩放比例为1
  // 进一步防止用户意外缩放,保持页面布局的一致性
  maximumScale: 1, 

  // userScalable: false 完全禁止用户手动缩放页面
  // 适用于精心设计的移动界面,确保用户体验按照预期进行
  userScalable: false, 

  // viewportFit: "cover" 允许内容覆盖整个屏幕,包括安全区域(如刘海屏)
  // 提供更加沉浸式的用户体验,特别适合现代移动设备
  viewportFit: "cover", 

  // themeColor: "#f7f7f7" 设置浏览器状态栏和顶部区域的颜色
  // 与网站主题和设计风格保持一致,提供更加统一的视觉体验
  themeColor: "#f7f7f7" 
};

// 配置网站元数据
// 这些信息用于SEO优化和社交媒体分享
// 网站元数据配置
// 这个元数据对象定义了网站的全面信息，包括SEO、社交媒体分享和PWA配置
export const metadata: Metadata = {
  // 网站标题：简洁明了地描述应用的核心价值主张
  // 对SEO和用户认知至关重要，会出现在搜索引擎结果和浏览器标签中
  title: "HODLer: Master Crypto with Confidence.",

  // 网站描述：详细解释应用的功能和独特卖点
  // 搜索引擎使用这段描述来理解网站内容，对SEO排名有重要影响
  description:
    "An AI-powered hotspot aggregator for crypto retail investors. Stay ahead with real-time updates on KOL opinions and crypto opportunities. Offering balanced and trustworthy insights, it’s designed for fast-paced lifestyles with a sleek, user-friendly interface and exceptional user experience.",

  // PWA清单文件路径
  // 定义了渐进式Web应用的基本配置，包括图标、名称等
  manifest: "/manifest.json", 

  // 元数据的基础URL，用于生成规范的绝对URL
  // 使用智能URL检测，自动适配Vercel环境和自定义域名
  // 确保所有相对链接都能正确解析，对SEO很重要
  metadataBase: new URL(getPublicUrl()), 

  // 规范链接配置，帮助搜索引擎理解网站的首选域名
  // 防止重复内容问题，consolidate网站的搜索权重
  alternates: {
    canonical: "/", 
  },

  // iOS Web App特定配置
  // 控制应用在iOS设备上的行为和外观
  appleWebApp: {
    capable: true, // 标记为可安装的Web应用
    statusBarStyle: "black-translucent", // 状态栏样式，提供沉浸式体验
    title: "HODLer", // 添加到主屏幕时显示的应用名称
  },

  // Open Graph协议配置：定义社交媒体分享时的显示信息
  // 当链接被分享到Facebook、LinkedIn等平台时使用
  openGraph: {
    title: "HODLer: Master Crypto with Confidence.",
    description:
      "An AI-powered hotspot aggregator for crypto retail investors. Stay ahead with real-time updates on KOL opinions and crypto opportunities. Offering balanced and trustworthy insights, it’s designed for fast-paced lifestyles with a sleek, user-friendly interface and exceptional user experience.",
    images: [{ url: "/static/images/epigram-og.png" }], // 分享时显示的图片
  },

  // Twitter卡片配置：定义在Twitter上分享链接时的展示样式
  // 不同类型的卡片（summary, summary_large_image等）会影响链接预览的外观
  twitter: {
    card: "summary_large_image", // 使用大图卡片，视觉冲击力更强
    title: "HODLer: Master Crypto with Confidence.",
    description:
      "An AI-powered hotspot aggregator for crypto retail investors. Stay ahead with real-time updates on KOL opinions and crypto opportunities. Offering balanced and trustworthy insights, it’s designed for fast-paced lifestyles with a sleek, user-friendly interface and exceptional user experience.",
    images: ["/static/images/epigram-og.png"], // Twitter分享时的图片
  },

  // 网站图标配置：定义不同场景和设备下的应用图标
  icons: {
    // 常规图标：支持多种格式和尺寸，确保在不同环境下都能正确显示
    icon: [
      { url: "/favicon.ico", sizes: "any" }, // 传统favicon
      { url: "/favicon.svg", type: "image/svg+xml" }, // 矢量图标
      { url: "/icons/192x192_1.png", sizes: "192x192", type: "image/png" }, // Android图标
      { url: "/icons/512x512_1.png", sizes: "512x512", type: "image/png" }, // 高分辨率图标
    ],

    // iOS设备专用图标：确保在苹果设备上有最佳显示
    apple: [
      { url: "/icons/192x192_1.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/512x512_1.png", sizes: "512x512", type: "image/png" },
    ],

    // 快捷方式图标：用于创建桌面快捷方式
    shortcut: ["/favicon.ico"], 
  },
};

// 根布局组件
// 这是Next.js应用的最外层组件,所有页面都会被包裹在这个布局中
export default function RootLayout({
  children, // 子组件/页面内容
}: {
  children: React.ReactNode; // React节点类型，表示可以传入任何有效的React子元素
}) {
  // RootLayout 根布局组件参数解析：
  
  // 1. children: 表示被包裹的子组件/页面内容
  //    - 类型为 React.ReactNode，这是一个非常灵活的类型
  //    - 可以接收：
  //      * React元素（如 <div>、<Component>）
  //      * 字符串
  //      * 数字
  //      * Fragment
  //      * 组件数组
  //      * null 或 undefined
  
  // 2. 解构赋值：从传入的props中直接提取children属性
  //    - 这是一种现代JavaScript/TypeScript的语法糖
  //    - 等同于 function RootLayout(props) { const children = props.children; }
  
  // 3. 类型注解 { children: React.ReactNode }
  //    - 为children参数提供严格的类型检查
  //    - 确保只能传入有效的React子元素
  //    - 增强代码的类型安全性
  return (
    // lang属性设置为英文,suppressHydrationWarning用于抑制hydration警告
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* iOS Web App 特殊配置 - 专门针对苹果移动设备的元数据标签 */}
        {/* 
         * @description 允许网页作为Web应用程序在iOS设备上运行
         * @param content="yes" 启用Web应用模式，使网页看起来更像原生应用
         * - 移除浏览器导航栏和工具栏
         * - 允许全屏显示
         * - 支持添加到主屏幕功能
         */}
        <meta name="apple-mobile-web-app-capable" content="yes" />

        {/* 
         * @description 控制iOS状态栏的外观样式
         * @param content="black-translucent" 状态栏将呈现半透明效果
         * - 允许网页内容延伸到状态栏下方
         * - 提供更加沉浸式的用户体验
         * - 与应用的设计风格更加协调
         */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* 
         * @description 禁用电话号码自动检测和拨号功能
         * @param content="no" 阻止iOS自动将电话号码转换为可点击的链接
         * - 防止意外触发电话拨号
         * - 保持网页原有的文本展示样式
         * - 适用于不需要电话功能的应用
         */}
        <meta name="format-detection" content="telephone=no" />

        {/* 
         * @description 标记为移动Web应用
         * @param content="yes" 告诉浏览器这是一个移动优化的Web应用
         * - 启用移动设备的特殊渲染和交互模式
         * - 与apple-mobile-web-app-capable功能类似，但更通用
         * - 提供跨平台的Web应用支持
         */}
        <meta name="mobile-web-app-capable" content="yes" />

        {/* iOS启动画面和图标配置 - 提供更好的启动和桌面图标体验 */}
        {/* 
         * @description 定义iOS应用启动时的闪屏图像
         * @param href="/splash.png" 指定启动画面的图片路径
         * - 提供更专业的应用启动体验
         * - 减少白屏或黑屏等待时间
         * - 增强应用的视觉连贯性
         */}
        <link rel="apple-touch-startup-image" href="/splash.png" />

        {/* 
         * @description 为iOS设备定义不同尺寸的应用图标
         * @param sizes 指定图标的像素尺寸
         * @param href 提供对应尺寸的图标资源路径
         * - 192x192: 适用于较小的设备和图标场景
         * - 512x512: 提供高分辨率的大尺寸图标
         * - 确保在不同设备和场景下都有清晰的图标显示
         */}
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/192x192_1.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/512x512_1.png" />
        {/* 
         * Google Analytics（分析）脚本配置
         * 
         * @description 集成Google Analytics追踪服务，用于网站访问数据收集和分析
         * 
         * 主要功能：
         * 1. 加载Google Analytics跟踪脚本
         * 2. 初始化数据收集环境
         * 3. 配置网站特定的跟踪ID
         * 
         * 详细工作流程：
         * - 第一个Script标签：异步加载Google Analytics的核心跟踪脚本
         *   - src属性动态使用环境变量中配置的跟踪ID
         *   - strategy="afterInteractive"确保脚本在页面交互后加载，优化性能
         * 
         * - 第二个Script标签：初始化和配置跟踪行为
         *   - 创建全局dataLayer数组，用于存储分析事件
         *   - 定义gtag函数，用于向dataLayer推送分析事件
         *   - gtag('js', new Date())标记脚本加载时间
         *   - gtag('config', ...)配置特定网站的跟踪ID
         * 
         * 注意事项：
         * - 需要在环境变量中正确配置NEXT_PUBLIC_GA_ID
         * - 遵守用户隐私和数据保护相关法规
         */}
        {/* <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            // 初始化全局数据层，用于存储分析事件
            window.dataLayer = window.dataLayer || [];
            
            // 定义gtag函数，简化事件推送
            function gtag(){dataLayer.push(arguments);}
            
            // 标记脚本加载时间
            gtag('js', new Date());
            
            // 配置特定网站的Google Analytics跟踪
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script> */}
      </head>
      {/* 主体内容 */}
      {/* 
       * body标签的类名样式详细解析
       * 
       * min-h-screen：最小高度为屏幕高度
       * 常见的body高度相关类名及其含义：
       * 1. h-screen：精确设置高度等于屏幕高度（100vh）
       * 2. min-h-screen：最小高度为屏幕高度，允许内容超出时自动扩展
       * 3. max-h-screen：最大高度为屏幕高度，超出部分会出现滚动条
       * 
       * 使用场景：
       * - 确保页面内容至少占满整个屏幕高度
       * - 适用于单页应用（SPA）和需要全屏布局的页面
       * - 防止页脚被遮挡，保持页面美观和可用性
       * 
       * Tailwind CSS推荐用法：
       * - 搭配flex或grid布局使用
       * - 可以添加其他辅助类如 overflow-y-auto 处理滚动
       */}
      <body className="min-h-screen">
        {/* 
          ThemeProvider组件：提供全局主题上下文和主题切换功能
          - attribute="class"：通过添加/移除CSS类来切换主题样式
          - defaultTheme="system"：默认使用系统的主题设置
          - enableSystem：允许跟随系统主题自动切换
          - disableTransitionOnChange：禁用主题切换时的过渡动画，防止闪烁和不自然的过渡效果
        */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* 
            主题和iOS处理的执行顺序：
            1. ThemeProvider首先初始化全局主题上下文
               - 设置默认主题为系统主题
               - 启用系统主题自动切换机制
               - 准备通过class属性管理主题样式

            2. IOSHandler组件被挂载
               - 监听主题变化
               - 动态更新浏览器主题颜色
               - 处理iOS设备特殊的安全区域适配
               - 为iOS Web App提供优化的用户体验

            3. 最后渲染子组件/页面内容
               - 子组件将继承ThemeProvider提供的主题上下文
               - 可以使用useTheme钩子获取和切换主题
          */}
          <IOSHandler />
          
          {/* 渲染子组件/页面内容 */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
