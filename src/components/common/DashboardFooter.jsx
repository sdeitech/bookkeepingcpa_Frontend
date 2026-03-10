export function DashboardFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="h-12 border-t border-border bg-card px-6 flex items-center justify-between text-xs text-muted-foreground shrink-0">
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground">Plutify</span>
        <span className="text-muted-foreground/60">•</span>
        <span>{`© ${year} All rights reserved.`}</span>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" className="hover:text-foreground transition-colors">Privacy</button>
        <button type="button" className="hover:text-foreground transition-colors">Terms</button>
        <button type="button" className="hover:text-foreground transition-colors">Support</button>
      </div>
    </footer>
  );
}
