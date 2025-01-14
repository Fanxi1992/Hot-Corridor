// 声明这是一个客户端组件
"use client";

// 导入必要的依赖
import Image from "next/image"; // Next.js的图片组件,用于优化图片加载
import { useCompletion } from "ai/react"; // AI自动补全hook
import { useEffect, useState } from "react"; // React核心hooks
import { marked } from "marked"; // Markdown解析器
import { NewsArticle } from "@/types/newsArticle"; // 新闻文章类型定义
import { Skeleton } from "@/components/ui/skeleton"; // 加载骨架屏组件

// AIInsight组件 - 用于展示AI对新闻的分析见解
// query参数是要分析的新闻标题
export function AIInsight({ query }: { query: string }) {
  // 状态管理
  const [sources, setSources] = useState<NewsArticle[]>([]); // 存储相关新闻源
  const [isLoadingSources, setIsLoadingSources] = useState(true); // 加载状态

  // 使用AI补全hook获取分析结果
  const { completion, complete } = useCompletion({
    api: `/api/news/ai-insights?query=${query}`, // AI分析API端点
    body: {
      sources // 传递新闻源给API
    }
  });

  // 首次加载时获取相关新闻源
  useEffect(() => {
    (async () => {
      const response = await fetch(`/api/news/ai-insights/sources?query=${query}`);
      const data = await response.json();
      setSources(data.sources);
      setIsLoadingSources(false);
    })();
  }, [query]);

  // 当获取到新闻源后,触发AI分析
  useEffect(() => {
    if (sources.length > 0) {
      complete('');
    }
  }, [sources, complete]);

  // 渲染新闻源列表
  const sourcesList = sources.map((source) => (
    <div className="flex items-center gap-2" key={source.url}>
      {/* 显示新闻源网站favicon */}
      <Image
        src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=64`}
        className="w-4 h-4"
        alt=""
        width={64}
        height={64}
      />
      {/* 新闻源链接 */}
      <a
        href={source.url}
        className="hover:text-primary transition-colors"
      >
        {source.title}
      </a>
    </div>
  ))

  // 加载状态显示骨架屏
  if (isLoadingSources && !completion) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  // 渲染AI分析结果和新闻源
  return (
    <>
      {/* 渲染markdown格式的AI分析结果 */}
      <div dangerouslySetInnerHTML={{ __html: marked(completion) }}></div>
      <hr/>
      {/* 渲染新闻源列表 */}
      {sources.length > 0 && <div className="not-prose space-y-3 text-sm text-muted-foreground">
        <p className="font-medium">Sources:</p>
        {sourcesList}
      </div>}
    </>
  );
}
