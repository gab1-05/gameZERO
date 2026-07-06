import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface HelpTooltipProps {
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export function HelpTooltip({ content, side = "top" }: HelpTooltipProps) {
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help inline-block ml-1" />
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        <div className="text-xs">{content}</div>
      </TooltipContent>
    </Tooltip>
  );
}