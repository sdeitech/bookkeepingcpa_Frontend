import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetTaskByIdQuery, useUpdateTaskMutation, useDeleteTaskMutation, useUpdateTaskStatusMutation, useUploadDocumentMutation } from "@/features/tasks/tasksApi";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DocumentViewerModal } from "@/components/common/DocumentViewerModal";
import { ArrowLeft, Edit, Trash2, Save, X, Upload, FileText, Download, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function StaffTaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";
  const user = useSelector(selectCurrentUser);

  // Fetch task data
  const { data, isLoading, error } = useGetTaskByIdQuery(taskId);
  const task = data?.data;

  // Mutations
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [uploadDocument] = useUploadDocumentMutation();

  // Edit mode state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editStatus, setEditStatus] = useState("");

  // UI state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadingDocType, setUploadingDocType] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Initialize edit state when task loads or edit mode changes
  useEffect(() => {
    if (task && isEditMode) {
      setEditTitle(task.title || "");
      setEditDescription(task.description || "");
      setEditPriority(task.priority || "MEDIUM");
      setEditDueDate(task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "");
      setEditStatus(task.status || "NOT_STARTED");
    }
  }, [task, isEditMode]);

  // Status and priority options
  const statusOptions = [
    { value: "NOT_STARTED", label: "Not Started" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "PENDING_REVIEW", label: "Pending Review" },
    { value: "NEEDS_REVISION", label: "Needs Revision" },
    { value: "COMPLETED", label: "Completed" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const priorityOptions = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "PENDING_REVIEW":
        return <AlertCircle className="h-4 w-4 text-purple-500" />;
      case "NEEDS_REVISION":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "ON_HOLD":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "CANCELLED":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
        return "text-red-600";
      case "HIGH":
        return "text-orange-600";
      case "MEDIUM":
        return "text-yellow-600";
      case "LOW":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const handleBack = () => {
    navigate("/staff/create-task");
  };

  const handleEdit = () => {
    setSearchParams({ mode: "edit" });
    setEditTitle(task.title || "");
    setEditDescription(task.description || "");
    setEditPriority(task.priority || "MEDIUM");
    setEditDueDate(task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "");
    setEditStatus(task.status || "NOT_STARTED");
  };

  const handleCancelEdit = () => {
    setSearchParams({});
  };

  const handleSave = async () => {
    try {
      await updateTask({
        id: taskId,
        body: {
          title: editTitle,
          description: editDescription,
          priority: editPriority,
          dueDate: editDueDate,
        },
      }).unwrap();

      // Update status separately if changed
      if (editStatus !== task.status) {
        await updateTaskStatus({
          id: taskId,
          status: editStatus,
          notes: "Status updated",
        }).unwrap();
      }

      toast.success("Task updated successfully");
      setSearchParams({});
    } catch (error) {
      toast.error("Failed to update task");
      console.error("Update error:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(taskId).unwrap();
      toast.success("Task deleted successfully");
      navigate("/staff/tasks");
    } catch (error) {
      toast.error("Failed to delete task");
      console.error("Delete error:", error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTaskStatus({
        id: taskId,
        status: newStatus,
        notes: `Status changed to ${newStatus}`,
      }).unwrap();
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      await updateTask({
        id: taskId,
        body: { priority: newPriority },
      }).unwrap();
      toast.success("Priority updated");
    } catch (error) {
      toast.error("Failed to update priority");
    }
  };

  const handleFileUpload = async (docType, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/zip',
      'application/x-rar-compressed'
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.zip', '.rar'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast.error("Invalid file type. Please upload PDF, Word, Excel, images, or compressed files only.");
      event.target.value = '';
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      event.target.value = '';
      return;
    }

    setUploadingDocType(docType);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", docType);

    try {
      const result = await uploadDocument({ taskId, formData }).unwrap();
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Show success message after brief delay
      setTimeout(() => {
        toast.success(`${docType.replace(/_/g, ' ')} uploaded successfully`);
        
        // Check if all required documents are now uploaded
        if (result.data?.task?.allRequiredUploaded) {
          toast.success("✅ All required documents uploaded! Task status updated to Pending Review.", {
            duration: 5000,
          });
        }
      }, 300);
    } catch (error) {
      clearInterval(progressInterval);
      toast.error("Failed to upload document");
      console.error("Upload error:", error);
    } finally {
      setTimeout(() => {
        setUploadingDocType(null);
        setUploadProgress(0);
        // Reset file input
        event.target.value = '';
      }, 500);
    }
  };

  const getFilesForDocType = (docType) => {
    if (!task?.documents) return [];
    return task.documents.filter((doc) => doc.documentType === docType);
  };

  const getFileIcon = (fileName, mimeType) => {
    const ext = fileName?.split('.').pop()?.toLowerCase() || '';
    
    if (ext === 'pdf' || mimeType?.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || mimeType?.startsWith('image/')) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    }
    if (['doc', 'docx'].includes(ext) || mimeType?.includes('word')) {
      return <FileText className="h-4 w-4 text-blue-600" />;
    }
    if (['xls', 'xlsx'].includes(ext) || mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) {
      return <FileText className="h-4 w-4 text-green-600" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const assignedToId = task?.assignedTo?._id || task?.assignedTo?.id || task?.assignedTo;
  const canUpload = String(assignedToId || "") === String(user?._id || "");

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Task Not Found</h2>
        <p className="text-muted-foreground">The task you're looking for doesn't exist.</p>
        <Button onClick={handleBack}>Back to Tasks</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button variant="ghost" onClick={handleBack} className="gap-2 self-start">
          <ArrowLeft className="h-4 w-4" /> Back to Tasks
        </Button>
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit} className="gap-2 flex-1 sm:flex-initial">
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button onClick={handleSave} className="gap-2 flex-1 sm:flex-initial">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleEdit} className="gap-2 flex-1 sm:flex-initial">
                <Edit className="h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} className="gap-2 flex-1 sm:flex-initial">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Task Header */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            {isEditMode ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Task description"
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{task.title}</h1>
                <p className="text-sm sm:text-base text-muted-foreground">{task.description}</p>
              </>
            )}
          </div>

          {/* Documents Section */}
          {task.taskType === "DOCUMENT_UPLOAD" && (
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                <h2 className="text-lg font-semibold text-foreground">Required Documents</h2>
                {task.requiredDocuments && task.requiredDocuments.length > 0 && (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const totalRequired = task.requiredDocuments.filter(d => d.isRequired).length;
                      const uploadedRequired = task.requiredDocuments.filter(d => d.isRequired && d.uploaded).length;
                      const allRequiredUploaded = totalRequired === uploadedRequired;
                      
                      return (
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                          allRequiredUploaded 
                            ? "bg-green-100 text-green-700" 
                            : "bg-blue-100 text-blue-700"
                        )}>
                          {allRequiredUploaded ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              All Required Uploaded
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4" />
                              {uploadedRequired}/{totalRequired} Required
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              
              {task.requiredDocuments && task.requiredDocuments.length > 0 ? (
                <div className="space-y-4">
                  {task.requiredDocuments.map((reqDoc, index) => {
                    const files = getFilesForDocType(reqDoc.type);
                    const isUploaded = reqDoc.uploaded;
                    
                    return (
                      <div
                        key={index}
                        className={cn(
                          "border rounded-lg p-3 sm:p-4 transition-all",
                          isUploaded ? "border-green-200 bg-green-50" : "border-gray-200",
                          uploadingDocType === reqDoc.type && "border-primary bg-primary/5 shadow-sm"
                        )}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {isUploaded ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Clock className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                              <h3 className="font-medium text-foreground">
                                {reqDoc.type.replace(/_/g, " ").toUpperCase()}
                                {reqDoc.isRequired && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-muted-foreground">
                                  {reqDoc.isRequired ? "Required" : "Optional"}
                                </p>
                                {files.length > 0 && (
                                  <>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <p className="text-xs font-medium text-primary">
                                      {files.length} {files.length === 1 ? 'file' : 'files'} uploaded
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {canUpload && (
                            <div>
                              <input
                                type="file"
                                id={`upload-${reqDoc.type}`}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar"
                                onChange={(e) => handleFileUpload(reqDoc.type, e)}
                                disabled={uploadingDocType === reqDoc.type}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => document.getElementById(`upload-${reqDoc.type}`).click()}
                                disabled={uploadingDocType === reqDoc.type}
                                className="gap-2 w-full sm:w-auto"
                              >
                                {uploadingDocType === reqDoc.type ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="hidden sm:inline">Uploading...</span>
                                    <span className="sm:hidden">{uploadProgress}%</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4" />
                                    {files.length > 0 ? 'Add More' : 'Upload'}
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Upload Progress Bar */}
                        {uploadingDocType === reqDoc.type && uploadProgress > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Uploading...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-primary h-full transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Uploaded Files List */}
                        {files.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {files.map((file) => (
                              <div
                                key={file._id}
                                className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:border-primary/50 transition-colors"
                              >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {getFileIcon(file.fileName, file.mimeType)}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground truncate">
                                      {file.fileName || "Document"}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                                      {file.fileSize && (
                                        <>
                                          <span>{formatFileSize(file.fileSize)}</span>
                                          <span className="hidden sm:inline">•</span>
                                        </>
                                      )}
                                      <span>
                                        {file.uploadedAt
                                          ? format(new Date(file.uploadedAt), "MMM dd, yyyy")
                                          : ""}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setViewingDocument(file)}
                                  className="gap-2 flex-shrink-0"
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="hidden sm:inline">View</span>
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No documents required for this task.</p>
              )}
            </div>
          )}

          {/* Activity History */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Activity History</h2>
            
            {task.statusHistory && task.statusHistory.length > 0 ? (
              <div className="space-y-4">
                {task.statusHistory.map((activity, index) => (
                  <div key={index} className="flex gap-3 pb-4 border-b last:border-b-0">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(activity.status || "NOT_STARTED")}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Status changed to {activity.status?.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.notes || "No additional notes"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.changedBy?.first_name} {activity.changedBy?.last_name} •{" "}
                        {activity.changedAt
                          ? format(new Date(activity.changedAt), "MMM dd, yyyy 'at' h:mm a")
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No activity history yet.</p>
            )}
          </div>
        </div>

        {/* Right Sidebar - Metadata */}
        <div className="space-y-4 sm:space-y-6">
          {/* Metadata Card */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Task Details</h3>
            
            {/* Status */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Status</p>
              {isEditMode ? (
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Priority */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Priority</p>
              {isEditMode ? (
                <Select value={editPriority} onValueChange={setEditPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={getPriorityColor(option.value)}>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={task.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={getPriorityColor(option.value)}>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Due Date */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Due Date</p>
              {isEditMode ? (
                <Input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
              ) : (
                <p className="text-sm font-medium">
                  {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "-"}
                </p>
              )}
            </div>

            {/* Assigned To */}
            <div>
              <p className="text-xs text-muted-foreground">Assigned To</p>
              <p className="text-sm font-medium">
                {task.assignedTo?.first_name} {task.assignedTo?.last_name}
              </p>
            </div>

            {/* Assigned By */}
            <div>
              <p className="text-xs text-muted-foreground">Assigned By</p>
              <p className="text-sm font-medium">
                {task.assignedBy?.first_name} {task.assignedBy?.last_name}
              </p>
            </div>

            {/* Client */}
            <div>
              <p className="text-xs text-muted-foreground">Client</p>
              <p className="text-sm font-medium">
                {task.clientId?.first_name} {task.clientId?.last_name}
              </p>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm font-medium">
                {task.taskType?.replace(/_/g, " ")}
              </p>
            </div>

            {/* Created Date */}
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">
                {task.createdAt ? format(new Date(task.createdAt), "MMM dd, yyyy") : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        open={!!viewingDocument}
        onOpenChange={(open) => !open && setViewingDocument(null)}
        document={viewingDocument}
        canDelete={false}
      />
    </div>
  );
}
