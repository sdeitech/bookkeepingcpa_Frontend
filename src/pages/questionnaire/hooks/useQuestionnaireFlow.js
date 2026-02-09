// questionnaire/hooks/useQuestionnaireFlow.ts

import { useState } from "react";
import {
  initialAnswers,
  recommendPlan,
  planDetails,
} from "../../../lib/questionnaire-types";

const TOTAL_STEPS = 3;

export const useQuestionnaireFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState(initialAnswers);
  const [recommendedPlan, setRecommendedPlan] = useState(null);

  // Progress %
  const progress = recommendedPlan
    ? 100
    : (currentStep / TOTAL_STEPS) * 100;

  // Validation per step
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!answers.q1Revenue && !!answers.q2Support;
      case 2:
        return !!answers.q3Customization && !!answers.q4Structure;
      case 3:
        return !!answers.q5Cleanup && !!answers.q6Tax;
      default:
        return false;
    }
  };

  const next = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
    } else {
      setRecommendedPlan(recommendPlan(answers));
    }
  };

  const back = () => {
    if (recommendedPlan) {
      setRecommendedPlan(null);
    } else {
      setCurrentStep((s) => Math.max(1, s - 1));
    }
  };

  return {
    // state
    currentStep,
    answers,
    recommendedPlan,
    progress,
    planDetails,

    // setters
    setAnswers,
    setRecommendedPlan,

    // actions
    canProceed,
    next,
    back,
  };
};
