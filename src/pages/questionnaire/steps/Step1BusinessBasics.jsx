
import { Label } from "../../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { revenueOptions, supportOptions } from "../../../lib/questionnaire-types";

const Step1BusinessBasics = ({ answers, setAnswers }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Business Basics
        </h2>
        <p className="text-muted-foreground">
          Tell us about your business size and needs.
        </p>
      </div>

      {/* Revenue */}
      <div className="space-y-4">
        <Label className="text-base font-medium">
          What is your estimated or actual annual business revenue?
        </Label>

        <RadioGroup
          value={answers.q1Revenue || ""}
          onValueChange={(value) =>
            setAnswers((prev) => ({ ...prev, q1Revenue: value }))
          }
          className="space-y-3"
        >
          {revenueOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50"
            >
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Support */}
      <div className="space-y-4">
        <Label className="text-base font-medium">
          What level of strategic support are you seeking?
        </Label>

        <RadioGroup
          value={answers.q2Support || ""}
          onValueChange={(value) =>
            setAnswers((prev) => ({ ...prev, q2Support: value }))
          }
          className="space-y-3"
        >
          {supportOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50"
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

export default Step1BusinessBasics;
