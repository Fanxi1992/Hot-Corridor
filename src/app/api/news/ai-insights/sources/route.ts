// 导入Next.js的请求和响应处理模块
import { NextRequest, NextResponse } from 'next/server';
// 导入自定义的内容搜索模块
import { searchContents } from "@/modules/exa";
// 导入Redis客户端实例,用于数据缓存和限流
import redis from '@/modules/redis';
// 导入Upstash的限流工具
import { Ratelimit } from '@upstash/ratelimit';

// 创建限流器实例:每60秒内最多允许5个请求
const ratelimit = new Ratelimit({
    redis, // 使用Redis存储限流数据
    limiter: Ratelimit.fixedWindow(5, '60s'), // 设置时间窗口和请求限制
});

/**
 * GET请求处理函数 - 搜索新闻源
 * 这是Next.js的API路由处理函数,当访问/api/news/ai-insights/sources时会调用
 * @param req - Next.js的请求对象
 */
export async function GET(req: NextRequest) {
    // 获取客户端的真实IP地址(考虑代理转发的情况)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'Unknown IP';
    // 检查该IP是否超出请求限制
    const { success } = await ratelimit.limit(`ai-insight-sources:${ip}`);

    // 如果超出限制,返回429状态码(Too Many Requests)
    if (!success) {
        return new Response('Ratelimited!', { status: 429 });
    }

    // 从URL中解析查询参数
    const { searchParams } = new URL(req.url);
    // 获取搜索关键词
    const query = searchParams.get('query');

    // 如果没有提供搜索关键词,返回400错误
    if (!query) {
        return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }
    // 使用searchContents函数搜索相关内容
    const results = await searchContents(query);
    // 将搜索结果转换为标准格式
    const sources = results.map((result) => {
        return {
            url: result.url,        // 文章URL
            favicon: result.favicon, // 网站图标
            text: result.text,      // 文章内容
            title: result.title,    // 文章标题
        }
    });

    // 返回处理后的搜索结果
    // 设置Cache-Control头,允许公共缓存,最大年龄24小时
    return NextResponse.json({ sources }, {
        headers: {
            'Cache-Control': 'public, max-age=86400',
        }
    });
}