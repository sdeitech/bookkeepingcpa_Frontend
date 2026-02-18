import { AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";



export function AlertBanner({ 
  message, 
  linkText = "Complete Now",
  linkTo = "/dashboard/onboarding" 
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <AlertCircle className="w-4 h-4 text-primary" />
        </div>
        <p className="text-sm text-foreground">
          {message}{" "}
          <Link to={linkTo} className="font-semibold text-primary hover:underline">
            {linkText}
          </Link>
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
