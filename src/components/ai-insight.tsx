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
      {/* 
      AI洞察结果渲染区域：核心功能是将AI生成的分析结果转换为HTML并展示
      
      关键逻辑：
      1. 使用 marked 库将 Markdown 格式的 AI 分析结果转换为 HTML
      2. 通过 dangerouslySetInnerHTML 直接渲染 HTML 内容
      3. 这种方式允许 AI 生成富文本内容，包括标题、列表、强调等格式
      
      安全性注意：
      - dangerouslySetInnerHTML 存在潜在的 XSS 风险
      - 建议在服务端对 AI 生成的内容进行严格的消毒和过滤
      */}
      <div 
        className="ai-insight-content" 
        dangerouslySetInnerHTML={{ __html: marked(completion) }}
      ></div>

      {/* 分隔线：视觉上分隔 AI 分析结果和新闻源信息 */}
      <hr className="my-4 border-muted"/>

      {/* 
      新闻源列表渲染：提供文章分析的信息来源透明度
      
      条件渲染逻辑：
      - 仅在 sources 数组非空时显示
      - 展示获取的新闻源标题和链接
      - 每个新闻源包含网站图标和可点击的标题链接
      
      设计考虑：
      - 使用 not-prose 类避免 Tailwind 排版插件影响布局
      - 小号字体和柔和颜色，不喧宾夺主
      */}
      {sources.length > 0 && (
        <div className="not-prose space-y-3 text-sm text-muted-foreground">
          <p className="font-medium">信息来源：</p>
          {sourcesList}
        </div>
      )}
    </>
  );
}
