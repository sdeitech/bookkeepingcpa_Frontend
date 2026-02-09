import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlutifyLogo } from "../../components/PlutifyLogo";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../../components/ui/dialog";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    User,
    Mail,
    Lock,
} from "lucide-react";

import Step1BusinessBasics from "./steps/Step1BusinessBasics";
import Step2BusinessDetails from "./steps/Step2BusinessDetails";
import Step3AdditionalInfo from "./steps/Step3AdditionalInfo";

import { useQuestionnaireFlow } from "./hooks/useQuestionnaireFlow";
import { useProposalSubmission } from "./hooks/useProposalSubmission";
import EnterpriseFlow from "./enterprise/EnterpriseFlow";

import { planDetails } from "../../lib/questionnaire-types";

const TOTAL_STEPS = 3;

const Questionnaire = () => {
    const navigate = useNavigate();

    const {
        currentStep,
        answers,
        setAnswers,
        recommendedPlan,
        progress,
        canProceed,
        next,
        back,
    } = useQuestionnaireFlow();

    const {
        submitProposal,
        isSubmitting,
        error: submitError,
    } = useProposalSubmission();

    // UI-only state
    const [showProposalForm, setShowProposalForm] = useState(false);
    const [proposalData, setProposalData] = useState({ name: "", email: "" });
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const canSubmitProposal =
        proposalData.name.trim() !== "" &&
        proposalData.email.trim().includes("@");

    const handleSubmitProposal = async () => {
        const success = await submitProposal({
            name: proposalData.name,
            email: proposalData.email,
            answers,
            recommendedPlan,
        });

        if (success) {
            setShowSuccessDialog(true);
        }
    };

    const handleBack = () => {
        // Close proposal form first
        if (showProposalForm) {
            setShowProposalForm(false);
            return;
        }

        // From recommendation → back to last question
        if (recommendedPlan) {
            back(); // clears recommendedPlan
            return;
        }

        // Normal questionnaire back
        if (currentStep > 1) {
            back();
            return;
        }

        // Step 1 → redirect to home
        navigate("/");
    };


    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* HEADER */}
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <PlutifyLogo />
                    {!recommendedPlan && (
                        <span className="text-sm text-muted-foreground">
                            Step {currentStep} of {TOTAL_STEPS}
                        </span>
                    )}
                    {recommendedPlan && (
                        <Button variant="ghost" onClick={handleBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go Back
                        </Button>
                    )}
                </div>
            </header>

            {/* PROGRESS */}
            {!recommendedPlan && (
                <div className="border-b border-border bg-card">
                    <div className="container mx-auto px-4 py-3">
                        <Progress value={progress} className="h-2" />
                    </div>
                </div>
            )}

            {/* ENTERPRISE FLOW (ONLY AFTER CTA) */}
            {showProposalForm && recommendedPlan === "enterprise" ? (
                <EnterpriseFlow answers={answers} />
            ) : showProposalForm && recommendedPlan !== "enterprise" ? (
                /* PROPOSAL FORM */
                <main className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-lg w-full">
                        <h1 className="text-3xl font-bold text-center mb-6">
                            Get Your Proposal
                        </h1>

                        <div className="bg-card border rounded-xl p-6 space-y-6">
                            <div className="space-y-4">
                                <Label className="flex items-center gap-2">
                                    <User className="h-4 w-4" /> Full Name
                                </Label>
                                <Input
                                    value={proposalData.name}
                                    onChange={(e) =>
                                        setProposalData({ ...proposalData, name: e.target.value })
                                    }
                                />

                                <Label className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> Email
                                </Label>
                                <Input
                                    value={proposalData.email}
                                    onChange={(e) =>
                                        setProposalData({ ...proposalData, email: e.target.value })
                                    }
                                />
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                    Selected Plan
                                </Label>
                                <Input
                                    value={recommendedPlan ? planDetails[recommendedPlan]?.name : ""}
                                    disabled
                                />

                            </div>

                            {submitError && (
                                <p className="text-sm text-destructive">{submitError}</p>
                            )}

                            <Button
                                onClick={handleSubmitProposal}
                                disabled={!canSubmitProposal || isSubmitting}
                                className="w-full"
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                        </div>
                    </div>
                </main>
            ) : recommendedPlan ? (
                /* RECOMMENDATION SCREEN */
                <main className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-xl text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-success" />
                        </div>

                        {recommendedPlan === "enterprise" ? (
                            <>
                                <h1 className="text-3xl font-bold mb-4">
                                    Your business qualifies for our Enterprise solution
                                </h1>
                                <p className="text-muted-foreground mb-8">
                                    Let’s discuss your needs in a short strategy call.
                                </p>
                                <Button onClick={() => setShowProposalForm(true)} size="lg">
                                    Book a Call
                                </Button>
                            </>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold mb-4">
                                    Your recommended plan is{" "}
                                    {planDetails[recommendedPlan].name}
                                </h1>
                                <p className="text-muted-foreground mb-8">
                                    A formal proposal will be prepared for you.
                                </p>
                                <Button onClick={() => setShowProposalForm(true)} size="lg">
                                    Get Your Proposal
                                </Button>
                            </>
                        )}
                    </div>
                </main>
            ) : (
                /* QUESTIONNAIRE STEPS */
                <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
                    {currentStep === 1 && (
                        <Step1BusinessBasics answers={answers} setAnswers={setAnswers} />
                    )}
                    {currentStep === 2 && (
                        <Step2BusinessDetails answers={answers} setAnswers={setAnswers} />
                    )}
                    {currentStep === 3 && (
                        <Step3AdditionalInfo answers={answers} setAnswers={setAnswers} />
                    )}

                    <div className="flex justify-between mt-12 pt-6 border-t">
                        <Button variant="outline" onClick={handleBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <Button onClick={next} disabled={!canProceed()}>
                            {currentStep === TOTAL_STEPS
                                ? "Get My Recommendation"
                                : "Continue"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </main>
            )}

            {/* SUCCESS DIALOG */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent>
                    <DialogHeader className="text-center">
                        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
                        <DialogTitle>Request Submitted</DialogTitle>
                        <DialogDescription>
                            You’ll hear from us shortly.
                        </DialogDescription>
                    </DialogHeader>
                    <Button
                        onClick={() => setShowSuccessDialog(false)}
                        className="w-full"
                    >
                        Close
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Questionnaire;
