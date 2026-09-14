import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The Al-Saedy Polyclinic mark. Drop the brand PNG at `public/logo-mark.png`;
 * until then a navy/red monogram in the same proportions stands in.
 */
function BrandMark({ className, ...props }: React.ComponentProps<"span">) {
  const [imageFailed, setImageFailed] = React.useState(false)
  return (
    <span
      className={cn("flex size-[26px] items-center justify-center", className)}
      {...props}
    >
      {imageFailed ? (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-full">
          <rect x="1" y="1" width="22" height="22" rx="3" fill="#102B4E" />
          <path d="M6 17 12 6l6 11h-3l-3-6-3 6z" fill="#fff" />
          <circle cx="12" cy="15.5" r="1.6" fill="#ED1C24" />
        </svg>
      ) : (
        <img
          src="/logo-mark.png"
          alt=""
          className="size-full object-contain"
          onError={() => setImageFailed(true)}
        />
      )}
    </span>
  )
}

export { BrandMark }
