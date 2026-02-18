import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MOCK_CLIENTS, STAFF_MEMBERS } from "@/lib/task-types";
import { FileText, Link2, CheckCircle, Edit, ArrowLeft, ArrowRight, Sparkles, Users, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";

const CATEGORIES = [
  { id: "documents", icon: FileText, title: "Upload Documents", desc: "Upload files required" },
  { id: "integration", icon: Link2, title: "Connect Integration", desc: "Connect QuickBooks, Shopify, etc." },
  { id: "action", icon: CheckCircle, title: "Complete Action", desc: "Action item to complete" },
  { id: "custom", icon: Edit, title: "Custom Task", desc: "Create your own task" },
];

const DOC_TYPES = [
  "W-2 Forms (2024)", "Bank Statements (Last 3 months)", "Profit & Loss Statement",
  "Business Receipts", "Tax Return (Previous Year)", "1099 Forms", "Invoices", "Business License",
];

const INTEGRATIONS = ["QuickBooks", "Shopify", "Amazon Seller Central"];

const CLIENT_ACTIONS = [
  "Schedule Consultation Call", "Review Business Information", "Provide Bank Account Details",
  "Complete Onboarding Process", "Update Contact Information", "Sign Engagement Letter",
];

const STAFF_ACTIONS = [
  "Review Client's Financial Records", "Prepare Tax Return for Client", "Reconcile Bank Statements",
  "Follow Up with Client", "Send Reminder to Client", "Generate Monthly Report",
];

export function CreateTaskWizard({ open, onOpenChange, onCreate }) {
  const [step, setStep] = useState(1);
  const [taskTarget, setTaskTarget] = useState(null);
  const [category, setCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [clientId, setClientId] = useState("");
  const [staffMember, setStaffMember] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [customDocType, setCustomDocType] = useState("");
  const [showCustomDoc, setShowCustomDoc] = useState(false);
  const [customAction, setCustomAction] = useState("");
  const [showCustomAction, setShowCustomAction] = useState(false);

  const totalSteps = 4;

  const reset = () => {
    setStep(1); setTaskTarget(null); setCategory(null); setSelectedItem(""); setCustomTitle(""); setCustomDesc("");
    setClientId(""); setStaffMember(""); setPriority("medium"); setDueDate(""); setDescription("");
    setCustomDocType(""); setShowCustomDoc(false); setCustomAction(""); setShowCustomAction(false);
  };

  const handleClose = () => { reset(); onOpenChange(false); };

  const getTaskTitle = () => {
    if (category === "custom") return customTitle;
    return selectedItem || "";
  };

  const handleCreate = () => {
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    if (!getTaskTitle() || !dueDate) return;

    const assignedTo = taskTarget === "staff" ? staffMember : (client?.name || "");

    onCreate({
      title: getTaskTitle(),
      description: description || customDesc || undefined,
      clientId: client?.id || "",
      clientName: client?.name || "",
      assignedTo,
      status: "not_started",
      priority,
      dueDate,
    });
    handleClose();
  };

  const canProceedStep3 = category === "custom" ? customTitle.trim() : selectedItem;

  const canCreate = () => {
    if (!getTaskTitle() || !dueDate) return false;
    if (taskTarget === "staff" && !staffMember) return false;
    if (taskTarget === "client" && !clientId) return false;
    return true;
  };

  const setQuickDate = (days) => {
    setDueDate(format(addDays(new Date(), days), "yyyy-MM-dd"));
  };

  const getStepSubtitle = () => {
    if (step === 1) return "Who is this task for?";
    if (step === 2) return "What type of task do you want to create?";
    if (step === 3 && category === "documents") return "Select Document Type";
    if (step === 3 && category === "integration") return "Select Integration";
    if (step === 3 && category === "action") return "Select Action Type";
    if (step === 3 && category === "custom") return "Create Custom Task";
    if (step === 4) return "Task Details";
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl bg-card max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create New Task — Step {step} of {totalSteps}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{getStepSubtitle()}</p>
        </DialogHeader>

        {/* Step 1: Staff or Client */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => { setTaskTarget("staff"); setStep(2); }}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-center hover:shadow-md",
                taskTarget === "staff" ? "border-primary bg-accent" : "border-border hover:border-primary/40"
              )}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-7 h-7 text-primary" />
              </div>
              <span className="font-semibold text-foreground">For Staff</span>
              <span className="text-xs text-muted-foreground">Assign an internal task to a staff member</span>
            </button>
            <button
              onClick={() => { setTaskTarget("client"); setStep(2); }}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-center hover:shadow-md",
                taskTarget === "client" ? "border-primary bg-accent" : "border-border hover:border-primary/40"
              )}
            >
              <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-success" />
              </div>
              <span className="font-semibold text-foreground">For Client</span>
              <span className="text-xs text-muted-foreground">Create a task for a client to complete</span>
            </button>
          </div>
        )}

        {/* Step 2: Category */}
        {step === 2 && (
          <div className="grid grid-cols-2 gap-3 py-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setCategory(cat.id); setSelectedItem(""); setStep(3); }}
                className={cn(
                  "flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all text-center hover:shadow-md",
                  category === cat.id ? "border-primary bg-accent" : "border-border hover:border-primary/40"
                )}
              >
                <cat.icon className="w-8 h-8 text-primary" />
                <span className="font-semibold text-sm text-foreground">{cat.title}</span>
                <span className="text-xs text-muted-foreground">{cat.desc}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 3A: Documents */}
        {step === 3 && category === "documents" && (
          <div className="space-y-3 py-2">
            <p className="text-sm font-medium text-foreground">Common Documents</p>
            <RadioGroup value={selectedItem} onValueChange={setSelectedItem} className="space-y-2">
              {DOC_TYPES.map((doc) => (
                <label key={doc} className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedItem === doc ? "border-primary bg-accent" : "border-border hover:bg-muted/50"
                )}>
                  <RadioGroupItem value={doc} />
                  <span className="text-sm">{doc}</span>
                </label>
              ))}
            </RadioGroup>
            {!showCustomDoc ? (
              <Button variant="ghost" size="sm" onClick={() => setShowCustomDoc(true)} className="text-primary">
                + Add Custom Document Type
              </Button>
            ) : (
              <Input placeholder="Custom document type..." value={customDocType}
                onChange={(e) => { setCustomDocType(e.target.value); setSelectedItem(e.target.value); }} />
            )}
          </div>
        )}

        {/* Step 3B: Integration */}
        {step === 3 && category === "integration" && (
          <div className="space-y-3 py-2">
            <p className="text-sm font-medium text-foreground">Available Integrations</p>
            <RadioGroup value={selectedItem} onValueChange={setSelectedItem} className="space-y-2">
              {INTEGRATIONS.map((name) => (
                <label key={name} className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedItem === name ? "border-primary bg-accent" : "border-border hover:bg-muted/50"
                )}>
                  <RadioGroupItem value={name} />
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{name}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* Step 3C: Action */}
        {step === 3 && category === "action" && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" /> Client Actions
              </p>
              <RadioGroup value={selectedItem} onValueChange={setSelectedItem} className="space-y-1.5">
                {CLIENT_ACTIONS.map((action) => (
                  <label key={action} className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors",
                    selectedItem === action ? "border-primary bg-accent" : "border-border hover:bg-muted/50"
                  )}>
                    <RadioGroupItem value={action} />
                    <span className="text-sm">{action}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-warning" /> Staff Actions (Internal)
              </p>
              <RadioGroup value={selectedItem} onValueChange={setSelectedItem} className="space-y-1.5">
                {STAFF_ACTIONS.map((action) => (
                  <label key={action} className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors",
                    selectedItem === action ? "border-primary bg-accent" : "border-border hover:bg-muted/50"
                  )}>
                    <RadioGroupItem value={action} />
                    <span className="text-sm">{action}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
            {!showCustomAction ? (
              <Button variant="ghost" size="sm" onClick={() => setShowCustomAction(true)} className="text-primary">
                + Create Custom Action
              </Button>
            ) : (
              <Input placeholder="Custom action..." value={customAction}
                onChange={(e) => { setCustomAction(e.target.value); setSelectedItem(e.target.value); }} />
            )}
          </div>
        )}

        {/* Step 3D: Custom */}
        {step === 3 && category === "custom" && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Task Title *</Label>
              <Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Enter task title..." />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={customDesc} onChange={(e) => setCustomDesc(e.target.value)} placeholder="Task description..." rows={3} />
            </div>
          </div>
        )}

        {/* Step 4: Details */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <div className="bg-accent/50 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Task</p>
                <p className="font-medium text-foreground">{getTaskTitle()}</p>
              </div>
              <span className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full",
                taskTarget === "staff" ? "bg-primary/15 text-primary" : "bg-success/15 text-success"
              )}>
                {taskTarget === "staff" ? "Staff Task" : "Client Task"}
              </span>
            </div>

            {/* Assign To - different based on target */}
            <div className="space-y-2">
              <Label>{taskTarget === "staff" ? "Assign to Staff *" : "Assign to Client *"}</Label>
              {taskTarget === "staff" ? (
                <Select value={staffMember} onValueChange={setStaffMember}>
                  <SelectTrigger><SelectValue placeholder="Select staff member..." /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {STAFF_MEMBERS.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {MOCK_CLIENTS.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        <div>
                          <span className="font-medium">{c.name}</span>
                          <span className="text-muted-foreground ml-2 text-xs">{c.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* If staff task, optionally link a client */}
            {taskTarget === "staff" && (
              <div className="space-y-2">
                <Label>Related Client <span className="text-muted-foreground">(optional)</span></Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {MOCK_CLIENTS.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Priority *</Label>
              <RadioGroup value={priority} onValueChange={setPriority} className="flex gap-3">
                <label className={cn("flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors",
                  priority === "low" ? "border-muted-foreground bg-muted" : "border-border")}>
                  <RadioGroupItem value="low" /> <span className="text-sm">Low</span>
                </label>
                <label className={cn("flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors",
                  priority === "medium" ? "border-warning bg-warning/10" : "border-border")}>
                  <RadioGroupItem value="medium" /> <span className="text-sm">Medium</span>
                </label>
                <label className={cn("flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors",
                  priority === "high" ? "border-destructive bg-destructive/10" : "border-border")}>
                  <RadioGroupItem value="high" /> <span className="text-sm">High</span>
                </label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setQuickDate(3)}>+3 days</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setQuickDate(7)}>+7 days</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setQuickDate(14)}>+14 days</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="Add additional instructions or notes..." rows={3} />
              <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between pt-2 border-t border-border">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          )}
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)} disabled={step === 3 && !canProceedStep3} className="gap-1.5">
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={!canCreate()}>
              Create Task
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
