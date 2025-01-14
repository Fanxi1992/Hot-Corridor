// 导入Next.js的请求类型定义
import { NextRequest } from 'next/server';
// 导入Redis客户端实例,用于数据缓存
import redis from '@/modules/redis';
// 导入新闻文章的类型定义
import { NewsArticle } from '@/types/newsArticle';

/**
 * 工具函数:根据指定的key去重新闻文章
 * @param arr - 新闻文章数组
 * @param key - 用于去重的键名(如title)
 * @returns 去重后的新闻文章数组
 */
const getUniqueArticlesBy = <K extends keyof NewsArticle>(arr: NewsArticle[], key: K) => {
    return arr.filter(
        (article: NewsArticle, index: number, self: NewsArticle[]) =>
            // 保留数组中第一次出现的元素
            index === self.findIndex((t) => t[key] === article[key])
    );
}

/**
 * GET请求处理函数 - 获取新闻列表
 * 这是Next.js的API路由处理函数,当访问/api/news时会调用此函数
 * @param req - Next.js的请求对象
 */
export async function GET(req: NextRequest) {
    // 从URL中获取查询参数
    const { searchParams } = new URL(req.url);
    // 获取categories参数,如果没有则使用默认分类
    const categories = searchParams.get("categories") || "general,technology,science,health";
    // 将分类字符串转换为数组
    const categoryList = categories.split(',');

    // 存储所有新闻文章的数组
    const newsArticles: NewsArticle[] = [];

    // 从Redis中获取每个分类的新闻
    for (const category of categoryList) {
        // 使用news:${category}作为key从Redis获取数据
        const articles = await redis.get(`news:${category}`) as NewsArticle[];
        if (!articles) {
            continue;
        }
        // 将获取的文章添加到总数组中
        newsArticles.push(...articles);
    }

    // 根据标题去重文章
    const uniqueArticles = getUniqueArticlesBy(newsArticles, 'title');

    // 按发布日期降序排序文章
    uniqueArticles.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

    // 只返回前100篇文章
    const topArticles = uniqueArticles.slice(0, 100);

    // 返回JSON格式的响应
    // 设置Content-Type为json
    // Cache-Control允许公共缓存,最大年龄300秒(5分钟)
    return new Response(JSON.stringify(topArticles), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=300" },
    });
}