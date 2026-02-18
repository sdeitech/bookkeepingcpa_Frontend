const TASK_STATUSES = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "blocked", label: "Blocked" }
];
const TASK_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
];
const STAFF_MEMBERS = [
  "Sarah Mitchell",
  "James Carter",
  "Emily Chen",
  "Michael Ross"
];
const MOCK_CLIENTS = [
  { id: "c1", name: "Acme Corp", email: "admin@acme.com", plan: "enterprise" },
  { id: "c2", name: "Bloom Studio", email: "hello@bloom.io", plan: "essential" },
  { id: "c3", name: "Nova Labs", email: "team@novalabs.com", plan: "startup" },
  { id: "c4", name: "Greenfield Inc", email: "info@greenfield.com", plan: "essential" },
  { id: "c5", name: "Pixel Works", email: "contact@pixelworks.co", plan: "startup" }
];
const MOCK_TASKS = [
  {
    id: "t1",
    title: "Complete Q4 Tax Filing",
    description: "Prepare and file quarterly taxes",
    clientId: "c1",
    clientName: "Acme Corp",
    assignedTo: "Sarah Mitchell",
    status: "in_progress",
    priority: "urgent",
    dueDate: "2026-02-10",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-02-01T10:00:00Z"
  },
  {
    id: "t2",
    title: "Reconcile Bank Statements",
    description: "Monthly bank reconciliation",
    clientId: "c2",
    clientName: "Bloom Studio",
    assignedTo: "James Carter",
    status: "not_started",
    priority: "high",
    dueDate: "2026-02-20",
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-02-01T10:00:00Z"
  },
  {
    id: "t3",
    title: "Setup Payroll Integration",
    description: "Connect payroll provider",
    clientId: "c1",
    clientName: "Acme Corp",
    assignedTo: "Emily Chen",
    status: "completed",
    priority: "medium",
    dueDate: "2026-01-30",
    createdAt: "2026-01-10T10:00:00Z",
    updatedAt: "2026-01-28T10:00:00Z"
  },
  {
    id: "t4",
    title: "Upload W-2 Forms",
    description: "Collect and upload employee W-2s",
    clientId: "c3",
    clientName: "Nova Labs",
    assignedTo: "Michael Ross",
    status: "blocked",
    priority: "high",
    dueDate: "2026-02-14",
    createdAt: "2026-01-20T10:00:00Z",
    updatedAt: "2026-02-05T10:00:00Z"
  },
  {
    id: "t5",
    title: "Monthly P&L Report",
    description: "Generate profit & loss statement",
    clientId: "c4",
    clientName: "Greenfield Inc",
    assignedTo: "Sarah Mitchell",
    status: "not_started",
    priority: "medium",
    dueDate: "2026-02-28",
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-02-10T10:00:00Z"
  },
  {
    id: "t6",
    title: "Review Chart of Accounts",
    description: "Audit and clean up chart of accounts",
    clientId: "c5",
    clientName: "Pixel Works",
    assignedTo: "James Carter",
    status: "in_progress",
    priority: "low",
    dueDate: "2026-03-01",
    createdAt: "2026-02-05T10:00:00Z",
    updatedAt: "2026-02-12T10:00:00Z"
  },
  {
    id: "t7",
    title: "Onboarding Document Collection",
    description: "Gather initial documents from client",
    clientId: "c1",
    clientName: "Acme Corp",
    assignedTo: "Emily Chen",
    status: "completed",
    priority: "high",
    dueDate: "2026-01-20",
    createdAt: "2026-01-05T10:00:00Z",
    updatedAt: "2026-01-18T10:00:00Z"
  },
  {
    id: "t8",
    title: "QuickBooks Migration",
    description: "Migrate data to QuickBooks Online",
    clientId: "c2",
    clientName: "Bloom Studio",
    assignedTo: "Michael Ross",
    status: "not_started",
    priority: "urgent",
    dueDate: "2026-02-12",
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-02-01T10:00:00Z"
  }
];
export {
  MOCK_CLIENTS,
  MOCK_TASKS,
  STAFF_MEMBERS,
  TASK_PRIORITIES,
  TASK_STATUSES
};
