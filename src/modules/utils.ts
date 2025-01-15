// 生成获取热门新闻的API URL的工具函数
// 根据可选的分类参数动态构建请求URL
export const getTopNewsUrl = (categories?: string) => {
    // 创建URLSearchParams实例，用于构建URL查询参数
    // URLSearchParams是浏览器内置对象，方便处理URL参数
    const params = new URLSearchParams();

    // 检查是否传入了分类参数
    // categories是可选参数，可能为undefined
    // 如果传入了分类，将其添加到查询参数中
    if (categories) {
        // append方法将'categories'参数添加到URL查询字符串
        // 例如：categories=technology,politics
        params.append('categories', categories);
    }

    // 构建完整的API请求URL
    // 1. process.env.BASE_URL：从环境变量获取基础URL
    // 2. /api/news：API的具体路径
    // 3. params.toString()：将查询参数转换为字符串
    // 4. 三元运算符处理是否需要添加查询参数
    //    - 如果有参数，添加 ?categories=...
    //    - 如果没有参数，返回不带查询参数的URL
    return `${process.env.BASE_URL}/api/news${params.toString() ? `?${params}` : ''}`;
};