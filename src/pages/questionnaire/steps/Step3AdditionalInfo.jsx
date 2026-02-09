// questionnaire/steps/Step3AdditionalInfo.tsx

import { Label } from "../../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import {
  cleanupOptions,
  taxOptions,
} from "../../../lib/questionnaire-types";

const Step3AdditionalInfo = ({ answers, setAnswers }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Additional Information
        </h2>
        <p className="text-muted-foreground">
          A few more questions to finalize your recommendation.
        </p>
      </div>

      {/* Q5 – Cleanup */}
      <div className="space-y-4">
        <Label className="text-base font-medium">
          Does your business require a historical clean-up or catch-up of past bookkeeping records?
        </Label>

        <RadioGroup
          value={answers.q5Cleanup || ""}
          onValueChange={(value) =>
            setAnswers((prev) => ({ ...prev, q5Cleanup: value }))
          }
          className="space-y-3"
        >
          {cleanupOptions.map((option) => (
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

      {/* Q6 – Tax */}
      <div className="space-y-4">
        <Label className="text-base font-medium">
          Do you anticipate needing assistance with state/local sales tax or international tax filings?
        </Label>

        <RadioGroup
          value={answers.q6Tax || ""}
          onValueChange={(value) =>
            setAnswers((prev) => ({ ...prev, q6Tax: value }))
          }
          className="space-y-3"
        >
          {taxOptions.map((option) => (
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
    </div>
  );
};

export default Step3AdditionalInfo;
