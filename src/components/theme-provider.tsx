"use client" // 声明这是客户端组件

// 导入必要的依赖
import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

// 导出 useTheme hook 供其他组件使用
export { useTheme }

/**
 * 主题提供者组件
 * @param children - 子组件
 * @param props - 其他主题相关属性
 */
export function ThemeProvider({ 
  children,   // React子组件，表示被主题提供者包裹的所有子组件
  ...props    // 剩余的属性对象，允许传递额外的NextThemesProvider配置
}: ThemeProviderProps) {  // ThemeProviderProps是next-themes库定义的类型接口
  return (
    <NextThemesProvider
      // 使用 class 属性来切换主题
      attribute="class"
      // 设置默认主题为系统主题
      defaultTheme="system"
      // 启用系统主题跟随
      enableSystem
      // 禁用主题切换时的过渡动画
      disableTransitionOnChange
      // 可选的主题列表:
      // - light: 明亮主题
      // - dark: 暗黑主题
      // - system: 跟随系统
      // - sepia: 复古色调
      // - high-contrast: 高对比度
      // - forest: 森林主题
      // - ocean: 海洋主题
      // - aurora: 极光主题
      // - volcanic: 火山主题
      // - cosmos: 宇宙主题
      // - desert: 沙漠主题
      // - rose: 玫瑰主题
      // 定义可用的主题列表，包括多种颜色和风格选择
      themes={['light', 'dark', 'system', 'sepia', 'high-contrast', 'forest', 'ocean', 'aurora', 'volcanic', 'cosmos', 'desert', 'rose']}
      
      // 使用扩展运算符展开剩余的属性配置
      // 这允许用户在使用ThemeProvider组件时传递额外的NextThemesProvider配置参数
      // 例如，可以覆盖默认的主题设置或添加其他自定义属性
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}