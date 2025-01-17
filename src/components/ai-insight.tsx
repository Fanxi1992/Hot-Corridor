"use client";

// 简化导入
import { useCompletion } from "ai/react";
import { useEffect } from "react";
import { marked } from "marked";
import { Skeleton } from "@/components/ui/skeleton";

// 简化组件,只保留 AI 分析功能
export function AIInsight({ query }: { query: string }) {
  // 使用AI补全hook获取分析结果
  const { completion, complete } = useCompletion({
    api: `/api/news/ai-insights?query=${query}`,
  });

  // 组件加载时触发AI分析
  useEffect(() => {
    complete('');
  }, [complete]);

  // 加载状态显示骨架屏
  if (!completion) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  // 只渲染 AI 分析结果
  return (
    <div 
      className="ai-insight-content mt-6" 
      dangerouslySetInnerHTML={{ __html: marked(completion) }}
    />
  );
}
