/**
 * 智能URL管理模块
 * 
 * 为Next.js应用提供智能的URL检测和构建功能，特别针对Vercel部署环境优化。
 * 支持自动检测Vercel URL、自定义域名、开发环境等多种场景。
 */

/**
 * URL构建选项接口
 */
interface UrlOptions {
  /** 是否强制使用HTTPS协议 */
  forceHttps?: boolean;
  /** 自定义端口号 */
  port?: number;
}

/**
 * 获取应用的基础URL
 * 
 * 优先级顺序：
 * 1. VERCEL_PROJECT_PRODUCTION_URL - Vercel自定义域名（生产环境）
 * 2. VERCEL_URL - Vercel默认分配的URL
 * 3. BASE_URL - 手动配置的基础URL（向后兼容）
 * 4. localhost:3000 - 开发环境默认值
 * 
 * @param options - URL构建选项
 * @returns 完整的基础URL字符串
 */
export function getBaseUrl(options: UrlOptions = {}): string {
  const { forceHttps = false, port } = options;

  // 1. 优先使用Vercel生产环境的自定义域名
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    const protocol = forceHttps ? 'https' : 'https'; // Vercel自定义域名默认使用HTTPS
    return `${protocol}://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  // 2. 使用Vercel默认分配的URL
  if (process.env.VERCEL_URL) {
    const protocol = forceHttps ? 'https' : 'https'; // Vercel URL默认使用HTTPS
    return `${protocol}://${process.env.VERCEL_URL}`;
  }

  // 3. 向后兼容：使用手动配置的BASE_URL
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }

  // 4. 开发环境默认值
  const protocol = forceHttps ? 'https' : 'http';
  const defaultPort = port || 3000;
  return `${protocol}://localhost:${defaultPort}`;
}

/**
 * 构建完整的API URL
 * 
 * @param path - API路径（如 '/api/news'）
 * @param params - 查询参数对象
 * @param options - URL构建选项
 * @returns 完整的API URL字符串
 */
export function buildApiUrl(
  path: string, 
  params?: Record<string, string | number | boolean | undefined>, 
  options?: UrlOptions
): string {
  try {
    const baseUrl = getBaseUrl(options);
    const url = new URL(path, baseUrl);
    
    // 添加查询参数
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  } catch (error) {
    console.error('Error building API URL:', error);
    // 提供fallback URL
    const fallbackBase = 'http://localhost:3000';
    const fallbackUrl = new URL(path, fallbackBase);
    return fallbackUrl.toString();
  }
}

/**
 * 获取当前环境类型
 * 
 * @returns 环境类型字符串
 */
export function getEnvironment(): 'development' | 'preview' | 'production' {
  // Vercel环境检测
  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV as 'development' | 'preview' | 'production';
  }
  
  // Next.js环境检测
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  
  if (process.env.NODE_ENV === 'development') {
    return 'development';
  }
  
  // 默认为开发环境
  return 'development';
}

/**
 * 检查是否在Vercel环境中运行
 * 
 * @returns 是否在Vercel环境中
 */
export function isVercelEnvironment(): boolean {
  return Boolean(process.env.VERCEL || process.env.VERCEL_URL);
}

/**
 * 获取应用的公开URL（用于分享、SEO等）
 * 
 * 这个函数专门用于需要对外公开的URL，如社交媒体分享、SEO元数据等。
 * 在Vercel环境下会优先使用自定义域名。
 * 
 * @returns 公开访问的URL字符串
 */
export function getPublicUrl(): string {
  return getBaseUrl({ forceHttps: true });
}

/**
 * 验证环境变量配置
 * 
 * 在应用启动时调用此函数来验证必要的环境变量配置
 * 
 * @returns 验证结果和建议
 */
export function validateEnvironmentConfig(): {
  isValid: boolean;
  warnings: string[];
  recommendations: string[];
} {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  const env = getEnvironment();
  const isVercel = isVercelEnvironment();
  
  // 检查生产环境配置
  if (env === 'production' && !isVercel && !process.env.BASE_URL) {
    warnings.push('生产环境下未配置BASE_URL，将使用localhost作为fallback');
    recommendations.push('建议在生产环境中配置BASE_URL环境变量');
  }
  
  // 检查Vercel环境配置
  if (isVercel && !process.env.VERCEL_URL) {
    warnings.push('检测到Vercel环境但未找到VERCEL_URL');
    recommendations.push('检查Vercel部署配置是否正确');
  }
  
  // 检查开发环境配置
  if (env === 'development' && process.env.BASE_URL && !process.env.BASE_URL.includes('localhost')) {
    warnings.push('开发环境下使用了非localhost的BASE_URL');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    recommendations
  };
}

/**
 * 打印环境配置信息（用于调试）
 * 
 * 仅在开发环境下输出详细信息
 */
export function logEnvironmentInfo(): void {
  if (getEnvironment() !== 'development') {
    return;
  }
  
  console.log('🌍 URL Environment Info:');
  console.log('  Environment:', getEnvironment());
  console.log('  Is Vercel:', isVercelEnvironment());
  console.log('  Base URL:', getBaseUrl());
  console.log('  Public URL:', getPublicUrl());
  
  const validation = validateEnvironmentConfig();
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Warnings:', validation.warnings);
  }
  if (validation.recommendations.length > 0) {
    console.info('💡 Recommendations:', validation.recommendations);
  }
}