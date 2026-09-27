import * as React from "react"
import { Edit, Trash2, Eye, Settings, Key, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type ActionType = "edit" | "delete" | "view" | "setting" | "key" | "info"

export interface ActionButtonProps extends React.ComponentProps<typeof Button> {
  actionType: ActionType
  tooltip?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  tooltipSide?: "top" | "bottom" | "left" | "right"
}

const actionConfig = {
  edit: {
    icon: Edit,
    defaultTooltip: "Edit",
    className: "text-blue-500 hover:text-blue-600 hover:bg-blue-500/5 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-500/10",
  },
  delete: {
    icon: Trash2,
    defaultTooltip: "Delete",
    className: "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
  },
  view: {
    icon: Eye,
    defaultTooltip: "View",
    className: "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/5 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-500/10",
  },
  setting: {
    icon: Settings,
    defaultTooltip: "Settings",
    className: "text-muted-foreground hover:text-foreground hover:bg-accent",
  },
  key: {
    icon: Key,
    defaultTooltip: "Permissions",
    className: "text-amber-500 hover:text-amber-600 hover:bg-amber-500/5 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-500/10",
  },
  info: {
    icon: Info,
    defaultTooltip: "Info",
    className: "text-sky-500 hover:text-sky-600 hover:bg-sky-500/5 dark:text-sky-400 dark:hover:text-sky-300 dark:hover:bg-sky-500/10",
  },
}

export function ActionButton({
  actionType,
  tooltip,
  icon: CustomIcon,
  tooltipSide = "top",
  className,
  variant = "ghost",
  size = "icon",
  disabled,
  ref,
  ...props
}: ActionButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const config = actionConfig[actionType]
  if (!config) {
    console.warn(`[ActionButton] Invalid actionType: "${actionType}"`)
  }

  const IconComponent = CustomIcon || config?.icon || Info
  const tooltipText = tooltip ?? config?.defaultTooltip ?? ""

  const buttonElement = (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      disabled={disabled}
      aria-label={typeof tooltipText === "string" && tooltipText ? tooltipText : actionType}
      className={cn(
        "h-8 w-8 transition-[transform,background-color,color] duration-160 ease-[var(--ease-out)] active:scale-[0.97]",
        config?.className,
        className
      )}
      {...props}
    >
      <IconComponent className="h-3.5 w-3.5" />
    </Button>
  )

  if (!tooltipText) {
    return buttonElement
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {buttonElement}
      </TooltipTrigger>
      <TooltipContent
        side={tooltipSide}
        className="text-[10px] py-1 px-2 font-medium"
      >
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  )
}
