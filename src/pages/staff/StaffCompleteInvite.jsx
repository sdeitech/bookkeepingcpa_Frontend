import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useCompleteStaffInviteMutation } from "@/features/user/userApi";
import { setCredentials } from "@/features/auth/authSlice";
import { PlutifyLogo } from "@/components/PlutifyLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

function getMessage(error) {
  return error?.data?.message || error?.message || "Unable to complete invite";
}

function isExpiredInviteMessage(message = "") {
  const normalized = String(message).toLowerCase();
  return normalized.includes("expired") || normalized.includes("invalid invite") || normalized.includes("invalid token");
}

export default function StaffCompleteInvite() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [completeInvite, { isLoading }] = useCompleteStaffInviteMutation();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
  });
  const [errorText, setErrorText] = useState("");
  const [inviteExpired, setInviteExpired] = useState(false);

  const missingToken = useMemo(() => !token, [token]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errorText) setErrorText("");
    if (inviteExpired) setInviteExpired(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (missingToken) {
      setInviteExpired(true);
      setErrorText("Invite expired. Request a new invite from your admin.");
      return;
    }

    if (!form.password || !form.confirmPassword) {
      setErrorText("Password and confirm password are required.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorText("Passwords do not match.");
      return;
    }

    try {
      const payload = {
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
        first_name: form.first_name || undefined,
        last_name: form.last_name || undefined,
      };

      const result = await completeInvite(payload).unwrap();
      const authData = result?.data || result;
      const authToken = authData?.token;
      const user = authData?.user;

      if (!authToken || !user) {
        throw new Error("Invite completed but auth payload is missing.");
      }

      dispatch(setCredentials({ data: { token: authToken, user } }));
      toast.success("Invite completed successfully");
      navigate("/staff", { replace: true });
    } catch (error) {
      const message = getMessage(error);
      const expired = isExpiredInviteMessage(message);
      setInviteExpired(expired);
      setErrorText(expired ? "Invite expired. Request a new invite from your admin." : message);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 flex flex-col items-center justify-center">
      <header className="w-full max-w-md mb-5 text-center">
        <div className="flex justify-center mb-2">
          <PlutifyLogo />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Staff Invite Setup</h1>
        <p className="text-sm text-muted-foreground">Create your password to access your staff dashboard.</p>
      </header>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Staff Invite</CardTitle>
          <CardDescription>Set your password to activate your staff account.</CardDescription>
        </CardHeader>
        <CardContent>
          {errorText ? (
            <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive flex gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>
                <p>{errorText}</p>
                {inviteExpired ? (
                  <p className="mt-1">
                    Need help? Contact your admin for a fresh invite.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={onChange}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_name">First Name (Optional)</Label>
              <Input id="first_name" name="first_name" value={form.first_name} onChange={onChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name (Optional)</Label>
              <Input id="last_name" name="last_name" value={form.last_name} onChange={onChange} />
            </div>

            <Button className="w-full gap-2" type="submit" disabled={isLoading || missingToken}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Complete Invite
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have access? <Link to="/login" className="text-primary underline">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
