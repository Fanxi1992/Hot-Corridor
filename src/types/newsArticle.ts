export type NewsArticle = {
    id: string;
    publishedDate: string;
    title: string;
    url: string;
    text: string;
    summary: string;
    image?: string;
    favicon: string;
    [key: string]: any;  // 允许任何其他额外属性
}