// 导入Next.js的请求类型定义
import { NextRequest } from 'next/server';
// 导入Redis客户端实例,用于数据缓存
import redis from '@/modules/redis';
// 导入新闻文章的类型定义
import { NewsArticle } from '@/types/newsArticle';

/**
 * 工具函数：根据指定的键去重新闻文章数组
 * 
 * 这是一个泛型函数，用于去除数组中重复的新闻文章
 * 
 * @param arr - 原始新闻文章数组
 * @param key - 用于去重的键名（例如 'title'）
 * @returns 去重后的新闻文章数组
 * 
 * 工作原理详解：
 * 1. 使用 filter() 方法遍历整个数组
 * 2. 对于每篇文章，检查其在数组中的索引位置
 * 3. 只保留第一次出现的文章，后续重复项会被过滤掉
 * 
 * 举例说明：
 * 假设有以下新闻文章数组：
 * [
 *   { title: "AI革命", publishedDate: "2023-01-01" },
 *   { title: "区块链发展", publishedDate: "2023-02-01" },
 *   { title: "AI革命", publishedDate: "2023-03-01" }
 * ]
 * 
 * 使用 getUniqueArticlesBy(articles, 'title') 后，结果将是：
 * [
 *   { title: "AI革命", publishedDate: "2023-01-01" },
 *   { title: "区块链发展", publishedDate: "2023-02-01" }
 * ]
 * 
 * 注意：保留的是数组中第一次出现的文章
 */
const getUniqueArticlesBy = <K extends keyof NewsArticle>(arr: NewsArticle[], key: K) => {
    return arr.filter(
        // 使用 filter 方法进行去重
        // article: 当前正在处理的文章
        // index: 当前文章在数组中的索引
        // self: 原始数组
        (article: NewsArticle, index: number, self: NewsArticle[]) =>
            // 关键去重逻辑：只保留第一次出现的元素
            // findIndex 返回第一个匹配的元素的索引
            // 如果当前元素的索引 === 第一次出现的索引，则保留
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
    const categories = searchParams.get("categories") || "BTCETH,erjifenxi,yijilumao,lianshangwakuang,pumpmeme,universe";
    // 将分类字符串转换为数组
    const categoryList = categories.split(',');

    // 存储所有新闻文章的数组
    const newsArticles: NewsArticle[] = [];
    // 遍历每个请求的新闻分类，从Redis缓存中获取新闻文章
    for (const category of categoryList) {
        // 使用动态key `news:${category}` 从Redis获取特定分类的新闻数据
        // 例如：news:technology, news:general 等
        const articles = await redis.get(`news:${category}`) as NewsArticle[];
        
        // 如果该分类没有缓存的文章，跳过当前分类继续下一个
        // 这确保了即使某个分类没有新闻，程序也能继续执行
        if (!articles) {
            continue;
        }
        
        // 使用扩展运算符 `...` 将当前分类的所有文章添加到总文章数组中
        // push(...articles) 等同于将数组articles的每一个元素单独添加到newsArticles中
        // 这样可以将不同分类的文章合并到一个大数组里
        newsArticles.push(...articles);
    }

    // 使用自定义的去重函数，根据文章标题去除重复文章
    // 这一步确保即使不同分类可能有相同的文章，title是唯一的，是经过处理之后的
    const uniqueArticles = getUniqueArticlesBy(newsArticles, 'title');

    // 对去重后的文章按发布日期进行降序排序
    // 使用 Date().getTime() 将日期转换为时间戳，便于比较
    // b - a 表示最新的文章排在前面
    // uniqueArticles.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

    // 限制返回的文章数量为最新的100篇
    // slice(0, 100) 表示取数组的前100个元素
    // 这样可以防止返回过多的文章，保持接口响应的轻量和高效
    // 根据数组长度决定返回全部还是随机100篇文章
    const topArticles = uniqueArticles.length <= 100 
        ? uniqueArticles 
        : Array.from({ length: 100 }, () => uniqueArticles[Math.floor(Math.random() * uniqueArticles.length)]);

    // 返回JSON格式的响应
    // 设置Content-Type为json
    // Cache-Control允许公共缓存,最大年龄300秒(5分钟)
    return new Response(JSON.stringify(topArticles), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=300" },
    });
}