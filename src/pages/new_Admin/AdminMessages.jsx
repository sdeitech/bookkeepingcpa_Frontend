import { Mail } from "lucide-react";

export default function AdminMessages() {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Mail className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">Messages</h2>
      <p className="text-muted-foreground mt-1">Coming soon</p>
    </div>
  );
}
