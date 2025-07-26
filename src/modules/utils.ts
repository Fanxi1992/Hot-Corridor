// 导入智能URL管理模块
import { buildApiUrl } from '@/lib/url-utils';

/**
 * 生成获取热门新闻的API URL的工具函数
 * 
 * 使用智能URL检测功能，自动适配不同的部署环境：
 * - Vercel环境：自动检测VERCEL_URL和自定义域名
 * - 生产环境：使用BASE_URL环境变量
 * - 开发环境：默认使用localhost:3000
 * 
 * @param categories - 可选的新闻分类参数（如 "technology,politics"）
 * @returns 完整的新闻API请求URL
 */
export const getTopNewsUrl = (categories?: string): string => {
    // 准备查询参数对象
    const params: Record<string, string | undefined> = {};
    
    // 如果传入了分类参数，添加到查询参数中
    if (categories) {
        params.categories = categories;
    }

    // 使用智能URL构建功能生成完整的API URL
    // buildApiUrl会自动：
    // 1. 检测当前环境（Vercel/生产/开发）
    // 2. 选择合适的基础URL
    // 3. 构建完整的URL和查询参数
    // 4. 提供错误处理和fallback机制
    return buildApiUrl('/api/news', params);
};