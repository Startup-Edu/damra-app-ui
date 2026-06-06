import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

// Sonner renders icons inside a wrapper div that inherits --width and grows to
// match the text block height. We use an inline style to hard-lock the wrapper
// to the badge size so it never stretches.
const iconWrapperStyle = { width: "28px", height: "28px", flexShrink: 0, alignSelf: "flex-start" } as const

const icons = {
  success: (
    <span style={iconWrapperStyle} className="flex items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
      <CircleCheckIcon className="size-4 text-emerald-600" strokeWidth={2.5} />
    </span>
  ),
  info: (
    <span style={iconWrapperStyle} className="flex items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200">
      <InfoIcon className="size-4 text-blue-600" strokeWidth={2.5} />
    </span>
  ),
  warning: (
    <span style={iconWrapperStyle} className="flex items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-200">
      <TriangleAlertIcon className="size-4 text-amber-600" strokeWidth={2.5} />
    </span>
  ),
  error: (
    <span style={iconWrapperStyle} className="flex items-center justify-center rounded-full bg-red-50 ring-1 ring-red-200">
      <OctagonXIcon className="size-4 text-red-600" strokeWidth={2.5} />
    </span>
  ),
  loading: (
    <span style={iconWrapperStyle} className="flex items-center justify-center rounded-full bg-neutral-100 ring-1 ring-neutral-200">
      <Loader2Icon className="size-4 animate-spin text-neutral-500" strokeWidth={2.5} />
    </span>
  ),
}

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={icons}
      toastOptions={{
        classNames: {
          toast: [
            "group toast",
            "group-[.toaster]:flex group-[.toaster]:items-start group-[.toaster]:gap-3",
            "group-[.toaster]:bg-white group-[.toaster]:text-neutral-900",
            "group-[.toaster]:border group-[.toaster]:border-neutral-200/80",
            "group-[.toaster]:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.10),0_1px_4px_-1px_rgba(0,0,0,0.06)]",
            "group-[.toaster]:rounded-2xl",
            "group-[.toaster]:p-4",
          ].join(" "),

          // Force Sonner's icon wrapper to stay pinned — !important beats Sonner's inline styles
          icon: [
            "group-[.toast]:![width:28px]",
            "group-[.toast]:![height:28px]",
            "group-[.toast]:![flex-shrink:0]",
            "group-[.toast]:![align-self:flex-start]",
            "group-[.toast]:!mt-0",
          ].join(" "),

          content: "group-[.toast]:flex group-[.toast]:flex-col group-[.toast]:gap-0.5 group-[.toast]:min-w-0",

          title:
            "group-[.toast]:text-[0.8125rem] group-[.toast]:font-semibold group-[.toast]:tracking-[-0.01em] group-[.toast]:text-neutral-900 group-[.toast]:leading-snug",

          description:
            "group-[.toast]:text-[0.8125rem] group-[.toast]:font-normal group-[.toast]:text-neutral-500 group-[.toast]:leading-snug",

          actionButton: [
            "group-[.toast]:bg-neutral-900 group-[.toast]:text-white",
            "group-[.toast]:text-xs group-[.toast]:font-medium",
            "group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5",
            "group-[.toast]:transition-colors group-[.toast]:hover:bg-neutral-700",
          ].join(" "),

          cancelButton: [
            "group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-600",
            "group-[.toast]:text-xs group-[.toast]:font-medium",
            "group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5",
            "group-[.toast]:transition-colors group-[.toast]:hover:bg-neutral-200",
          ].join(" "),

          closeButton: [
            "group-[.toast]:!top-3 group-[.toast]:!right-3",
            "group-[.toast]:size-5 group-[.toast]:rounded-md",
            "group-[.toast]:border-neutral-200 group-[.toast]:bg-white",
            "group-[.toast]:text-neutral-400 group-[.toast]:hover:text-neutral-600",
            "group-[.toast]:transition-colors",
          ].join(" "),
        },
      }}
      {...props}
    />
  )
}

export { Toaster }