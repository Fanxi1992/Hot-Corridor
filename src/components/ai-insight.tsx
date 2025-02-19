"use client";

import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import { Skeleton } from "@/components/ui/skeleton";

// 修改接口定义,添加content参数
interface AIInsightProps {
  query: string;  // 标题
  content: string; // 内容
}

// 修改组件参数
export function AIInsight({ query, content }: AIInsightProps) {
  // 使用 state 来存储流式返回的内容
  const [streamContent, setStreamContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 保留内容容器的 ref
  const contentRef = useRef<HTMLDivElement>(null);

  // 用来累计流式内容，避免每次都触发渲染
  const accumulatedContentRef = useRef<{ content: string; lastUpdated: number }>({
    content: '',
    lastUpdated: 0,
  });

  useEffect(() => {
    // 重置状态
    setStreamContent('');
    setIsLoading(true);
    setError(null);

    async function fetchAIInsights() {
      try {
        // 修改请求体,同时发送title和content
        const response = await fetch('http://43.156.99.86:8000/api/ai-insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 23422'
          },
          body: JSON.stringify({ 
            query,    // 标题
            content  // 内容
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 获取响应数据的读取器
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        // 用于存储累积的响应内容
        let accumulatedContent = '';

        // 循环读取流式数据
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // 解码二进制数据
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() === '' || !line.startsWith('data: ')) continue;

            try {
              const jsonStr = line.slice(5); // 移除 'data: ' 前缀
              const parsedData = JSON.parse(jsonStr);

              // 处理流式返回的文本
              if (parsedData.text) {
                accumulatedContent += parsedData.text;
                // 更新内容积累的 ref
                accumulatedContentRef.current.content = accumulatedContent;

                // 控制更新频率，每200ms更新一次内容
                if (Date.now() - accumulatedContentRef.current.lastUpdated > 200) {
                  // 如果距离上次更新超过200ms，进行更新
                  setStreamContent(accumulatedContentRef.current.content);
                  accumulatedContentRef.current.lastUpdated = Date.now();
                }
              }
            } catch (parseError) {
              console.error('解析 JSON 出错:', parseError, '行:', line);
              continue;
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : '发生未知错误');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAIInsights();
  }, [query, content]); // 添加content作为依赖

  // 加载状态显示骨架屏
  if (isLoading && !streamContent) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  // 显示错误信息
  if (error) {
    return (
      <div className="text-red-500 mt-6">
        错误: {error}
      </div>
    );
  }

  // 移除容器的滚动相关样式
  return (
    <div 
      ref={contentRef}
      className="ai-insight-content mt-6"
      dangerouslySetInnerHTML={{ __html: marked(streamContent) }}
    />
  );
}
