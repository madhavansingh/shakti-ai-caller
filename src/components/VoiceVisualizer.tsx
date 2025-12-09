import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface VoiceVisualizerProps {
  isActive: boolean;
  className?: string;
}

const VoiceVisualizer = ({ isActive, className }: VoiceVisualizerProps) => {
  const [bars, setBars] = useState<number[]>(Array(12).fill(0.3));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(12).fill(0.3));
      return;
    }

    const interval = setInterval(() => {
      setBars(
        Array(12)
          .fill(0)
          .map(() => 0.2 + Math.random() * 0.8)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-primary transition-all duration-100"
          style={{
            height: `${height * 40}px`,
            opacity: isActive ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
};

export default VoiceVisualizer;
