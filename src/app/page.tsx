// 导入NewsFeed组件，用于显示新闻列表
import NewsFeed from "@/components/news-feed";
// 导入NewsArticle类型定义，用于新闻文章数据的类型检查
import { NewsArticle } from "@/types/newsArticle";
// 导入cookies工具，用于处理Next.js中的cookie操作
import { cookies } from "next/headers";
// 导入获取热门新闻URL的工具函数
import { getTopNewsUrl } from "@/modules/utils";
// 导入Metadata类型，用于定义页面元数据
import { Metadata } from "next";

// 导出页面元数据配置
// 这些配置用于SEO优化和社交媒体分享
export const metadata: Metadata = {
  // 网站标题
  title: "Epigram: Open-Source, Free, and AI-Powered News in Short.",
  // 网站描述
  description:
    "An open-source, AI-powered news app for busy people. Stay updated with bite-sized news, real-time updates, and in-depth analysis. Experience balanced, trustworthy reporting tailored for fast-paced lifestyles in a sleek, user-friendly interface.",
  // Open Graph协议配置，用于Facebook等社交媒体分享时的显示效果
  openGraph: {
    title: "Epigram: Open-Source, Free, and AI-Powered News in Short.",
    description:
      "An open-source, AI-powered news app for busy people. Stay updated with bite-sized news, real-time updates, and in-depth analysis. Experience balanced, trustworthy reporting tailored for fast-paced lifestyles in a sleek, user-friendly interface.",
    images: [{ url: "/static/images/epigram-og.png" }], // 分享时显示的图片
  },
  // Twitter卡片配置，用于Twitter分享时的显示效果
  twitter: {
    card: "summary_large_image", // 大图模式
    title: "Epigram: Open-Source, Free, and AI-Powered News in Short.",
    description:
      "An open-source, AI-powered news app for busy people. Stay updated with bite-sized news, real-time updates, and in-depth analysis. Experience balanced, trustworthy reporting tailored for fast-paced lifestyles in a sleek, user-friendly interface.",
    images: ["/static/images/epigram-og.png"], // Twitter分享图片
  },
};

// 导出默认的首页组件
// 使用async因为需要进行异步数据获取
export default async function Home() {
  // 获取cookie存储实例
  const cookieStore = await cookies();
  // 从cookie中获取用户关注的主题
  const followedTopics = cookieStore.get("followedTopics")?.value;
  // 如果有关注的主题，将其解析并转换为小写的逗号分隔字符串
  const categories = followedTopics && JSON.parse(followedTopics).join(',').toLowerCase();

  // 根据用户关注的分类获取新闻API的URL
  const url = getTopNewsUrl(categories);
  // 发起fetch请求获取新闻数据
  const response = await fetch(url);
  // 将响应解析为NewsArticle类型的数组
  const newsArticles: NewsArticle[] = await response.json();

  // 返回页面JSX结构
  return (
    // main标签作为主要内容容器，设置全屏高度和透明背景
    <main className="relative h-screen bg-transparent">
      {/* 渲染NewsFeed组件，传入获取到的新闻文章数据 */}
      <NewsFeed newsArticles={newsArticles} />
    </main>
  );
}