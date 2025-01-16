"use client"

// 引入 React 核心库，提供组件和 Hooks 功能
import * as React from "react"

// 从 Radix UI 引入对话框原语组件，这是一个高度可访问和可定制的对话框/弹窗组件库
// SheetPrimitive 实际上是 Radix UI 的 Dialog 组件，用于创建可交互的弹出层
import * as SheetPrimitive from "@radix-ui/react-dialog"

// 引入 class-variance-authority，用于动态生成和管理 CSS 类名的实用工具
// cva: class variance authority 的缩写，允许根据不同变体创建动态类名
// VariantProps: 用于推断变体属性的类型
import { cva, type VariantProps } from "class-variance-authority"

// 从 lucide-react 引入 X 图标，用于关闭按钮
import { X } from "lucide-react"

// 引入自定义的 CSS 类名合并工具函数
import { cn } from "@/lib/utils"

// Sheet 是 SheetPrimitive.Root 的别名，代表整个弹出层的根组件
// Root 组件管理弹出层的整体状态和行为
const Sheet = SheetPrimitive.Root

// SheetTrigger 是触发弹出层打开的组件
// 当用户点击带有 SheetTrigger 的元素时，会打开对应的弹出层
const SheetTrigger = SheetPrimitive.Trigger

// SheetClose 是关闭弹出层的组件
// 点击带有 SheetClose 的元素会关闭弹出层
const SheetClose = SheetPrimitive.Close

// SheetPortal 允许将弹出层渲染到 DOM 树的不同位置
// 通常用于确保弹出层在视觉上正确显示，不受父元素样式的影响
const SheetPortal = SheetPrimitive.Portal

// SheetOverlay 是弹出层的遮罩层组件
// 使用 React.forwardRef 允许父组件传递 ref 引用
const SheetOverlay = React.forwardRef<
  // 指定 ref 的目标类型为 SheetPrimitive.Overlay 的元素引用类型
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  // 指定组件可接收的 props 类型，排除了 ref 相关的属性
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  // 渲染 Radix UI 的 Overlay 组件
  <SheetPrimitive.Overlay
    // 使用 cn 工具函数组合样式类
    // 创建全屏遮罩，背景半透明黑色
    // 添加动画效果：打开/关闭时淡入淡出
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))

// 设置组件的 displayName，便于调试和开发工具识别
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
