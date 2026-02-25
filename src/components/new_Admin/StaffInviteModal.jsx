import { useEffect, useMemo, useState } from "react";
import { useInviteStaffMutation } from "@/features/user/userApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phoneNumber: "",
};

export default function StaffInviteModal({
  open,
  onOpenChange,
  mode = "new",
  initialData = null,
  onSuccess,
}) {
  const [inviteStaff, { isLoading }] = useInviteStaffMutation();
  const [inviteNotice, setInviteNotice] = useState({ type: "", text: "" });
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const title = useMemo(
    () => (mode === "resend" ? "Resend Staff Invite" : "Invite Staff"),
    [mode]
  );

  useEffect(() => {
    if (!open) return;

    setInviteNotice({ type: "", text: "" });
    setErrors({});
    if (mode === "resend" && initialData) {
      setForm({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        email: initialData.email || "",
        phoneNumber: initialData.phoneNumber || initialData.phone || "",
      });
      return;
    }
    setForm(EMPTY_FORM);
  }, [open, mode, initialData]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.first_name.trim()) nextErrors.first_name = "First name is required";
    if (!form.last_name.trim()) nextErrors.last_name = "Last name is required";
    if (!form.email.trim()) nextErrors.email = "Email is required";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      const response = await inviteStaff(form).unwrap();
      const expiry = response?.data?.inviteExpiresAt || response?.inviteExpiresAt || "";
      const successText = "Invite sent successfully";
      setInviteNotice({
        type: "success",
        text: expiry
          ? `${successText}. Expires on ${new Date(expiry).toLocaleString()}.`
          : successText,
      });
      toast.success(successText);
      await onSuccess?.();
    } catch (error) {
      const status = error?.status;
      const backendMessage = error?.data?.message || "";
      const expiry = error?.data?.inviteExpiresAt || error?.data?.data?.inviteExpiresAt || "";

      if (status === 409 && backendMessage === "Invite already sent for this staff member") {
        const duplicateText = expiry
          ? `Invite already pending until ${new Date(expiry).toLocaleString()}`
          : "Invite already pending";
        setInviteNotice({ type: "warning", text: duplicateText });
        toast.warning(duplicateText);
        return;
      }

      setInviteNotice({ type: "error", text: backendMessage || "Failed to send invite" });
      toast.error(backendMessage || "Failed to send invite");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Send an invite email so staff can set their password and activate access.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" name="first_name" value={form.first_name} onChange={onChange} />
              {errors.first_name ? <p className="text-xs text-destructive">{errors.first_name}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" name="last_name" value={form.last_name} onChange={onChange} />
              {errors.last_name ? <p className="text-xs text-destructive">{errors.last_name}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={form.email} onChange={onChange} />
            {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={onChange} />
            {errors.phoneNumber ? <p className="text-xs text-destructive">{errors.phoneNumber}</p> : null}
          </div>

          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "resend" ? "Resend Invite" : "Send Invite"}
          </Button>
        </form>

        {inviteNotice.text ? (
          <div
            className={
              inviteNotice.type === "success"
                ? "rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700"
                : inviteNotice.type === "warning"
                  ? "rounded-md border border-orange-300 bg-orange-50 p-3 text-sm text-orange-700"
                  : "rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            }
          >
            {inviteNotice.text}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
