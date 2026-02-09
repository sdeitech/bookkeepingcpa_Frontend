

import { useState } from "react";
import { useSubmitQuestionnaireMutation } from "../../../features/questionnaire/questionnaireApi";

export const useEnterpriseFlow = () => {
  const [step, setStep] = useState("FORM");
  const [data, setData] = useState({ name: "", email: "" });
  const [error, setError] = useState(null);

  const [submitQuestionnaire, { isLoading }] =
    useSubmitQuestionnaireMutation();

  const submitForm = async (answers) => {
    try {
      setError(null);

      await submitQuestionnaire({
        name: data.name.trim(),
        email: data.email.trim(),
        answers,
        recommendedPlan: "enterprise",
      }).unwrap();

      setStep("CALENDLY");
    } catch (err) {
      setError(
        err?.data?.message ||
        err?.message ||
        "Failed to submit consultation request"
      );
    }
  };

  const calendlyUrl = () => {
    const base = import.meta.env.VITE_CALENDLY_EVENT_URL;
    if (!base) return "";

    const params = new URLSearchParams({
      name: data.name,
      email: data.email,
      a1: "Enterprise Plan",
    });

    return `${base}?${params.toString()}`;
  };

  return {
    step,
    data,
    setData,
    error,
    isLoading,
    submitForm,
    calendlyUrl,
  };
};
