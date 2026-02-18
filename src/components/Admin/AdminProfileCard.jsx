import { Badge } from "../../components/ui/badge";




export function AdminProfileCard({ name, email, role, status }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Admin Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Name</p>
          <p className="font-medium text-foreground">{name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Email</p>
          <p className="font-medium text-foreground">{email}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Role</p>
          <p className="font-medium text-foreground">{role}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Account Status</p>
          <Badge 
            variant={status === "active" ? "default" : "secondary"}
            className={status === "active" ? "bg-success text-success-foreground" : ""}
          >
            {status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
