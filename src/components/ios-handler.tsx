'use client';

/**
 * iOS处理器组件（IOSHandler）
 * 
 * 这是一个专门为iOS设备和Web应用优化的客户端组件，主要功能包括：
 * 
 * 1. 动态主题颜色管理
 *    - 根据当前主题（暗黑/浅色）自动调整浏览器状态栏和顶部区域颜色
 *    - 使用meta标签动态更新theme-color，提供更好的视觉一致性
 * 
 * 2. iOS Web应用安全区域处理
 *    - 检测并处理独立模式（Standalone Mode）下的安全区域
 *    - 使用env()变量处理刘海屏和home indicator的布局问题
 *    - 动态设置CSS变量和类名，增强适配性
 * 
 * 3. 主题变化监听
 *    - 使用MutationObserver实时监听主题变化
 *    - 确保主题切换时能即时更新浏览器颜色
 * 
 * 设计目的：
 *  - 提升iOS设备上的Web应用体验
 *  - 解决移动端适配和视觉一致性问题
 *  - 无缝集成Next.js和next-themes主题系统
 */
import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export function IOSHandler() {
  // 获取当前主题状态
  const { theme } = useTheme();

  useEffect(() => {
    // 更新主题颜色的函数，专门针对iOS设备的浏览器和Web应用
    function updateThemeColor() {
      // 通过检查根元素的类名来判断是否为暗黑模式
      // 这是一种跨浏览器的主题检测方法，特别适用于iOS Safari
      const isDark = document.documentElement.classList.contains('dark');
      
      // 根据主题模式选择不同的主题颜色
      // 暗黑模式使用深灰色，浅色模式使用浅灰色
      // 这些颜色与iOS系统的设计语言相协调
      const themeColor = isDark ? '#0a0a0a' : '#f7f7f7';
      
      // 动态更新theme-color meta标签
      // 这个标签会影响移动浏览器的状态栏和顶部区域颜色
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        // 如果meta标签不存在，则动态创建
        meta = document.createElement('meta');
        (meta as HTMLMetaElement).name = 'theme-color';
        document.head.appendChild(meta);
      }
      // 设置主题颜色，确保与当前主题一致
      meta.setAttribute('content', themeColor);
    }

    // 专门处理iOS设备的安全区域（刘海屏、home indicator等）
    function setupIOSSafeArea() {
      // 使用媒体查询检测是否为独立模式（添加到主屏幕的Web应用）
      // window.matchMedia('(display-mode: standalone)')是检测iOS Web App的标准方法
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      if (isStandalone) {
        // 设置CSS变量来处理iOS安全区域
        // env(safe-area-inset-top/bottom)是iOS提供的环境变量，用于处理刘海屏和home indicator
        document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)');
        document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
        
        // 添加特定的CSS类，允许进一步的样式定制
        document.documentElement.classList.add('ios-standalone');
      }
    }

    // 初始化主题颜色和安全区域设置
    updateThemeColor();
    setupIOSSafeArea();

    // 创建一个观察者，监听根元素class属性的变化
    // 这确保了主题切换时能实时更新浏览器主题颜色
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // 只有在class属性变化时才更新主题颜色
        if (mutation.attributeName === 'class') {
          updateThemeColor();
        }
      });
    });

    // 开始观察根元素的class属性变化
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // 组件卸载时断开观察者，防止内存泄漏
    return () => observer.disconnect();
  }, [theme]); // 依赖于theme，确保主题变化时重新执行

  // 返回null，因为这是一个纯副作用组件，不渲染任何UI
  return null;
} 