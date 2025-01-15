// 导入Next.js的请求类型定义
import { NextRequest } from 'next/server';
// 导入OpenAI SDK
import { openai } from '@ai-sdk/openai';
// 导入AI流式响应相关工具函数
import { formatDataStreamPart, streamText } from 'ai';
// 导入新闻文章类型定义
import { NewsArticle } from '@/types/newsArticle';
// 导入Redis客户端实例
import redis from '@/modules/redis';
// 导入Upstash的限流工具
import { Ratelimit } from '@upstash/ratelimit';

// 设置API路由的最大执行时间为30秒
export const maxDuration = 30;

// 创建限流器实例:每60秒最多允许5个请求
const ratelimit = new Ratelimit({
    redis, // 使用Redis存储限流数据
    limiter: Ratelimit.fixedWindow(5, '60s'),
});

/**
 * POST请求处理函数 - 获取AI对新闻的分析见解
 * @param req - Next.js的请求对象
 */
export async function POST(req: NextRequest) {
    // 获取客户端IP地址用于限流
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'Unknown IP';
    // 检查该IP是否超出请求限制
    const { success } = await ratelimit.limit(`ai-insight:${ip}`);

    // 如果超出限制,返回429状态码
    if (!success) {
        return new Response('Ratelimited!', { status: 429 });
    }

    // 从请求体中获取新闻源数组
    const { sources }: { sources: NewsArticle[] } = await req.json();

    // 根据新闻源URL生成缓存key
    const sourceUrls = sources.map((source) => source.url);
    const cacheKey = `ai-insights:${sourceUrls.join(',')}`;
    // 尝试从Redis获取缓存的分析结果
    const cached = await redis.get(cacheKey) as string;
    // 如果存在缓存,直接返回缓存的结果
    if (cached) {
        return new Response(formatDataStreamPart('text', cached), {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
        });
    }

    // 构建提示词,指导AI如何分析和总结新闻
    const prompt = `As an expert journalist and storyteller, analyze these articles and create a clear, structured summary in the following format:

    KEY TAKEAWAYS:
    • List 3-4 main points from across all articles
    • Each point should be 1-2 sentences

    MAIN STORY:
    • Break down the story into 4-5 short paragraphs
    • Each paragraph should be 2-3 sentences maximum
    • Use simple, clear language

    KEY FACTS:
    • List 2-3 notable statistics or facts
    • Include sources where relevant

    WHAT'S NEXT:
    • 2-3 bullet points about potential future implications
    • Keep predictions grounded in the source material

    Please maintain journalistic integrity while making the content accessible and easy to scan.

    Source Articles:
    ${sources.map((source) => `URL: ${source.url}\nContent: ${source.text}`).join('\n\n')}`;

    // 获取要使用的OpenAI模型名称,默认使用gpt-4o-mini
    const model = process.env.OPENAI_MODEL_NAME || 'gpt-4o-mini';
    // 使用streamText函数调用OpenAI API,获取流式响应
    const result = await streamText({
        model: openai(model),
        prompt,
        // 当生成完成时,将结果缓存到Redis
        async onFinish({ text }) {
            await redis.set(cacheKey, text);
            // 设置缓存24小时过期
            await redis.expire(cacheKey, 60 * 60 * 24);
        },
    });
    // 返回流式响应
    return result.toDataStreamResponse();
}