// 声明这是一个客户端组件
"use client";

// 导入所需的组件和类型
import { SwipeCard } from "@/components/swipe-card"; // 导入可滑动卡片组件
import { useState, useEffect } from "react"; // 导入React Hooks
import AppSwitcher from "@/components/AppSwitcher"; // 导入应用切换器组件
import { NewsArticle } from "@/types/newsArticle"; // 导入新闻文章类型定义
import { ArrowLeftRight } from "lucide-react"; // 导入左右箭头图标
import { cn } from "@/lib/utils"; // 导入工具函数,用于合并className

// 定义NewsFeed组件,接收新闻文章数组作为props
export default function NewsFeed({ newsArticles }: { newsArticles: NewsArticle[] }) {
  // 定义状态管理
  const [cards, setCards] = useState(newsArticles); // 当前显示的卡片
  const [dismissedCards, setDismissedCards] = useState<NewsArticle[]>([]); // 已划走的卡片
  const [showTip, setShowTip] = useState(false); // 是否显示提示
  const [isFading, setIsFading] = useState(false); // 提示是否正在淡出

  // 组件加载时检查是否需要显示滑动提示
  useEffect(() => {
    const hasSeenTip = localStorage.getItem('hasSeenSwipeTip');
    if (!hasSeenTip) {
      setShowTip(true);
      localStorage.setItem('hasSeenSwipeTip', 'true');
    }
  }, []);

  // 处理卡片滑动事件
  const handleSwipe = (id: string) => {
    // 找到被滑动的卡片
    const dismissedCard = cards.find(card => card.id === id);
    // 从当前卡片中移除
    setCards((cards) => cards.filter((card) => card.id !== id));
    // 添加到已划走的卡片列表
    if (dismissedCard) {
      setDismissedCards(prev => [dismissedCard, ...prev]);
    }
    // 开始提示淡出动画
    setIsFading(true);
    // 动画结束后隐藏提示
    setTimeout(() => {
      setShowTip(false);
      localStorage.setItem('hasSeenSwipeTip', 'true');
    }, 500);
  };

  // 处理撤销操作
  const handleUndo = () => {
    if (dismissedCards.length > 0) {
      // 取出最后一张划走的卡片
      const [lastDismissed, ...remainingDismissed] = dismissedCards;
      setDismissedCards(remainingDismissed);
      // 将卡片放回显示列表
      setCards(prev => [lastDismissed, ...prev]);
    }
  };

  return (
    <>
      {/* 主容器 */}
      <div className="fixed inset-0 pt-4 pb-10 px-4">
        <div className="relative w-full max-w-[400px] mx-auto h-full perspective-1000">
          {/* 滑动提示UI */}
          {showTip && cards.length > 0 && (
            <div className={cn(
              "absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
              "text-foreground px-5 py-3 rounded-xl",
              "flex flex-col items-center gap-1.5",
              "shadow-lg ring-1 ring-foreground/10",
              "transition-all duration-500",
              "animate-[float_8s_ease-in-out_infinite]",
              "bg-background/40 backdrop-blur-xl",
              isFading && "opacity-0"
            )}>
              <div className="animate-[float-slow_32s_linear_infinite] icon-container flex items-center justify-center">
                <ArrowLeftRight className="w-7 h-7 text-foreground/70" />
              </div>
              <span className="text-sm text-center font-medium text-foreground/90">Swipe cards to explore</span>
              {/* 定义动画关键帧 */}
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

          {/* 无卡片时显示完成状态 */}
          {cards.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 mb-6 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">You have caught up with all news for now.</p>
            </div>
          ) : (
            // 显示卡片堆叠效果
            cards.slice(0, 3).map((card, index) => (
              <div
                key={card.id}
                className="absolute inset-0"
                style={{
                  transform: `translateY(${index * 8}px)`, // 堆叠偏移
                  zIndex: 3 - index, // 控制层级
                  opacity: index === 2 ? 0.3 : 1, // 最后一张卡片透明度
                  width: `${100 - (index * 4)}%`, // 卡片宽度递减
                  margin: '0 auto'
                }}
              >
                {/* 渲染滑动卡片组件 */}
                <SwipeCard
                  title={card.title}
                  content={card.summary}
                  date={card.publishedDate}
                  image={card.image}
                  favicon={card.favicon}
                  url={card.url}
                  isTop={index === 0}
                  onSwipe={() => handleSwipe(card.id)}
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
