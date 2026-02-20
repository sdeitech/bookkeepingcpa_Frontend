// Task statuses - aligned with backend
const TASK_STATUSES = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "NEEDS_REVISION", label: "Needs Revision" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" }
];

// Task priorities - aligned with backend
const TASK_PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" }
];

// Task types - aligned with backend
const TASK_TYPES = [
  { value: "DOCUMENT_UPLOAD", label: "Document Upload" },
  { value: "INTEGRATION", label: "Integration" },
  { value: "ACTION", label: "Action" },
  { value: "REVIEW", label: "Review" }
];

// Integration types - aligned with backend
const INTEGRATION_TYPES = [
  { value: "QUICKBOOKS", label: "QuickBooks" },
  { value: "SHOPIFY", label: "Shopify" },
  { value: "AMAZON", label: "Amazon Seller" }
];

// Action categories - aligned with backend
const ACTION_CATEGORIES = [
  { value: "CLIENT_ACTION", label: "Client Action" },
  { value: "STAFF_ACTION", label: "Staff Action" }
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
    status: "IN_PROGRESS",
    priority: "HIGH",
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
    status: "NOT_STARTED",
    priority: "HIGH",
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
    status: "COMPLETED",
    priority: "MEDIUM",
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
    status: "PENDING_REVIEW",
    priority: "HIGH",
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
    status: "NOT_STARTED",
    priority: "MEDIUM",
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
    status: "IN_PROGRESS",
    priority: "LOW",
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
    status: "COMPLETED",
    priority: "HIGH",
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
    status: "NOT_STARTED",
    priority: "HIGH",
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
  TASK_STATUSES,
  TASK_TYPES,
  INTEGRATION_TYPES,
  ACTION_CATEGORIES
};
