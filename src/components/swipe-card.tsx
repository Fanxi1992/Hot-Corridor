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
  title: string;           // 新闻标题，决定卡片的主要文字内容
  content: string;         // 新闻摘要，提供文章的简要描述
  onSwipe: (direction: "left" | "right") => void;  // 滑动回调函数，处理用户滑动卡片的交互
  date: string;           // 文章发布日期，展示文章的时间信息
  image?: string;         // 新闻配图URL，可选，用于增强视觉吸引力
  favicon?: string;       // 新闻源网站图标URL，可选，标识文章来源
  url: string;           // 原文链接，允许用户跳转到完整文章
  isTop?: boolean;       // 标记是否为顶部卡片，控制交互和动画效果
  onBack?: () => void;   // 返回/撤销操作的回调函数
  showBack?: boolean;    // 控制是否显示返回/撤销按钮
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

// 导出SwipeCard组件，处理新闻卡片的交互和渲染
export function SwipeCard({
  title,
  content,
  date,
  image = DEFAULT_IMAGE,
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
    
    // 调用父组件传入的滑动处理函数
    onSwipe(direction);
  }, [onSwipe]);

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

  // 使用Google的favicon服务获取网站图标
  // 通过域名动态生成网站的favicon图标URL
  // sz=64 参数指定图标大小为64像素
  const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${host}&sz=64`;

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
  return (
    <div
      style={cardStyle}
      {...(isTop ? handlers : {})}
      aria-label="News card"
      role="article"
    >
      <div className="w-full h-full">
        <Card className="w-full max-h-[84dvh] h-[550px] overflow-hidden flex flex-col bg-card shadow-xl mt-[env(safe-area-inset-top)]">
          {/* 图片区域 */}
          <div className="relative w-full h-[250px] bg-muted pt-[env(safe-area-inset-top)]">
            <Image
              src={image}
              alt={title}
              fill
              priority
              sizes="(max-width: 400px) 100vw"
              className="object-cover z-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_IMAGE;
                target.className = "w-16 h-16 opacity-50";
              }}
            />

            {/* 渐变遮罩层 */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-b pointer-events-none z-[1]",
                image === DEFAULT_IMAGE
                  ? "from-black/40 via-black/20 to-black/60" // 默认图片使用较浅的渐变
                  : "from-black/80 via-black/40 to-black/90" // 普通图片使用较深的渐变
              )}
            />

            {/* 来源信息 */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-0 right-0 p-4 z-[3] flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="w-5 h-5">
                <AvatarImage src={googleFaviconUrl} alt={cleanHost} />
                <AvatarFallback className="text-[10px] bg-primary/10">
                  {cleanHost.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{cleanHost}</span>
            </a>

            {/* 标题区域 */}
            <CardHeader className="absolute bottom-0 text-white pointer-events-none px-6 pb-6 z-[2] w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent">
              <h2
                className={cn(
                  getTitleSizeClass(title),
                  "font-semibold leading-snug",
                  "line-clamp-3"
                )}
              >
                {title}
              </h2>
            </CardHeader>
          </div>

          {/* 内容区域 */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <CardContent className="flex-grow py-6 px-6 relative -mt-2 overflow-y-auto pointer-events-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <p className="text-sm leading-normal text-gray-700 dark:text-gray-300 tracking-normal select-none">
                <time dateTime={date} className="font-medium">
                  {new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                &nbsp;&middot;&nbsp;
                {content.length > 370 ? `${content.slice(0, 370)}...` : content}
              </p>
            </CardContent>

            {/* 底部操作区 */}
            <CardFooter className="mt-auto pt-2 flex items-center justify-between gap-2">
              {showBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBack?.();
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <StepBack className="w-4 h-4" />
                  Back
                </Button>
              )}
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSheetOpen(true);
                  }}
                  className="ml-auto"
                >
                  AI Insights
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    className="[&>path]:stroke-[url(#ai-gradient)]"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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
                    <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272L12 3z" />
                  </svg>
                </Button>
                <SheetContent
                  side="bottom"
                  className="h-[calc(92dvh-env(safe-area-inset-top))] sm:h-[calc(94dvh-env(safe-area-inset-top))] pb-safe overflow-y-auto"
                >
                  <SheetTitle className="sr-only">Article Details</SheetTitle>
                  <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
                    <article className="prose prose-slate dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-p:text-base prose-img:rounded-lg max-w-none">
                      <div className="not-prose relative w-full aspect-[2/1] mb-6 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={image}
                          alt={title}
                          fill
                          priority
                          sizes="(max-width: 768px) 100vw, 768px"
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = DEFAULT_IMAGE;
                            target.className = "w-16 h-16 opacity-50";
                          }}
                        />
                      </div>

                      <h1 className="text-3xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{title}</h1>

                      <div className="not-prose flex items-center gap-3 text-sm text-muted-foreground">
                        <time className="font-medium bg-secondary px-2 py-0.5 rounded-md">
                          {new Date().toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      </div>

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
