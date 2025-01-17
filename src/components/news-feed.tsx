// 声明这是一个客户端组件
"use client";
// 导入必要的React组件和第三方图标
import { SwipeCard } from "@/components/swipe-card"; // 可滑动卡片组件，用于新闻交互式展示
import { useState, useEffect } from "react"; // React状态管理和副作用Hooks
import AppSwitcher from "@/components/AppSwitcher"; // 应用切换器组件
import { NewsArticle } from "@/types/newsArticle"; // 新闻文章数据类型定义
import { ArrowLeftRight } from "lucide-react"; // 左右箭头图标，用于提示用户操作
import { cn } from "@/lib/utils"; // 类名合并工具函数，用于动态样式处理

/**
 * NewsFeed组件 - 新闻动态浏览页面
 * 
 * 核心功能：
 * 1. 以卡片形式展示新闻文章
 * 2. 支持用户通过滑动交互浏览新闻
 * 3. 提供首次使用的操作提示
 * 
 * @param newsArticles 初始新闻文章数组
 */
export default function NewsFeed({ newsArticles }: { newsArticles: NewsArticle[] }) {
  // 状态管理：追踪和控制新闻卡片的展示和交互

  // cards状态：当前正在展示的新闻卡片列表
  // 初始值为传入的newsArticles，用户可以通过滑动动态更新
  const [cards, setCards] = useState(newsArticles);

  // dismissedCards状态：已被用户划走/忽略的新闻卡片
  // 支持"撤销"功能，可以将最近划走的卡片恢复
  const [dismissedCards, setDismissedCards] = useState<NewsArticle[]>([]);

  // showTip状态：控制是否显示首次使用的滑动操作提示
  // 默认为false，通过localStorage判断是否需要展示
  const [showTip, setShowTip] = useState(false);

  // isFading状态：控制提示的淡出动画效果
  // 用于在用户首次交互后平滑地隐藏操作提示
  const [isFading, setIsFading] = useState(false);

  /**
   * 组件挂载时的副作用钩子
   * 
   * 逻辑：
   * 1. 检查localStorage是否存在'hasSeenSwipeTip'标记
   * 2. 如果不存在（首次使用），显示滑动操作提示
   * 3. 设置标记，防止重复显示提示
   */
  useEffect(() => {
    // 读取本地存储中是否已经看过提示
    const hasSeenTip = localStorage.getItem('hasSeenSwipeTip');
    
    // 如果从未看过提示，则显示
    if (!hasSeenTip) {
      // 设置显示提示状态为true
      setShowTip(true);
      
      // 在localStorage中记录已看过提示
      localStorage.setItem('hasSeenSwipeTip', 'true');
    }
  }, []); // 空依赖数组，仅在组件首次挂载时执行
  /**
   * 处理新闻卡片滑动事件的核心函数
   * 
   * @param id 被滑动卡片的唯一标识符
   * 
   * 函数执行的详细流程：
   * 1. 通过id查找并定位被滑动的具体卡片
   * 2. 从当前展示的卡片列表中移除该卡片
   * 3. 将被移除的卡片添加到已划走卡片的历史记录中
   * 4. 触发操作提示的淡出动画
   * 5. 在动画结束后隐藏提示并记录用户已见过提示
   */
  const handleSwipe = (title: string) => {
    // 使用 title 查找要移除的卡片
    const dismissedCard = cards.find(card => card.title === title);

    // 使用 title 过滤卡片
    setCards((cards) => cards.filter((card) => card.title !== title));

    // 其余逻辑保持不变
    if (dismissedCard) {
      setDismissedCards(prev => [dismissedCard, ...prev]);
    }

    setIsFading(true);

    setTimeout(() => {
      setShowTip(false);
      localStorage.setItem('hasSeenSwipeTip', 'true');
    }, 500);
  };

  // 处理撤销操作的函数，用于恢复最近一次被划走的新闻卡片
  const handleUndo = () => {
    // 首先检查是否有已划走的卡片可以撤销
    if (dismissedCards.length > 0) {
      // 使用数组解构赋值，精准地取出最后一张划走的卡片
      // [lastDismissed, ...remainingDismissed] 的工作原理：
      // 1. lastDismissed 获取数组的第一个元素（最近划走的卡片）
      // 2. ...remainingDismissed 获取剩余的所有卡片（除第一个之外）
      // 例如：如果 dismissedCards = [卡片A, 卡片B, 卡片C]
      // 执行后：
      // lastDismissed = 卡片A
      // remainingDismissed = [卡片B, 卡片C]
      const [lastDismissed, ...remainingDismissed] = dismissedCards;

      // 更新 dismissedCards 状态，移除最后一张被划走的卡片
      // 使用 setDismissedCards 更新状态，保留剩余的已划走卡片
      setDismissedCards(remainingDismissed);

      // 将最后一张划走的卡片放回显示列表的最前面
      // prev => [lastDismissed, ...prev] 的工作原理：
      // 1. prev 代表当前的 cards 数组
      // 2. [lastDismissed, ...prev] 创建一个新数组
      // 3. lastDismissed 放在数组第一个位置
      // 4. ...prev 展开原有的 cards 数组，跟在 lastDismissed 后面
      // 这样可以确保撤销的卡片出现在卡片列表的最顶部
      setCards(prev => [lastDismissed, ...prev]);
    }
  };

  return (
    <>
      {/* 主容器 */}
      <div className="fixed inset-0 pt-4 pb-10 px-4">
        <div className="relative w-full max-w-[400px] mx-auto h-full perspective-1000">
          {/* 滑动提示UI：用于指导用户如何与新闻卡片交互 */}
          {/* 条件渲染：仅在存在提示且卡片数量大于0时显示 */}
          {showTip && cards.length > 0 && (
            <div className={cn(
              // 定位样式：绝对定位，居中显示，高层级
              "absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
              // 文本和布局样式：前景色、内边距、圆角、弹性布局
              "text-foreground px-5 py-3 rounded-xl",
              "flex flex-col items-center gap-1.5",
              // 阴影和边框效果：添加轻微阴影和边框
              "shadow-lg ring-1 ring-foreground/10",
              // 过渡动画：平滑过渡，持续500毫秒
              "transition-all duration-500",
              // 浮动动画：每8秒无限循环的浮动效果
              "animate-[float_8s_ease-in-out_infinite]",
              // 背景样式：半透明背景，模糊效果
              "bg-background/40 backdrop-blur-xl",
              // 淡出效果：当isFading为true时，透明度变为0
              isFading && "opacity-0"
            )}>
              {/* 图标容器：使用慢速浮动动画 */}
              <div className="animate-[float-slow_32s_linear_infinite] icon-container flex items-center justify-center">
                {/* 箭头左右图标：指示滑动方向 */}
                <ArrowLeftRight className="w-7 h-7 text-foreground/70" />
              </div>
              
              {/* 提示文本：简洁指导用户操作 */}
              <span className="text-sm text-center font-medium text-foreground/90">
                Swipe cards to explore
              </span>
              
              {/* 自定义全局CSS动画关键帧 */}
              {/* float动画：水平微小位移，模拟轻微浮动 */}
              {/* float-slow动画：图标缓慢左右移动 */}
              <style jsx global>{`
                @keyframes float {
                  0% { transform: translate(calc(-50% - 4px), -50%); }
                  50% { transform: translate(calc(-50% + 4px), -50%); }
                  100% { transform: translate(calc(-50% - 4px), -50%); }
                }
                @keyframes float-slow {
                  0% { transform: translateX(-12px); }
                  50% { transform: translateX(12px); }
                  100% { transform: translateX(-12px); }
                }
              `}</style>
            </div>
          )}

          {/* 
            无卡片状态渲染逻辑：
            1. 当cards数组长度为0时，显示"已全部阅读完毕"的状态页面
            2. 使用绝对定位居中展示完成状态的UI
          */}
          {cards.length === 0 ? (
            // 完成状态容器：垂直居中，文本居中
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {/* 成功图标：使用SVG渲染一个圆形勾选标记 */}
              <div className="w-16 h-16 mb-6 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              
              {/* 标题：突出显示已读完所有新闻 */}
              <h3 className="text-xl font-semibold mb-2">真棒，当前热点已阅毕!</h3>
              
              {/* 副标题：提供友好的补充说明 */}
              <p className="text-muted-foreground">今天的热点都看完啦，明天再来看吧！</p>
            </div>
          ) : (
            // 卡片堆叠渲染逻辑：最多显示3张卡片
            cards.slice(0, 3).map((card, index) => (
              // 每张卡片的容器：使用绝对定位实现堆叠效果
              <div
                key={card.title}
                className="absolute inset-0"
                style={{
                  // 垂直方向微小偏移，创造层叠视觉效果
                  transform: `translateY(${index * 8}px)`, 
                  
                  // 根据索引设置层级，确保第一张卡片在最上层
                  zIndex: 3 - index, 
                  
                  // 最后一张卡片略微透明，增加深度感
                  opacity: index === 2 ? 0.3 : 1, 
                  
                  // 卡片宽度递减，模拟远近层次
                  width: `${100 - (index * 4)}%`, 
                  
                  // 水平居中
                  margin: '0 auto'
                }}
              >
                {/* 
                  SwipeCard组件：单个新闻卡片的渲染
                  传递的属性包括：
                  - 标题
                  - 内容摘要
                  - 发布日期
                  - 图片
                  - 网站图标
                  - 原文链接
                  - 是否为顶部卡片
                  - 滑动事件处理
                  - 撤销事件处理
                  - 是否显示撤销按钮
                */}
                <SwipeCard
                  title={card.title}
                  content={card.summary}
                  date={card.publishedDate}
                  image={card.image}
                  favicon={card.favicon}
                  url={card.url}
                  isTop={index === 0}
                  onSwipe={() => handleSwipe(card.title)}
                  onBack={handleUndo}
                  showBack={index === 0 && dismissedCards.length > 0}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* 渲染应用切换器组件 */}
      <AppSwitcher />
    </>
  );
}
