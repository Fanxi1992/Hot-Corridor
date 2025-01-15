/**
 * 这个路由用于填充最新的新闻文章到新闻源。
 * 它从mediastack API获取最新新闻,并将其存储在Redis缓存中。
 * 理想情况下,这个路由应该由定时任务(cron job)定期调用来更新新闻。
 */

// 导入Next.js的请求和响应类型
import { NextRequest, NextResponse } from 'next/server';
// 导入Redis客户端实例,用于数据缓存
import redis from '@/modules/redis';
// 导入新闻文章的类型定义
import { NewsArticle } from '@/types/newsArticle';
// 导入exa模块的getContents函数,用于抓取文章内容
import { getContents } from '@/modules/exa';

// 定义新闻主题分类数组
const topics = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'];

/**
 * 定义需要排除的URL列表
 * 这些URL可能包含低质量内容、招聘信息等不想展示的内容
 */
const URLS_TO_EXCLUDE = ['ycombinator.com', 'news.ycombinator.com', 'jobs.ashbyhq.com'];

/**
 * GET请求处理函数 - 获取并存储新闻
 * @param req - Next.js的请求对象
 */
export async function GET(req: NextRequest) {
    // 从请求头获取cron任务密钥进行身份验证
    const cronSecret = req.headers.get(process.env.EPIGRAM_SECRET_HEADER_NAME!);
    // 验证密钥是否匹配
    if (cronSecret !== process.env.EPIGRAM_CRON_SECRET) {
        return new NextResponse("Cron secret doesn't match", {
            status: 400,
        });
    }

    // 遍历每个新闻主题分类
    for (const topic of topics) {
        // 调用mediastack API获取该主题的新闻
        const response = await fetch(
            `https://api.mediastack.com/v1/news?access_key=${process.env.MEDIASTACK_API_KEY}&languages=en&countries=us&categories=${topic}&limit=${process.env.PER_TOPIC_NEWS_LIMIT}`
        );
        const data = await response.json();

        // 过滤掉不需要的URL来源的文章
        const articles = data.data.filter((entry: { url: string }) => !URLS_TO_EXCLUDE.includes(new URL(entry.url).hostname));

        // 提取所有文章的URL
        const urls = articles.map((entry: { url: string }) => entry.url);

        // 使用exa服务获取完整的文章内容
        const newsArticles = await getContents(urls);

        // 将原始文章的发布时间复制到新抓取的文章中
        // 因为exa抓取时可能会获取到文章最初的发布日期,可能会很旧
        newsArticles.forEach((article: NewsArticle) => {
            const originalArticle = articles.find((entry: NewsArticle) => entry.url === article.url);
            if (originalArticle) {
                article.publishedDate = originalArticle.published_at;
            }
        });

        // 将处理后的新闻文章存储到Redis中
        // 使用 news:${topic} 作为key,方便按主题获取
        await redis.set(`news:${topic}`, JSON.stringify(newsArticles));
    }

    // 返回成功响应
    return new NextResponse("Populated news successfully", {
        status: 200,
    });
}