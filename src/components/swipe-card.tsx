// 声明这是一个客户端组件，表明该组件将在浏览器端渲染和交互
"use client";

// 导入所需的UI组件
import {
  Card,        // 基础卡片容器组件
  CardContent, // 卡片内容区域组件
  CardHeader,  // 卡片头部组件
  CardFooter,  // 卡片底部组件
} from "@/components/ui/card";

// 导入滑动手势相关的hooks和类型
// useSwipeable: 提供跨平台的滑动手势处理能力
// SwipeEventData: 定义滑动事件的数据类型
import { useSwipeable, SwipeEventData } from "react-swipeable";

// 导入React核心hooks
// useState: 管理组件内部状态
// useEffect: 处理副作用操作
// useCallback: 优化函数引用，减少不必要的重渲染
import { useState, useEffect, useCallback } from "react";

// 导入Next.js的图片组件，提供自动优化和懒加载的图片渲染
import Image from "next/image";

// 导入工具函数，用于动态合并CSS类名
import { cn } from "@/lib/utils";

// 导入图标组件，用于返回/撤销操作
import { StepBack } from "lucide-react";

// 导入弹出层相关组件，用于展示更多详细信息
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

// 导入按钮组件，提供交互式操作
import { Button } from "@/components/ui/button";

// 导入头像相关组件，用于展示网站/来源图标
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// 导入AI分析组件，提供文章的智能洞察
import { AIInsight } from "./ai-insight";

// 导入X(Twitter)图标，用于社交分享
import { XIcon } from "@/components/icons/x-icon";

// 定义SwipeCard组件的属性接口
// 详细描述了渲染一张新闻卡片所需的所有数据
interface SwipeCardProps {
  title: string;           // title 现在不仅是显示用，也是标识用
  content: string;
  onSwipe: (title: string) => void;  // 修改这里，参数类型从 id 改为 title
  date: string;
  image?: string;
  favicon?: string;
  url: string;
  isTop?: boolean;
  onBack?: () => void;
  showBack?: boolean;
}

// 根据标题长度返回对应的字体大小类名，这些标题名字我想后面可以通过max_token来限制大模型生成
function getTitleSizeClass(title: string): string {
  if (title.length <= 40) {
    return "text-2xl"; // 短标题使用大字体
  } else if (title.length <= 80) {
    return "text-xl";  // 中等标题使用中等字体
  } else {
    return "text-lg";  // 长标题使用小字体
  }
}

// 定义默认图片路径
const DEFAULT_IMAGE = '/static/images/default.png';

