import { cn } from "@/lib/utils"; // Adjust the relative path to match your project structure

function Skeleton({ className, ...props }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props}></div>
  );
}

export {
  Skeleton
};
