import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useGetTemplatesQuery,
  useToggleTemplateMutation,
  useUpdateTemplateMutation,
} from "@/features/tasks/taskTemplateApi";

const TABS = ["General", "Task Templates", "Notifications", "Integrations"];


const SYSTEM_TEMPLATES = [
  { id: "system-basic-task", name: "Basic Task", category: "Document", used: 120, active: true, isSystemTemplate: true, taskType: "DOCUMENT_UPLOAD", defaultPriority: "MEDIUM", defaultDueInDays: 7 },
  { id: "system-email-follow-up", name: "Email Follow-up", category: "Integration", used: 80, active: true, isSystemTemplate: true, taskType: "INTEGRATION", defaultPriority: "MEDIUM", defaultDueInDays: 7 },
  { id: "system-weekly-report", name: "Weekly Report", category: "Action", used: 45, active: false, isSystemTemplate: true, taskType: "ACTION", defaultPriority: "MEDIUM", defaultDueInDays: 7 },
];
const categoryColor = {
  Document: "bg-primary/15 text-primary border-primary/30",
  Integration: "bg-success/15 text-success border-success/30",
  Action: "bg-warning/15 text-warning border-warning/30",
};
const INITIAL_TEMPLATE_FORM = {
  name: "",
  description: "",
  taskType: "DOCUMENT_UPLOAD",
  documentType: "",
  integrationType: "",
  actionCategory: "",
  defaultPriority: "MEDIUM",
  defaultDueInDays: 7,
};

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("Task Templates");
  const [templates, setTemplates] = useState(SYSTEM_TEMPLATES);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState(null);
  const [newTemplate, setNewTemplate] = useState(INITIAL_TEMPLATE_FORM);
  const { data: activeTemplatesData } = useGetTemplatesQuery({ active: true });
  const { data: inactiveTemplatesData } = useGetTemplatesQuery({ active: false });
  const [toggleTemplate] = useToggleTemplateMutation();
  const [createTemplate, { isLoading: isCreatingTemplate }] = useCreateTemplateMutation();
  const [updateTemplate, { isLoading: isUpdatingTemplate }] = useUpdateTemplateMutation();
  const [deleteTemplate, { isLoading: isDeletingTemplate }] = useDeleteTemplateMutation();
  const apiTemplates = useMemo(() => {
    const activeList = Array.isArray(activeTemplatesData?.data?.templates) ? activeTemplatesData.data.templates : [];
    const inactiveList = Array.isArray(inactiveTemplatesData?.data?.templates) ? inactiveTemplatesData.data.templates : [];
    const mergedById = new Map();

    [...activeList, ...inactiveList].forEach((t) => {
      const resolvedId = t._id || t.id || t.templateId;
      if (!resolvedId) return;
      mergedById.set(resolvedId, t);
    });

    return Array.from(mergedById.values()).map((t) => ({
      id: t._id || t.id || t.templateId,
      name: t.name,
      category: t.taskType === "DOCUMENT_UPLOAD" ? "Document" : t.taskType === "INTEGRATION" ? "Integration" : "Action",
      used: t.usageCount || 0,
      active: !!t.active,
      description: t.description || "",
      taskType: t.taskType || "DOCUMENT_UPLOAD",
      isSystemTemplate: !!t.isSystemTemplate,
      documentType: t.documentType || "",
      integrationType: t.integrationType || "",
      actionCategory: t.actionCategory || "",
      defaultPriority: t.defaultPriority || "MEDIUM",
      defaultDueInDays: t.defaultDueInDays || 7,
    }));
  }, [activeTemplatesData, inactiveTemplatesData]);

  useEffect(() => {
    if (apiTemplates.length === 0) return;
    setTemplates((prev) => {
      const prevHasOnlySystem = prev.length > 0 && prev.every((t) => String(t.id).startsWith("system-"));
      if (prevHasOnlySystem) return apiTemplates;

      const mergedById = new Map(prev.map((t) => [t.id, t]));
      apiTemplates.forEach((t) => {
        mergedById.set(t.id, { ...(mergedById.get(t.id) || {}), ...t });
      });
      return Array.from(mergedById.values());
    });
  }, [apiTemplates]);

  const hasApiTemplates = apiTemplates.length > 0;
  const templateRows = templates;
  const systemTemplates = templateRows.filter((t) => t.isSystemTemplate);
  const customTemplates = templateRows.filter((t) => !t.isSystemTemplate);

  const handleToggleTemplate = async (id) => {
    if (!id) {
      toast.error("Invalid template id");
      return;
    }

    const target = templates.find((t) => t.id === id);
    if (!target) return;

    const nextActive = !target.active;
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, active: nextActive } : t)));

    if (hasApiTemplates) {
      try {
        const res = await toggleTemplate({ id }).unwrap();
        toast.success(res?.message || `Template ${nextActive ? "enabled" : "disabled"}`);
      } catch (error) {
        setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, active: target.active } : t)));
        toast.error(error?.data?.message || "Failed to update template status");
      }
      return;
    }
    toast.success(`Template ${nextActive ? "enabled" : "disabled"}`);
  };

  const handleSaveTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.taskType) {
      toast.error("Name and task type are required");
      return;
    }

    if (newTemplate.taskType === "DOCUMENT_UPLOAD" && !newTemplate.documentType.trim()) {
      toast.error("Document type is required");
      return;
    }

    if (newTemplate.taskType === "INTEGRATION" && !newTemplate.integrationType.trim()) {
      toast.error("Integration type is required");
      return;
    }

    if (newTemplate.taskType === "ACTION" && !newTemplate.actionCategory.trim()) {
      toast.error("Action category is required");
      return;
    }

    try {
      const payload = {
        name: newTemplate.name.trim(),
        description: newTemplate.description.trim() || undefined,
        category: newTemplate.taskType,
        taskType: newTemplate.taskType,
        documentType: newTemplate.taskType === "DOCUMENT_UPLOAD" ? newTemplate.documentType.trim() : undefined,
        integrationType: newTemplate.taskType === "INTEGRATION" ? newTemplate.integrationType.trim() : undefined,
        actionCategory: newTemplate.taskType === "ACTION" ? newTemplate.actionCategory.trim() : undefined,
        defaultPriority: newTemplate.defaultPriority,
        defaultDueInDays: Number(newTemplate.defaultDueInDays) || 7,
      };

      if (editingTemplateId) {
        const res = await updateTemplate({ id: editingTemplateId, data: payload }).unwrap();
        toast.success(res?.message || "Template updated successfully");
      } else {
        const res = await createTemplate(payload).unwrap();
        toast.success(res?.message || "Template created successfully");
      }
      setIsCreateOpen(false);
      setEditingTemplateId(null);
      setNewTemplate(INITIAL_TEMPLATE_FORM);
    } catch (error) {
      toast.error(error?.data?.message || `Failed to ${editingTemplateId ? "update" : "create"} template`);
    }
  };

  const openCreateDialog = () => {
    setEditingTemplateId(null);
    setNewTemplate(INITIAL_TEMPLATE_FORM);
    setIsCreateOpen(true);
  };

  const openEditDialog = (template) => {
    setEditingTemplateId(template.id);
    setNewTemplate({
      name: template.name || "",
      description: template.description || "",
      taskType: template.taskType || "DOCUMENT_UPLOAD",
      documentType: template.documentType || "",
      integrationType: template.integrationType || "",
      actionCategory: template.actionCategory || "",
      defaultPriority: template.defaultPriority || "MEDIUM",
      defaultDueInDays: template.defaultDueInDays || 7,
    });
    setIsCreateOpen(true);
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTemplateId) return;
    try {
      const res = await deleteTemplate(deleteTemplateId).unwrap();
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTemplateId));
      toast.success(res?.message || "Template deleted successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete template");
    } finally {
      setDeleteTemplateId(null);
    }
  };

  const isSavingTemplate = isCreatingTemplate || isUpdatingTemplate;


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
                    {systemTemplates.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", categoryColor[t.category])}>{t.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{t.used}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                t.active
                                  ? "bg-success/15 text-success border-success/30"
                                  : "bg-muted text-muted-foreground border-border"
                              )}
                            >
                              {t.active ? "Active" : "Inactive"}
                            </Badge>
                            <Switch checked={t.active} disabled={!t.id} onCheckedChange={() => handleToggleTemplate(t.id)} />
                          </div>
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
                <Button size="sm" className="gap-1.5" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4" /> Create New Template
                </Button>
              </CardHeader>
              <CardContent>
                {customTemplates.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                      <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">No custom templates yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Create your first custom template</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Template Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Toggle</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customTemplates.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-xs", categoryColor[t.category])}>
                              {t.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                t.active
                                  ? "bg-success/15 text-success border-success/30"
                                  : "bg-muted text-muted-foreground border-border"
                              )}
                            >
                              {t.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Switch checked={t.active} disabled={!t.id} onCheckedChange={() => handleToggleTemplate(t.id)} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openEditDialog(t)}>
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-destructive hover:text-destructive"
                                onClick={() => setDeleteTemplateId(t.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>{editingTemplateId ? "Edit Task Template" : "Create Task Template"}</DialogTitle>
                  <DialogDescription>
                    {editingTemplateId ? "Update your existing template details." : "Add a reusable template for your team tasks."}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="template-name">Name</Label>
                    <Input
                      id="template-name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Monthly bookkeeping checklist"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="template-description">Description</Label>
                    <Textarea
                      id="template-description"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional notes for this template"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Task Type</Label>
                    <Select
                      value={newTemplate.taskType}
                      onValueChange={(value) =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          taskType: value,
                          documentType: "",
                          integrationType: "",
                          actionCategory: "",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="DOCUMENT_UPLOAD">Document Upload</SelectItem>
                        <SelectItem value="INTEGRATION">Integration</SelectItem>
                        <SelectItem value="ACTION">Action</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newTemplate.taskType === "DOCUMENT_UPLOAD" && (
                    <div className="grid gap-2">
                      <Label htmlFor="template-document-type">Document Type</Label>
                      <Input
                        id="template-document-type"
                        value={newTemplate.documentType}
                        onChange={(e) => setNewTemplate((prev) => ({ ...prev, documentType: e.target.value }))}
                        placeholder="Bank statement"
                      />
                    </div>
                  )}

                  {newTemplate.taskType === "INTEGRATION" && (
                    <div className="grid gap-2">
                      <Label htmlFor="template-integration-type">Integration Type</Label>
                      <Input
                        id="template-integration-type"
                        value={newTemplate.integrationType}
                        onChange={(e) => setNewTemplate((prev) => ({ ...prev, integrationType: e.target.value }))}
                        placeholder="QuickBooks"
                      />
                    </div>
                  )}

                  {newTemplate.taskType === "ACTION" && (
                    <div className="grid gap-2">
                      <Label htmlFor="template-action-category">Action Category</Label>
                      <Input
                        id="template-action-category"
                        value={newTemplate.actionCategory}
                        onChange={(e) => setNewTemplate((prev) => ({ ...prev, actionCategory: e.target.value }))}
                        placeholder="Follow-up call"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Priority</Label>
                      <Select value={newTemplate.defaultPriority} onValueChange={(value) => setNewTemplate((prev) => ({ ...prev, defaultPriority: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="template-due-days">Default Due In (days)</Label>
                      <Input
                        id="template-due-days"
                        type="number"
                        min={1}
                        value={newTemplate.defaultDueInDays}
                        onChange={(e) => setNewTemplate((prev) => ({ ...prev, defaultDueInDays: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingTemplateId(null);
                      setNewTemplate(INITIAL_TEMPLATE_FORM);
                    }}
                    disabled={isSavingTemplate}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTemplate} disabled={isSavingTemplate}>
                    {isSavingTemplate ? "Saving..." : editingTemplateId ? "Update Template" : "Create Template"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <ConfirmDialog
              open={!!deleteTemplateId}
              onOpenChange={(open) => {
                if (!open) setDeleteTemplateId(null);
              }}
              title="Delete custom template?"
              description="This action cannot be undone. The selected template will be permanently removed."
              confirmLabel={isDeletingTemplate ? "Deleting..." : "Delete"}
              variant="destructive"
              onConfirm={handleDeleteTemplate}
            />
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
