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
// 这是一个异步函数组件，用于渲染应用的主页
// 使用async关键字表明该组件需要进行异步数据获取操作
export default async function Home() {
  // 获取cookie存储实例
  // cookies()是Next.js提供的服务器端方法，用于读取和管理浏览器cookie
  // await确保异步操作完成后再继续执行
  const cookieStore = await cookies();

  // 从cookie中获取用户关注的主题
  // 使用可选链操作符?.安全地获取"followedTopics"的值
  // 如果cookie不存在，将返回undefined
  const followedTopics = cookieStore.get("followedTopics")?.value;

  // 处理用户关注的主题分类
  // 1. 检查followedTopics是否存在
  // 2. 使用JSON.parse()将字符串转换为数组
  // 3. 使用join(',')将数组转换为逗号分隔的字符串
  // 4. 使用toLowerCase()将所有分类转换为小写，便于后续处理
  // 如果没有关注的主题，categories将为undefined
  const categories = followedTopics && JSON.parse(followedTopics).join(',').toLowerCase();

  // 根据用户关注的分类动态生成新闻API的URL
  // getTopNewsUrl()是一个工具函数，根据分类生成对应的新闻获取地址
  // 如果没有分类，将返回默认的新闻获取URL
  const url = getTopNewsUrl(categories);

  // 发起fetch请求获取新闻数据
  // 1. 使用fetch()方法异步获取远程API数据
  // 2. await确保等待网络请求完成
  // 3. 错误处理：如果网络请求失败，将抛出异常
  const response = await fetch(url);

  // 将响应解析为NewsArticle类型的数组
  // 1. response.json()将响应体转换为JavaScript对象
  // 2. 使用类型注解NewsArticle[]确保数据类型安全
  // 3. await确保JSON解析完成
  const newsArticles: NewsArticle[] = await response.json();

  console.log('newsArticles、cards获取的结果如下：', newsArticles);

  // 返回页面JSX结构
  return (
    // main标签作为主要内容容器
    // 1. relative：相对定位，为子元素提供定位上下文
    // 2. h-screen：设置高度为整个屏幕高度
    // 3. bg-transparent：设置背景透明，允许下层样式或背景显示
    <main className="relative h-screen bg-transparent">
      {/* 
        渲染NewsFeed组件，传入获取到的新闻文章数据
        1. NewsFeed是一个自定义组件，负责展示新闻列表
        2. newsArticles prop将获取的新闻数据传递给组件
        3. 组件内部将根据传入的数据渲染新闻列表
      */}
      <NewsFeed newsArticles={newsArticles} />
    </main>
  );
}