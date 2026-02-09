// questionnaire/hooks/useProposalSubmission.ts

import { useState } from "react";
import {
  useSubmitQuestionnaireMutation,
  useSendPandaDocMutation,
} from "../../../features/questionnaire/questionnaireApi";



export const useProposalSubmission = () => {
  const [submitQuestionnaire] = useSubmitQuestionnaireMutation();
  const [sendPandaDoc] = useSendPandaDocMutation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submitProposal = async ({
    name,
    email,
    answers,
    recommendedPlan,
  }) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // 1️⃣ Save questionnaire
      const submitResult = await submitQuestionnaire({
        name: name.trim(),
        email: email.trim(),
        answers,
        recommendedPlan,
      }).unwrap();

      // 2️⃣ Send PandaDoc
      await sendPandaDoc({
        document_name: recommendedPlan,
        client_first_name: name.split(" ")[0],
        client_last_name: name.split(" ").slice(1).join(" ") || "",
        client_email: email,
        client_company: "",
        start_date: new Date().toISOString().split("T")[0],
        questionnaireId: submitResult.data.id,
        plan: recommendedPlan,
      }).unwrap();

      return true;
    } catch (err) {
      setError(
        err?.data?.message ||
        err?.message ||
        "Failed to submit proposal request"
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitProposal,
    isSubmitting,
    error,
  };
};
