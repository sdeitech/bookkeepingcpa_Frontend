// questionnaire/enterprise/EnterpriseForm.tsx

import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { User, Mail, ArrowRight } from "lucide-react";

const EnterpriseForm = ({ data, setData, onSubmit, error, isLoading }) => {
  const canSubmit =
    data.name.trim() !== "" && data.email.includes("@");

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg p-6 space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <User className="h-4 w-4" />
          Full Name
        </Label>
        <Input
          placeholder="Enter your full name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="h-12"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Mail className="h-4 w-4" />
          Email Address
        </Label>
        <Input
          type="email"
          placeholder="Enter your email address"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          className="h-12"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-sm text-destructive font-medium">Error</p>
          <p className="text-sm text-destructive/80">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>

        <Button
          onClick={onSubmit}
          size="lg"
          className="flex-1"
          disabled={!canSubmit || isLoading}
        >
          {isLoading ? (
            "Submitting..."
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnterpriseForm;
