import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetAllClientsQuery, useGetAllStaffQuery } from "@/features/user/userApi";
import { useGetTemplatesQuery } from "@/features/tasks/taskTemplateApi";
import { FileText, Link2, CheckCircle, Edit, ArrowLeft, ArrowRight, Sparkles, Users, UserCheck, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "documents", icon: FileText, title: "Upload Documents", desc: "Upload files required", taskType: "DOCUMENT_UPLOAD" },
  { id: "integration", icon: Link2, title: "Connect Integration", desc: "Connect QuickBooks, Shopify, etc.", taskType: "INTEGRATION" },
  { id: "action", icon: CheckCircle, title: "Complete Action", desc: "Action item to complete", taskType: "ACTION" },
  { id: "custom", icon: Edit, title: "Custom Task", desc: "Create your own task", taskType: null },
];

export function CreateTaskWizard({ open, onOpenChange, onCreate, defaultTarget = null, clientList }) {


  // State
  const [step, setStep] = useState(defaultTarget ? 2 : 1);
  const [taskTarget, setTaskTarget] = useState(defaultTarget);
  const [category, setCategory] = useState(null);
  const [selectedTemplates, setSelectedTemplates] = useState([]); // Changed from single to array
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customTaskType, setCustomTaskType] = useState("ACTION");
  const [clientId, setClientId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  // NEW: Document types state
  const [selectedDocTypes, setSelectedDocTypes] = useState([]); // Array of {type, isCustom, isRequired}
  const [customDocInput, setCustomDocInput] = useState("");

  const totalSteps = 4;


  // Fetch data from APIs
  const { data: templatesData, isLoading: templatesLoading } = useGetTemplatesQuery({ active: true });
  const { data: clientsData, isLoading: clientsLoading } = useGetAllClientsQuery(
    undefined,
    { skip: step < 4 }
  );


  const { data: staffData, isLoading: staffLoading } = useGetAllStaffQuery(
    undefined,
    { skip: defaultTarget === "client" || step < 4 }
  )

  const templates = templatesData?.data?.templates || [];
  const clientsPayload = clientsData?.data;
  const staffPayload = staffData?.data;
  const clients = clientsPayload || []
  const staffMembers = staffPayload?.staffMembers || [];

  const isActiveStaff = (staff) => {
    if (typeof staff?.active === "boolean") return staff.active;
    return true;
  };

  const isActiveClient = (client) => {
    if (typeof client?.active === "boolean") return client.active;
    return true;
  };

  const activeStaffMembers = useMemo(
    () => staffMembers.filter(isActiveStaff),
    [staffMembers]
  );

  const activeClients = useMemo(
    () => clients.filter(isActiveClient),
    [clients]
  );



  const resolvedClients = useMemo(() => {
    if (clientList) {
      return clientList
        .filter(isActiveClient)
        .map(c => ({
          id: c._id || c.id,
          name: `${c.first_name || c.firstName || ""} ${c.last_name || c.lastName || ""}`.trim() || c.name || "Unnamed Client",
          email: c.email,
        }));
    }
    return activeClients.map(c => ({
      id: c._id || c.id,
      name: `${c.first_name || c.firstName || ""} ${c.last_name || c.lastName || ""}`.trim() || c.name || "Unnamed Client",
      email: c.email,
    }));
  }, [clientList, activeClients]);

  // Filter templates by category
  const categoryTemplates = useMemo(() => {
    if (!category || category === "custom") return [];
    const categoryObj = CATEGORIES.find(c => c.id === category);
    return templates.filter(t => t.taskType === categoryObj?.taskType && t.active);
  }, [templates, category]);

  const reset = () => {
    setStep(defaultTarget ? 2 : 1); // skip step 1 if target is preset
    setTaskTarget(defaultTarget);
    setCategory(null);
    setSelectedTemplates([]); // Changed
    setCustomTitle("");
    setCustomDesc("");
    setCustomTaskType("ACTION");
    setClientId("");
    setStaffId("");
    setPriority("MEDIUM");
    setDueDate("");
    setDescription("");
    setSelectedDocTypes([]); // NEW
    setCustomDocInput(""); // NEW
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  // NEW: Document type management functions
  const toggleTemplate = (template) => {
    setSelectedTemplates(prev => {
      const exists = prev.find(t => t._id === template._id);
      if (exists) {
        // Remove template and its document type
        setSelectedDocTypes(prevDocs =>
          prevDocs.filter(doc => doc.type !== template.documentType)
        );
        return prev.filter(t => t._id !== template._id);
      } else {
        // Add template and its document type
        setSelectedDocTypes(prevDocs => [
          ...prevDocs,
          { type: template.documentType, isCustom: false, isRequired: true }
        ]);
        return [...prev, template];
      }
    });
  };

  const toggleDocTypeRequired = (docType, isRequired) => {
    setSelectedDocTypes(prev =>
      prev.map(doc => doc.type === docType ? { ...doc, isRequired } : doc)
    );
  };

  const addCustomDocType = (isRequired = true) => {
    const trimmed = customDocInput.trim();
    if (!trimmed) return;

    if (selectedDocTypes.find(doc => doc.type.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Document type already added");
      return;
    }

    setSelectedDocTypes(prev => [
      ...prev,
      { type: trimmed, isCustom: true, isRequired }
    ]);

    setCustomDocInput("");
  };

  const removeDocType = (docType) => {
    setSelectedDocTypes(prev => prev.filter(doc => doc.type !== docType));
    // Also remove from selected templates if it came from a template
    setSelectedTemplates(prev => prev.filter(t => t.documentType !== docType));
  };

  const getTaskTitle = () => {
    if (category === "custom") return customTitle;
    if (category === "documents" && selectedDocTypes.length > 0) {
      return `Upload ${selectedDocTypes.map(d => d.type).join(", ")}`;
    }
    return selectedTemplates[0]?.name || "";
  };

  const handleCreate = async () => {
    if (!getTaskTitle() || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    // For document upload tasks, require at least one document type
    if (category === "documents" && selectedDocTypes.length === 0) {
      toast.error("Please select at least one document type");
      return;
    }

    // Determine assignedTo based on target
    let assignedToId;
    if (taskTarget === "staff") {
      if (!staffId) {
        toast.error("Please select a staff member");
        return;
      }
      assignedToId = staffId;
    } else {
      if (!clientId) {
        toast.error("Please select a client");
        return;
      }
      assignedToId = clientId;
    }

    // Build task data
    const taskData = {
      title: getTaskTitle(),
      description: description || customDesc || "",
      taskType: category === "custom" ? customTaskType : CATEGORIES.find(c => c.id === category)?.taskType,
      priority: priority,
      dueDate: dueDate,
      assignedTo: assignedToId,
      clientId: taskTarget === "client" ? clientId : (clientId || undefined),
    };

    // Add requiredDocuments for DOCUMENT_UPLOAD tasks
    if (category === "documents" && selectedDocTypes.length > 0) {
      taskData.requiredDocuments = selectedDocTypes;
    }

    // Add type-specific fields for non-document tasks
    if (category !== "documents" && selectedTemplates.length > 0) {
      const template = selectedTemplates[0];
      taskData.templateId = template._id;
      taskData.templateName = template.name;

      if (template.integrationType) {
        taskData.integrationType = template.integrationType;
      }
      if (template.actionCategory) {
        taskData.actionCategory = template.actionCategory;
      }
    }

    try {
      await onCreate(taskData);
      toast.success("Task created successfully");
      handleClose();
    } catch (error) {
      toast.error("Failed to create task");
      console.error("Create task error:", error);
    }
  };

  const canProceedStep3 = category === "custom" ? customTitle.trim() :
    (category === "documents" ? selectedDocTypes.length > 0 : selectedTemplates.length > 0);

  const canCreate = () => {
    if (!getTaskTitle() || !dueDate) return false;
    if (taskTarget === "staff" && !staffId) return false;
    if (taskTarget === "client" && !clientId) return false;
    return true;
  };

  const setQuickDate = (days) => {
    setDueDate(format(addDays(new Date(), days), "yyyy-MM-dd"));
  };

  const getStepSubtitle = () => {
    if (step === 1) return "Who is this task for?";
    if (step === 2) return "What type of task do you want to create?";
    if (step === 3 && category === "documents") return "Select Document Template";
    if (step === 3 && category === "integration") return "Select Integration Template";
    if (step === 3 && category === "action") return "Select Action Template";
    if (step === 3 && category === "custom") return "Create Custom Task";
    if (step === 4) return "Task Details";
    return "";
  };

  useEffect(() => {
    if (open) {
      setStep(defaultTarget ? 2 : 1);
      setTaskTarget(defaultTarget);
    }
  }, [open, defaultTarget]);

  const displayStep = defaultTarget ? step - 1 : step;
  const displayTotal = defaultTarget ? totalSteps - 1 : totalSteps;



  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl bg-card max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create New Task — Step {displayStep} of {displayTotal}
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
                onClick={() => { setCategory(cat.id); setSelectedTemplates([]); setStep(3); }}
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

        {/* Step 3: Template Selection (Documents, Integration, Action) */}
        {step === 3 && category !== "custom" && (
          <div className="space-y-3 py-2">
            {templatesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Loading templates...</span>
              </div>
            ) : categoryTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No templates available for this category</p>
                <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="mt-2">
                  Go Back
                </Button>
              </div>
            ) : (
              <>
                {category === "documents" ? (
                  // DOCUMENT UPLOAD: Multi-select with checkboxes
                  <>
                    <p className="text-sm font-medium text-foreground">
                      Select Document Types ({selectedDocTypes.length} selected)
                    </p>
                    <div className="space-y-2">
                      {categoryTemplates.map((template) => {
                        const isSelected = selectedTemplates.find(t => t._id === template._id);
                        const docType = selectedDocTypes.find(d => d.type === template.documentType);

                        return (
                          <label
                            key={template._id}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                              isSelected ? "border-primary bg-accent" : "border-border hover:bg-muted/50"
                            )}
                          >
                            <Checkbox
                              checked={!!isSelected}
                              onCheckedChange={() => toggleTemplate(template)}
                              className="mt-0.5"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{template.name}</span>
                                {isSelected && docType && (
                                  <Select
                                    value={docType.isRequired ? "required" : "optional"}
                                    onValueChange={(val) => toggleDocTypeRequired(template.documentType, val === "required")}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <SelectTrigger className="h-7 w-[100px] text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover z-50">
                                      <SelectItem value="required">Required</SelectItem>
                                      <SelectItem value="optional">Optional</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                              {template.description && (
                                <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {/* Custom Document Type Input */}
                    <div className="pt-2 border-t border-border">
                      <Label className="text-sm font-medium">
                        Add Custom Document Type
                      </Label>

                      <div className="flex gap-2 mt-2">
                        <Input
                          value={customDocInput}
                          onChange={(e) => setCustomDocInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomDocType(true);
                            }
                          }}
                          placeholder="e.g., Rental Income Proof"
                          className="flex-1"
                        />

                        {/* Required / Optional selector */}
                        <Select defaultValue="required">
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="required">Required</SelectItem>
                            <SelectItem value="optional">Optional</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addCustomDocType(true)}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Selected Document Types as Chips */}
                    {selectedDocTypes.map((doc) => (
                      <div
                        key={doc.type}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border bg-accent border-border"
                      >
                        <span className="font-medium">{doc.type}</span>

                        {/* Required/Optional selector */}
                        <Select
                          value={doc.isRequired ? "required" : "optional"}
                          onValueChange={(val) =>
                            toggleDocTypeRequired(doc.type, val === "required")
                          }
                        >
                          <SelectTrigger className="h-6 w-[95px] text-xs border-none bg-transparent p-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="required">Required</SelectItem>
                            <SelectItem value="optional">Optional</SelectItem>
                          </SelectContent>
                        </Select>

                        <button
                          onClick={() => removeDocType(doc.type)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </>
                ) : (
                  // OTHER CATEGORIES: Single select with radio buttons
                  <>
                    <p className="text-sm font-medium text-foreground">
                      Select a Template ({categoryTemplates.length} available)
                    </p>
                    <RadioGroup
                      value={selectedTemplates[0]?._id}
                      onValueChange={(val) => {
                        const template = categoryTemplates.find(t => t._id === val);
                        setSelectedTemplates(template ? [template] : []);
                      }}
                      className="space-y-2"
                    >
                      {categoryTemplates.map((template) => (
                        <label
                          key={template._id}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                            selectedTemplates[0]?._id === template._id ? "border-primary bg-accent" : "border-border hover:bg-muted/50"
                          )}
                        >
                          <RadioGroupItem value={template._id} className="mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{template.name}</span>
                              {template.usageCount > 0 && (
                                <span className="text-xs text-muted-foreground">Used {template.usageCount}x</span>
                              )}
                            </div>
                            {template.description && (
                              <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 3: Custom Task */}
        {step === 3 && category === "custom" && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Task Title *</Label>
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Enter task title..."
              />
            </div>
            <div className="space-y-2">
              <Label>Task Type *</Label>
              <Select value={customTaskType} onValueChange={setCustomTaskType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="DOCUMENT_UPLOAD">Document Upload</SelectItem>
                  <SelectItem value="INTEGRATION">Integration</SelectItem>
                  <SelectItem value="ACTION">Action</SelectItem>
                  <SelectItem value="REVIEW">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="Task description..."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 4: Details */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <div className="bg-accent/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
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

              {/* Show selected document types for document upload tasks */}
              {category === "documents" && selectedDocTypes.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Required Documents:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedDocTypes.map((doc) => (
                      <span
                        key={doc.type}
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          doc.isRequired
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {doc.type} {!doc.isRequired && "(Optional)"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Assign To */}
            <div className="space-y-2">
              <Label>{taskTarget === "staff" ? "Assign to Staff *" : "Assign to Client *"}</Label>
              {taskTarget === "staff" ? (
                staffLoading ? (
                  <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading staff...
                  </div>
                ) : (
                  <Select value={staffId} onValueChange={setStaffId}>
                    <SelectTrigger><SelectValue placeholder="Select staff member..." /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {activeStaffMembers.map(s => {
                        const fullName = `${s.first_name} ${s.last_name}`.trim();
                        return (
                          <SelectItem key={s._id} value={s._id}>
                            {fullName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )
              ) : (
                clientsLoading ? (
                  <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading clients...
                  </div>
                ) : (
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {
                        resolvedClients.map(c => {
                          return (
                            <SelectItem key={c.id} value={c.id}>
                              <div>
                                <span className="font-medium">{c.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })
                      }
                    </SelectContent>
                  </Select>
                )
              )}
            </div>

            {/* If staff task, optionally link a client */}
            {taskTarget === "staff" && (
              <div className="space-y-2">
                <Label>Related Client <span className="text-muted-foreground">(optional)</span></Label>
                {clientsLoading ? (
                  <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading clients...
                  </div>
                ) : (
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {resolvedClients.map(c => {
                        return (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Priority *</Label>
              <RadioGroup value={priority} onValueChange={setPriority} className="flex gap-3">
                <label className={cn("flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors",
                  priority === "LOW" ? "border-muted-foreground bg-muted" : "border-border")}>
                  <RadioGroupItem value="LOW" /> <span className="text-sm">Low</span>
                </label>
                <label className={cn("flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors",
                  priority === "MEDIUM" ? "border-warning bg-warning/10" : "border-border")}>
                  <RadioGroupItem value="MEDIUM" /> <span className="text-sm">Medium</span>
                </label>
                <label className={cn("flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors",
                  priority === "HIGH" ? "border-destructive bg-destructive/10" : "border-border")}>
                  <RadioGroupItem value="HIGH" /> <span className="text-sm">High</span>
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
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="Add additional instructions or notes..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between pt-2 border-t border-border">
          {step > 1 && !(step === 2 && defaultTarget) ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
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
