export function OnboardingProgress() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Onboarding Checklist</h3>
        <span className="text-sm text-muted-foreground">Coming Soon</span>
      </div>
      <p className="text-sm text-muted-foreground">
        The onboarding checklist is being prepared. You will be able to complete your setup here soon.
      </p>
    </div>
  );
}
