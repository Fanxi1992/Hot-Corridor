"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

// AvatarImage 组件：用于渲染头像图片的核心组件
// 使用 React.forwardRef 允许父组件传递 ref 引用到底层 DOM 元素
const AvatarImage = React.forwardRef<
  // 指定 ref 的类型为 Radix UI 的 Image 组件的元素引用类型
  React.ElementRef<typeof AvatarPrimitive.Image>,
  // 指定组件可接收的 props 类型，排除了 ref 相关的属性
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  // 使用 Radix UI 提供的 Image 原语组件渲染图片
  <AvatarPrimitive.Image
    // 转发 ref，允许直接操作图片元素
    ref={ref}
    
    // 使用 cn 工具函数组合样式类
    // aspect-square: 确保图片保持正方形比例
    // h-full w-full: 图片高度和宽度填充整个父容器
    // 额外的 className 允许外部自定义样式
    className={cn("aspect-square h-full w-full", className)}
    
    // 透传其他所有图片属性（如 src, alt 等）
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
