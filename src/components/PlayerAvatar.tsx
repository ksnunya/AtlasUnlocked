import { Compass } from "lucide-react";

interface PlayerAvatarProps { size?: "sm" | "md" | "lg"; className?: string }
const sizes = { sm: "h-9 w-9", md: "h-12 w-12", lg: "h-24 w-24" };
export function PlayerAvatar({ size = "md", className = "" }: PlayerAvatarProps) {
  return (
    <div aria-hidden="true" className={`${sizes[size]} grid place-items-center rounded-full border-2 border-[#8fd3d7] bg-[#1d4d51] text-[#f0cd7c] ${className}`}>
      <Compass className="h-3/5 w-3/5" strokeWidth={1.5} />
    </div>
  );
}
