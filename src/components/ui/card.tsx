import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"






// CardHeader 是一个使用 React.forwardRef 创建的泛型函数组件
// 泛型参数 <HTMLDivElement, React.HTMLAttributes<HTMLDivElement>> 指定了：
// 1. 第一个参数是 ref 的目标类型（HTMLDivElement）
// 2. 第二个参数是组件可接收的 HTML 属性类型

const CardHeader = React.forwardRef<
  // ref 的目标元素类型：div 元素
  HTMLDivElement,
  // 组件可接收的 HTML 属性类型：div 的所有标准 HTML 属性
  React.HTMLAttributes<HTMLDivElement>
>(
  // 解构参数：
  // - className: 可选的自定义 CSS 类名
  // - props: 其他所有传入的 HTML 属性
  // - ref: 转发的引用对象
  ({ className, ...props }, ref) => (
    // 渲染一个 div 元素，并应用以下特性：
    // 1. 使用 ref 转发，允许父组件直接访问 DOM 元素
    // 2. 使用 cn 工具函数组合样式类：
    //    - flex 布局：垂直方向排列
    //    - space-y-1.5：子元素之间垂直间距
    //    - p-6：全方向内边距
    // 3. 透传其他所有 HTML 属性
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
)

// 设置组件的 displayName，便于调试和开发工具识别
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
