import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TABS = ["General", "Task Templates", "Notifications", "Integrations"];

const SYSTEM_TEMPLATES = [
  { name: "Upload W-2 Forms", category: "Document", used: 24, active: true },
  { name: "Upload Bank Statements", category: "Document", used: 18, active: true },
  { name: "Upload P&L Statement", category: "Document", used: 12, active: true },
  { name: "Upload 1099 Forms", category: "Document", used: 8, active: true },
  { name: "Connect QuickBooks", category: "Integration", used: 15, active: true },
  { name: "Connect Shopify", category: "Integration", used: 6, active: false },
  { name: "Connect Amazon Seller", category: "Integration", used: 3, active: false },
  { name: "Schedule Consultation", category: "Action", used: 20, active: true },
  { name: "Sign Engagement Letter", category: "Action", used: 14, active: true },
  { name: "Complete Onboarding", category: "Action", used: 10, active: true },
  { name: "Review Financial Records", category: "Action", used: 22, active: true },
  { name: "Prepare Tax Return", category: "Action", used: 16, active: true },
];

const categoryColor = {
  Document: "bg-primary/15 text-primary border-primary/30",
  Integration: "bg-success/15 text-success border-success/30",
  Action: "bg-warning/15 text-warning border-warning/30",
};

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("Task Templates");
  const [templates, setTemplates] = useState(SYSTEM_TEMPLATES);

  const toggleTemplate = (idx) => {
    setTemplates(prev => prev.map((t, i) => i === idx ? { ...t, active: !t.active } : t));
  };

  return (
    <div className="flex gap-6 animate-fade-in">
      {/* Tab Nav */}
      <div className="w-48 shrink-0 space-y-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6">
        {activeTab === "Task Templates" && (
          <>
            {/* System Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Templates</CardTitle>
                <CardDescription>Pre-defined templates (cannot be deleted)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Template Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Times Used</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((t, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", categoryColor[t.category])}>{t.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{t.used}</TableCell>
                        <TableCell>
                          <Switch checked={t.active} onCheckedChange={() => toggleTemplate(i)} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Custom Templates */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Custom Templates</CardTitle>
                  <CardDescription>Templates created by your team</CardDescription>
                </div>
                <Button size="sm" className="gap-1.5" onClick={() => toast.info("Template creation coming soon")}>
                  <Plus className="h-4 w-4" /> Create New Template
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground">No custom templates yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first custom template</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab !== "Task Templates" && (
          <Card>
            <CardContent className="flex flex-col items-center py-16">
              <p className="text-lg font-medium text-foreground">{activeTab}</p>
              <p className="text-muted-foreground mt-1">Coming soon</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
