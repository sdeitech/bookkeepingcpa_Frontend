// questionnaire/steps/Step2BusinessDetails.tsx

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

import {
  customizationOptions,
  structureOptions,
} from "../../../lib/questionnaire-types";

const Step2BusinessDetails = ({ answers, setAnswers }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Business Details
        </h2>
        <p className="text-muted-foreground">
          Help us understand your specific requirements.
        </p>
      </div>

      {/* Q3 – Customization */}
      <div className="space-y-4">
        <Label className="text-base font-medium">
          Does your business require a customized or specialized accounting solution?
        </Label>

        <RadioGroup
          value={answers.q3Customization || ""}
          onValueChange={(value) =>
            setAnswers((prev) => ({ ...prev, q3Customization: value }))
          }
          className="space-y-3"
        >
          {customizationOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Q4 – Business Structure */}
      <div className="space-y-4">
        <Label className="text-base font-medium">
          What is your current legal business structure?
        </Label>

        <Select
          value={answers.q4Structure || ""}
          onValueChange={(value) =>
            setAnswers((prev) => ({ ...prev, q4Structure: value }))
          }
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select your business structure" />
          </SelectTrigger>

          <SelectContent>
            {structureOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default Step2BusinessDetails;
