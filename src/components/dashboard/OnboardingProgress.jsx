import { Progress } from "../ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { Link } from "react-router-dom";



export function OnboardingProgress({ steps, currentStep }) {
  const completedCount = steps.filter(s => s.completed).length;
  const progressValue = (completedCount / steps.length) * 100;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Onboarding Checklist</h3>
        <span className="text-sm text-muted-foreground">
          {completedCount} of {steps.length} completed
        </span>
      </div>

      <Progress value={progressValue} className="h-2 mb-6" />

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            {step.completed ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
            <span
              className={
                step.completed
                  ? "text-sm text-muted-foreground line-through"
                  : "text-sm text-foreground"
              }
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {completedCount < steps.length && (
        <Link
          to="/dashboard/onboarding"
          className="block mt-6 text-center text-sm font-medium text-primary hover:underline"
        >
          Continue Onboarding
        </Link>
      )}
    </div>
  );
}
