import React from "react"

interface PushableButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function PushableButton({ children, onClick, className }: PushableButtonProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer relative rounded-xl bg-primary/70 px-0 py-0 outline-offset-4 transition-transform active:translate-y-0.5 ${className}`}
    >
      <span
        className="block rounded-xl bg-primary px-10 py-3 text-xl text-white transform -translate-y-1.5 transition-transform duration-100 active:-translate-y-0.5"
      >
        <div className="flex justify-center items-center gap-4">
          {children}
        </div>
       
      </span>
    </div>
  )
}