// 提取 KOL 名字的函数
const extractKolName = (url: string): string => {
  try {
    // 尝试从 URL 中提取用户名
    const match = url.match(/x\.com\/([^/?#]+)/);
    return match ? match[1] : 'default'; // 如果无法提取，则回退到使用 cleanHost
  } catch {
    return 'default'; // 出错时返回 cleanHost 作为后备
  }
};

// 导出SwipeCard组件，处理新闻卡片的交互和渲染
export function SwipeCard({
  title,
  content,
  date,
  image = DEFAULT_IMAGE,
  favicon,
  url,
  onSwipe,
  onBack,
  isTop = false,
  showBack = false,
}: SwipeCardProps) {
  // 状态管理：控制卡片的交互和动画效果

  // exitX：记录卡片退出时的水平位移
  // 用于控制卡片完全滑出屏幕的动画效果
  // 正值表示向右滑出，负值表示向左滑出
  const [exitX, setExitX] = useState<number>(0);              

  // sheetOpen：控制底部详情弹出层的显示状态
  // 默认为false，点击查看更多时切换为true
  const [sheetOpen, setSheetOpen] = useState(false);          

  // transform：管理卡片的动态变换效果
  // x: 水平位移距离
  // scale: 缩放比例，用于模拟深度和交互反馈
  // rotate: 旋转角度，增加滑动的自然感
  const [transform, setTransform] = useState({ x: 0, scale: 1, rotate: 0 }); 

  // handleSwipe：处理卡片滑动的核心函数
  // 1. 计算屏幕宽度，确定滑出方向
  // 2. 设置exitX，触发滑出动画
  // 3. 调用父组件传入的onSwipe回调，处理卡片移除逻辑
  const handleSwipe = useCallback((direction: "left" | "right") => {
    // 获取屏幕宽度，用于计算滑出距离
    const screenWidth = window.innerWidth;
    
    // 根据滑动方向设置exitX
    // 向右滑：正值，向左滑：负值
    setExitX(direction === "right" ? screenWidth : -screenWidth);
    onSwipe(title);  // 直接传入 title 作为标识
  }, [onSwipe, title]);

  // 配置滑动手势处理器，使用react-swipeable库
  // 提供丰富的手势交互能力
  const handlers = useSwipeable({
    // onSwiping：实时跟踪滑动过程
    // 仅在顶部卡片（isTop）上生效
    onSwiping: (e: SwipeEventData) => {
      // 非顶部卡片不响应滑动
      if (!isTop) return;
      
      // 获取水平滑动距离
      const deltaX = e.deltaX;
      const absX = Math.abs(deltaX);
      
      // 动态计算缩放效果
      // 随着滑动距离增加，卡片逐渐缩小
      // 最小缩放到0.8，保持一定的视觉存在
      const scale = Math.max(0.8, 1 - absX / 1000);
      
      // 计算旋转角度
      // 根据滑动方向和距离，最大旋转15度
      // 增加滑动的自然和趣味感
      const rotate = (deltaX / 200) * 15; 
      
      // 更新transform状态
      // 实时反馈用户的滑动交互
      setTransform({
        x: deltaX,        // 水平位移
        scale,            // 缩放比例
        rotate,           // 旋转角度
      });
    },

    // onSwiped：滑动结束时的处理逻辑
    onSwiped: (e: SwipeEventData) => {
      // 非顶部卡片不响应
      if (!isTop) return;
      
      // 定义滑动阈值和判定参数
      const threshold = 0.4;        // 触发滑动的阈值比例
      const velocity = Math.abs(e.velocity);   // 滑动速度
      const deltaX = Math.abs(e.deltaX);       // 滑动距离
      const screenWidth = window.innerWidth;   // 屏幕宽度
      
      // 计算滑动距离占屏幕的比例
      const swipePercentage = deltaX / (screenWidth * 0.4);
      
      // 综合判定滑动是否完成
      // 1. 速度贡献：滑动速度的影响
      // 2. 距离贡献：滑动距离占屏幕的比例
      const velocityContribution = Math.min(velocity / 2, threshold * 1.2);
      const distanceContribution = swipePercentage;
      
      // 判断是否完成滑动
      const swipeComplete = velocityContribution + distanceContribution > threshold;
      
      if (swipeComplete) {
        // 滑动距离/速度满足条件，触发滑动
        const direction = e.deltaX > 0 ? "right" : "left";
        handleSwipe(direction);
      } else {
        // 未达到滑动阈值，回弹到初始位置
        // 重置卡片的变换状态
        setTransform({ x: 0, scale: 1, rotate: 0 });
      }
    },

    // 配置手势追踪选项
    trackMouse: true,        // 支持鼠标滑动
    trackTouch: true,        // 支持触摸滑动
    preventScrollOnSwipe: true, // 滑动时阻止页面滚动
    delta: 10,               // 触发滑动的最小距离
  });
  // 键盘快捷键处理：为顶部卡片添加快速交互的键盘控制逻辑
  useEffect(() => {
    // 定义键盘按键事件处理函数
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检测用户的操作系统类型：Mac还是非Mac
      // 使用正则表达式匹配常见的苹果设备平台标识
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

      // 确定修饰键（Command键或Ctrl键）
      // 在Mac上使用metaKey（Command），在其他系统使用ctrlKey（Ctrl）
      const modifierPressed = isMac ? e.metaKey : e.ctrlKey;

      // 仅在以下条件下触发快捷键：
      // 1. 当前卡片是顶部卡片（isTop为true）
      // 2. 按下了修饰键（Command/Ctrl）
      // 3. 按下的是左右箭头键
      if (isTop && modifierPressed && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        // 阻止默认的键盘事件行为
        e.preventDefault();

        // 根据按键方向确定滑动方向
        // 左箭头：向左滑动
        // 右箭头：向右滑动
        const direction = e.key === "ArrowLeft" ? "left" : "right";

        // 调用滑动处理函数，模拟用户手动滑动卡片
        handleSwipe(direction);
      }
    };

    // 仅在顶部卡片时添加键盘事件监听器
    if (isTop) {
      // 添加全局键盘按键事件监听
      window.addEventListener("keydown", handleKeyDown);

      // 返回清理函数，组件卸载时移除事件监听
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isTop, handleSwipe]); // 依赖数组，确保在这些值变化时重新绑定事件

  // 处理URL相关的逻辑：提取网站域名和图标
  // url参数来自新闻文章的原文链接
  const host = new URL(url).hostname; // 获取完整域名（包括www）
  
  // 清理域名，移除可能的"www."前缀
  // 例如：将 "www.example.com" 转换为 "example.com"
  const cleanHost = host.replace(/^www\./, "");

  // 定义卡片动态样式：控制卡片的变换效果
  const cardStyle = {
    // 3D平移变换：根据滑动状态控制卡片位置
    // exitX：卡片完全退出时的位移
    // transform.x：实时滑动过程中的位移
    transform: `translate3d(${exitX || transform.x}px, 0, 0) scale(${transform.scale}) rotate(${transform.rotate}deg)`,

    // 过渡动画：根据是否完全退出调整动画时间
    // exitX存在时使用较长的缓出动画
    // 普通滑动使用短的缓出动画
    transition: exitX ? 'transform 0.3s ease-out' : 'transform 0.1s ease-out',

    // 定位和尺寸控制
    position: 'absolute', // 绝对定位，用于堆叠卡片
    width: '100%',        // 宽度撑满容器
    height: '100%',       // 高度撑满容器

    // 触摸行为控制
    // 仅在顶部卡片时禁用默认触摸滚动
    // 非顶部卡片保持默认触摸行为
    touchAction: isTop ? 'none' : 'auto',
  } as const; // 使用 const 断言，确保类型推断为字面量类型

  // 渲染组件
  // 渲染新闻卡片的主容器组件
  // 使用条件渲染和动态样式控制卡片的交互和展示效果
  return (
    // 最外层div：控制卡片的整体布局和交互行为
    // style={cardStyle}：动态设置卡片的变换效果，包括位移、缩放和旋转
    // handlers：仅在顶部卡片时启用滑动手势处理
    // aria-label和role：提高组件的无障碍性
    
    <div
      style={cardStyle}
      {...(isTop ? handlers : {})}
      aria-label="新闻卡片"
      role="article"
    >
      
      {/* 内部容器：确保卡片填充整个父元素 */}
      <div className="w-full h-full">
        {/* Card组件：提供卡片的基本样式和布局 */}
        {/* 最大高度为视口高度的84%，固定高度550px */}
        {/* 使用flex布局，垂直方向排列内容 */}
        <Card className="w-full max-h-[84dvh] h-[550px] overflow-hidden flex flex-col bg-card shadow-xl mt-[env(safe-area-inset-top)]">
          {/* 图片区域：展示新闻文章的主图 */}
          <div className="relative w-full h-[250px] bg-muted pt-[env(safe-area-inset-top)]">
            {/* Image组件：处理图片加载和展示 */}
            {/* fill属性：图片填充整个容器 */}
            {/* priority：标记为高优先级加载 */}
            {/* sizes：响应式图片大小 */}
            
            <Image
              src={image}
              alt={title}
              fill
              priority
              sizes="(max-width: 400px) 100vw"
              className="object-cover z-0"
              loading="eager"
              unoptimized={image.includes('twimg.com')} // Twitter 图片跳过优化
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // 如果是 Twitter 图片加载失败，尝试直接使用原始 URL
                if (image.includes('twimg.com')) {
                  target.src = image;
                } else {
                  target.src = DEFAULT_IMAGE;
                  target.className = "w-16 h-16 opacity-50";
                }
              }}
            />

            {/* 渐变遮罩层：增加图片的可读性和视觉层次 */}
            {/* 根据是否为默认图片，使用不同的渐变强度 */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-b pointer-events-none z-[1]",
                image === DEFAULT_IMAGE
                  ? "from-black/40 via-black/20 to-black/60" // 默认图片使用较浅的渐变
                  : "from-black/80 via-black/40 to-black/90" // 普通图片使用较深的渐变
              )}
            />

            {/* 
            网站来源信息展示区域：提供文章原始出处的可点击链接
            
            属性和设计细节：
            - href={url}：链接到原始文章地址
            - target="_blank"：在新标签页打开链接
            - rel="noopener noreferrer"：安全属性，防止新标签页访问原页面的JavaScript上下文
            - 绝对定位在卡片右上角
            - 鼠标悬停时颜色变化，提升交互性
            - 阻止点击事件冒泡，防止触发卡片的其他交互
            */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-0 right-0 p-4 z-[3] flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 
              网站图标展示组件：使用Avatar实现
              
              功能特点：
              - 展示网站的favicon
              - 如果图标加载失败，显示域名前两个字母作为备用
              - 小型圆形头像，5x5大小
              */}
              <Avatar className="w-5 h-5">
                {/* 使用传入的 favicon 替代 googleFaviconUrl */}
                <AvatarImage 
                  src={favicon} 
                  alt={cleanHost}
                />
                
                {/* 
                备用显示机制：
                - 当favicon未提供或加载失败时触发
                - 使用域名前两个字母大写
                - 添加浅色背景，增加可读性
                */}
                <AvatarFallback className="text-[10px] bg-primary/10">
                  {cleanHost.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* 
              域名文本展示
              - 小号字体
              - 中等字重
              - 紧挨在图标右侧
              */}
              <span className="text-sm font-medium">
                {extractKolName(url)}
              </span>
            </a>

            {/* 
            文章标题展示区域：位于图片底部的渐变遮罩层上
            
            设计特点：
            - 绝对定位于图片底部
            - 使用黑色渐变背景增加可读性
            - 文字为白色，突出显示
            - 限制最多显示3行
            - 根据标题长度动态调整字体大小
            */}
            <CardHeader className="absolute bottom-0 text-white pointer-events-none px-6 pb-6 z-[2] w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent">
              <h2
                className={cn(
                  // 根据标题长度动态选择字体大小的函数
                  getTitleSizeClass(title),
                  "font-semibold leading-snug", // 半粗体，紧凑行高
                  "line-clamp-3" // 限制最多显示3行
                )}
              >
                {title}
              </h2>
            </CardHeader>
            </div>


         {/* 内容区域 */}
         <div className="flex flex-col flex-1 overflow-hidden">
            <CardContent className="flex-grow py-6 px-6 relative -mt-2 overflow-y-auto">
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 tracking-wide select-none font-noto-sans-sc max-h-[180px] overflow-y-auto pr-2">
                <time dateTime={date} className="font-medium">
                  {(() => {
                    // 将日期字符串转换为Date对象
                    // 格式: "202501132205" -> "2025-01-13 22:05" 
                    const year = date.slice(0,4);
                    const month = date.slice(4,6);
                    const day = date.slice(6,8);
                    const hour = date.slice(8,10);
                    const minute = date.slice(10,12);
                    const publishDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
                    
                    // 获取当前时间
                    const now = new Date();
                    
                    // 计算时间差(小时)
                    const diffHours = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60));
                    
                    // 如果小于24小时,显示"xx小时前"
                    if(diffHours < 24) {
                      return `${diffHours}小时前`;
                    }
                    
                    // 如果大于等于24小时,显示"xx天前" 
                    const diffDays = Math.floor(diffHours / 24);
                    return `${diffDays}天前`;
                  })()}
                </time>
                &nbsp;&middot;&nbsp;
                {content.length > 370 ? `${content.slice(0, 370)}...` : content}
              </p>
            </CardContent>


            {/* 
            底部操作区域 - 卡片交互控制栏
            主要功能：
            1. 提供返回按钮（可选）
            2. 提供AI洞察按钮
            3. 使用 flex 布局实现按钮的灵活排列
            4. mt-auto 确保操作栏始终位于卡片底部
            */}
            <CardFooter className="mt-auto pt-2 flex items-center justify-between gap-2">
              {/* 
              返回按钮 - 条件渲染
              - showBack 控制是否显示
              - 点击时阻止事件冒泡，防止触发卡片的其他交互
              - 使用 ghost 变体，保持轻量级设计
              - 悬停时颜色变化，提升交互反馈
              */}
              {showBack && (
                <Button
                  variant="ghost"  // 幽灵按钮样式，背景透明
                  size="sm"        // 小尺寸按钮
                  onClick={(e) => {
                    e.stopPropagation();  // 阻止事件冒泡
                    onBack?.();           // 安全调用返回回调函数
                  }}
                  className="text-muted-foreground hover:text-foreground"  // 颜色变化效果
                >
                  <StepBack className="w-4 h-4" /> 
                  后退
                </Button>
              )}

              {/* 
              AI洞察弹出层 - 使用 Sheet 组件实现底部弹窗
              - 通过 open 和 onOpenChange 控制弹窗状态
              - 点击按钮打开弹窗
              */}
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                {/* 
                AI洞察按钮 
                - 使用渐变 SVG 图标增加视觉吸引力
                - 点击时阻止事件冒泡
                - 触发弹窗打开
                */}
                <Button
                  variant="outline"  // 轮廓按钮样式
                  onClick={(e) => {
                    e.stopPropagation();  // 阻止事件冒泡
                    setSheetOpen(true);   // 打开底部弹窗
                  }}
                  className="ml-auto"  // 靠右对齐
                >
                  AI Insights
                  {/* 
                  自定义渐变 SVG 图标
                  - 使用线性渐变创建动态颜色效果
                  - 渐变从红色到紫色到蓝色
                  */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    className="[&>path]:stroke-[url(#ai-gradient)]"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* 定义渐变色彩 */}
                    <defs>
                      <linearGradient
                        id="ai-gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" style={{ stopColor: "#FF3366" }} />
                        <stop offset="50%" style={{ stopColor: "#8B5CF6" }} />
                        <stop offset="100%" style={{ stopColor: "#0EA5E9" }} />
                      </linearGradient>
                    </defs>
                    {/* 图标路径 */}
                    <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272L12 3z" />
                  </svg>
                </Button>

                {/* 
                底部弹窗内容 - 文章详情
                - 使用 SheetContent 组件实现底部弹窗
                - 高度自适应，考虑安全区域
                - 支持滚动
                */}
                <SheetContent
                  side="bottom"  // 指定弹出方向为底部，提供更自然的移动端交互体验
                  className="
                    h-[calc(92dvh-env(safe-area-inset-top))]  // 动态计算高度，减去安全区域顶部高度
                    sm:h-[calc(94dvh-env(safe-area-inset-top))]  // 在小屏幕上略微调整高度
                    pb-safe  // 适配安全区域的底部内边距
                    overflow-y-auto  // 启用垂直滚动，确保内容超出时可滚动查看
                  "
                >
                  {/* 
                  无障碍访问标题：对屏幕阅读器可见，但在视觉上隐藏
                  提高网页可访问性，帮助辅助技术理解页面结构 
                  */}
                  <SheetTitle className="sr-only">文章详情</SheetTitle>
                  
                  {/* 
                  文章详情容器：响应式布局设计
                  - mx-auto: 水平居中
                  - w-full max-w-3xl: 宽度自适应，最大宽度限制为3xl
                  - px-4 sm:px-6: 不同屏幕尺寸的水平内边距
                  */}
                  <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
                    {/* 
                    文章内容区域：使用 Tailwind 的 prose 插件
                    - prose-slate: 使用石板灰色调
                    - dark:prose-invert: 暗黑模式反色
                    - 精细控制排版样式：标题、段落、图片等
                    */}
                    <article className="
                      prose prose-slate dark:prose-invert 
                      prose-headings:font-bold  // 标题加粗
                      prose-h1:text-2xl prose-h2:text-xl  // 标题字号
                      prose-p:text-base  // 段落文字大小
                      prose-img:rounded-lg  // 图片圆角
                      max-w-none  // 移除最大宽度限制
                    ">
                      {/* 
                      文章图片容器：响应式和自适应设计
                      - not-prose: 防止 prose 插件影响布局
                      - aspect-[2/1]: 2:1 宽高比，保持图片美观
                      - mb-6: 底部外边距
                      - rounded-lg overflow-hidden: 圆角和溢出隐藏
                      - bg-muted: 加载时的背景色
                      */}
                      <div className="
                        not-prose relative w-full 
                        aspect-[2/1] mb-6 
                        rounded-lg overflow-hidden 
                        bg-muted
                      ">
                        {/* 
                        Next.js Image 组件：图片优化和错误处理
                        - fill: 填充父容器
                        - priority: 高优先级加载
                        - sizes: 响应式图片尺寸
                        - onError: 图片加载失败的备用方案
                        */}
                        <Image
                          src={image}  // 文章图片源
                          alt={title}  // 图片替代文本
                          fill  // 填充父容器
                          priority  // 高优先级加载
                          sizes="(max-width: 768px) 100vw, 768px"  // 响应式图片尺寸
                          className="object-cover"  // 图片填充并保持比例
                          onError={(e) => {
                            // 图片加载失败时的兜底处理
                            const target = e.target as HTMLImageElement;
                            target.src = DEFAULT_IMAGE;  // 使用默认图片
                            target.className = "w-16 h-16 opacity-50";  // 调整默认图片样式
                          }}
                        />
                      </div>

                      {/* 文章标题 - 渐变效果 */}
                      <h1 className="text-3xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        {title}
                      </h1>

                      {/* 发布日期 */}
                      <div className="not-prose flex items-center gap-3 text-sm text-muted-foreground">
                        <time className="font-medium bg-secondary px-2 py-0.5 rounded-md">
                          {new Date().toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      </div>

                      {/* 跳转到Twitter讨论的按钮 */}
                      <a
                        href={`https://x.com/search?q=${encodeURIComponent(
                          title
                        )}&f=live`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="not-prose mt-4 mb-6 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-medium text-sm transition-all"
                      >
                        <span>See discussion on</span>
                        <XIcon className="w-4 h-4" />
                      </a>

                      {/* 
                      条件渲染AI洞察组件
                      - 仅在弹窗打开时加载
                      - 传入文章标题作为查询参数
                      */}
                      {sheetOpen && <AIInsight query={title} />}
                    </article>
                  </div>
                </SheetContent>
              </Sheet>
            </CardFooter>
            </div>
        </Card>
      </div>
    </div>
  );
}

