import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ComingSoon({ title = "Coming Soon", message = "This section is under construction." }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full text-center bg-card border border-border rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-2">{message}</p>
        <Button variant="outline" className="mt-6 gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
