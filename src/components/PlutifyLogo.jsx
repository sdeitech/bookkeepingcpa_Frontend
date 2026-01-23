import { cn } from "@/lib/utils";

const PlutifyLogo = ({ className, variant = 'default' }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl",
        variant === 'light' 
          ? "bg-primary-foreground text-primary" 
          : "bg-primary text-primary-foreground"
      )}>
        P
      </div>
      <span className={cn(
        "text-2xl font-bold tracking-tight",
        variant === 'light' ? "text-primary-foreground" : "text-foreground"
      )}>
        Plutify
      </span>
    </div>
  );
};

export { PlutifyLogo };

