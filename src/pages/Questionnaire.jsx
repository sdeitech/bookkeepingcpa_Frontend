import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlutifyLogo } from '../components/PlutifyLogo';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { ArrowLeft, ArrowRight, CheckCircle2, User, Mail, Lock } from 'lucide-react';
import { InlineWidget } from "react-calendly";

import {
  initialAnswers,
  revenueOptions,
  supportOptions,
  customizationOptions,
  structureOptions,
  cleanupOptions,
  taxOptions,
  recommendPlan,
  planDetails,
} from '../lib/questionnaire-types';
import {
  useSubmitQuestionnaireMutation,
  useCreateClientInIgnitionMutation,
} from '../features/questionnaire/questionnaireApi';

const TOTAL_STEPS = 3;

const Questionnaire = () => {
  const navigate = useNavigate();

  // Step 2.2.2: Add Step State Management
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState(initialAnswers);

  // Step 2.6.1: Add Recommendation State
  const [recommendedPlan, setRecommendedPlan] = useState(null);

  // Step 2.7.1: Add Proposal Form State
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({ name: '', email: '' });

  // Step 3.5.2: Add Enterprise Consultation Form State (for Calendly pre-fill)
  const [showEnterpriseForm, setShowEnterpriseForm] = useState(false);
  const [enterpriseData, setEnterpriseData] = useState({ name: '', email: '' });

  // Step 2.8.1: Add Success Dialog State
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Step 3.4.1: Add API Hooks
  const [submitQuestionnaire, { isLoading: isSubmitting }] = useSubmitQuestionnaireMutation();
  const [createClientInIgnition, { isLoading: isCreatingClient }] = useCreateClientInIgnitionMutation();

  // Step 3.4.4: Add Error State
  const [submitError, setSubmitError] = useState(null);

  // Calculate progress percentage
  const progress = recommendedPlan ? 100 : (currentStep / TOTAL_STEPS) * 100;

  // Step 2.2.3: Add Step Navigation Logic
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return answers.q1Revenue !== null && answers.q2Support !== null;
      case 2:
        return answers.q3Customization !== null && answers.q4Structure !== null;
      case 3:
        return answers.q5Cleanup !== null && answers.q6Tax !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      // Step 3 complete - calculate plan recommendation
      const plan = recommendPlan(answers);
      setRecommendedPlan(plan);
    }
  };

  const handleBack = () => {
    if (showProposalForm) {
      // If on proposal form, go back to recommendation screen
      setShowProposalForm(false);
    } else if (showEnterpriseForm) {
      // If on Enterprise form, go back to recommendation screen
      setShowEnterpriseForm(false);
    } else if (recommendedPlan) {
      // If on recommendation screen, go back to Step 3
      setRecommendedPlan(null);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // Navigate back to login if on step 1
      navigate('/login');
    }
  };

  // Step 2.7.6: Handle "Get Your Proposal" button
  const handleGetProposal = () => {
    setShowProposalForm(true);
  };

  // Step 3.4.2: Handle proposal form submission
  const handleSubmitProposal = async () => {
    try {
      // Clear any previous errors
      setSubmitError(null);

      // Prepare questionnaire data
      const questionnaireData = {
        email: proposalData.email.trim(),
        name: proposalData.name.trim(),
        answers: {
          q1Revenue: answers.q1Revenue,
          q2Support: answers.q2Support,
          q3Customization: answers.q3Customization,
          q4Structure: answers.q4Structure,
          q5Cleanup: answers.q5Cleanup,
          q6Tax: answers.q6Tax,
        },
        recommendedPlan: recommendedPlan,
      };

      // Step 3.4.2: Submit questionnaire to backend
      const submitResult = await submitQuestionnaire(questionnaireData).unwrap();

      console.log('Questionnaire submitted:', submitResult);

      // Step 3.4.3: Trigger Zapier webhook to create client in Ignition
      try {
        const zapierData = {
          questionnaireId: submitResult.data.id, // Use ID from submission
          // Alternative: can also send direct data
          email: proposalData.email.trim(),
          name: proposalData.name.trim(),
          answers: questionnaireData.answers,
          recommendedPlan: recommendedPlan,
        };

        const zapierResult = await createClientInIgnition(zapierData).unwrap();
        console.log('Zapier webhook called:', zapierResult);
        setShowSuccessDialog(true);
      } catch (zapierError) {
        // Don't fail the entire flow if Zapier fails
        // Log error but continue to success dialog
        console.error('Zapier webhook error (non-fatal):', zapierError);
        setSubmitError(
          zapierError.data.message)
        // The questionnaire is still saved, so we show success
      }


    } catch (error) {
      console.error('Error submitting questionnaire:', error);

      // Set error message for user
      setSubmitError(
        error.data?.message ||
        error.message ||
        'Failed to submit questionnaire. Please try again.'
      );
    }
  };

  // Step 2.7.6: Validate proposal form
  const canSubmitProposal = () => {
    return proposalData.name.trim() !== '' &&
      proposalData.email.trim() !== '' &&
      proposalData.email.includes('@');
  };

  // Step 3.6.1: Handle success dialog close - Navigate to dashboard
  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    // Navigate to dashboard after proposal submission
    navigate('/dashboard');
  };

  // Step 3.5.1: Handle Enterprise "Book a Call" button - show form first
  const handleBookCall = () => {
    // Step 3.5.2: Show form to collect name/email for Calendly pre-fill
    setShowEnterpriseForm(true);
  };

  // Step 3.5.2: Handle Enterprise form submission and open Calendly with pre-filled data
  // const handleEnterpriseFormSubmit = () => {
  //   if (!canSubmitEnterpriseForm()) {
  //     return;
  //   }

  //   const calendlyUrl = import.meta.env.VITE_CALENDLY_EVENT_URL;

  //   if (!calendlyUrl || calendlyUrl.includes('your-username')) {
  //     // Fallback if Calendly URL is not configured
  //     alert('Calendly is not configured yet. Please contact support to schedule a consultation.');
  //     console.warn('Calendly URL not configured. Set VITE_CALENDLY_EVENT_URL in .env.development');
  //     setShowEnterpriseForm(false);
  //     return;
  //   }

  //   // Step 3.5.2: Build Calendly URL with pre-filled data
  //   const name = enterpriseData.name.trim();
  //   const email = enterpriseData.email.trim();

  //   // Calendly URL parameters for pre-filling
  //   // a1, a2, etc. are custom fields (if configured in Calendly)
  //   const params = new URLSearchParams({
  //     name: name,
  //     email: email,
  //     a1: 'Enterprise Plan', // Custom field: Plan Type
  //   });

  //   const calendlyUrlWithParams = `${calendlyUrl}?${params.toString()}`;

  //   // Open Calendly in a new window/tab with pre-filled data
  //   window.open(calendlyUrlWithParams, '_blank', 'noopener,noreferrer');

  //   // Close the form
  //   setShowEnterpriseForm(false);

  //   // Optionally: Save to backend (similar to proposal submission)
  //   // This can be added later if needed
  // };

  // Step 3.5.2: Validate Enterprise form
  const canSubmitEnterpriseForm = () => {
    return enterpriseData.name.trim() !== '' &&
      enterpriseData.email.trim() !== '' &&
      enterpriseData.email.includes('@');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Step 2.2.1: Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <PlutifyLogo />
          {!recommendedPlan && (
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {TOTAL_STEPS}
            </div>
          )}
          {recommendedPlan && (
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          )}
        </div>
      </header>

      {/* Step 2.2.1: Progress Bar */}
      {!recommendedPlan && (
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}

      {/* Step 3.5.2: Enterprise Consultation Form (for Calendly pre-fill) */}
      {showEnterpriseForm && recommendedPlan === 'enterprise' ? (
        <main className="min-h-screen bg-muted/40 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-8 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* LEFT CONTENT */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold text-foreground leading-tight">
                    Schedule Your Consultation
                  </h1>
                  <p className="mt-4 text-lg text-muted-foreground max-w-md text-black">
                    Book a short call with our team to understand your requirements and
                    define the best next steps for your business.
                  </p>
                </div>

                <ul className="space-y-3 text-sm text-muted-foreground text-black font-semibold">
                  <li className="flex items-center gap-2">✅ Understand your requirements</li>
                  <li className="flex items-center gap-2">✅ Discuss solution & timeline</li>
                  <li className="flex items-center gap-2">✅ Clear next steps after the call</li>
                </ul>

                <div className="inline-flex flex-col gap-1 bg-card border border-border rounded-xl px-5 py-3 w-fit">
                  <span className="text-sm">⏱ Duration: 15 minutes</span>
                  <span className="text-sm">📞 Format: Zoom Call</span>
                </div>
              </div>

              {/* RIGHT CALENDLY */}
              {/* RIGHT CALENDLY */}
              <div className="relative w-full">
                <div className="bg-card border border-border rounded-2xl shadow-xl p-6 w-[500px]">
                  <div className="rounded-xl overflow-hidden border border-border w-full">
                    <InlineWidget
                      url={import.meta.env.VITE_CALENDLY_EVENT_URL}
                      styles={{ height: '500px' }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>

      ) : showProposalForm && recommendedPlan && recommendedPlan !== 'enterprise' ? (
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg w-full animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Get Your Proposal
              </h1>
              <p className="text-muted-foreground">
                Enter your details to receive your personalized proposal.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              {/* Step 2.7.3: User Details - Name */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={proposalData.name}
                    onChange={(e) => setProposalData({ ...proposalData, name: e.target.value })}
                    className="h-12"
                  />
                </div>

                {/* Step 2.7.4: User Details - Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={proposalData.email}
                    onChange={(e) => setProposalData({ ...proposalData, email: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>

              {/* Step 2.7.5: Plan Details - Auto-filled & Readonly */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Plan Details (Auto-filled)</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Selected Plan</Label>
                    <Input
                      value={planDetails[recommendedPlan].name}
                      readOnly
                      disabled
                      className="h-10 bg-muted cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Plan Description</Label>
                    <Input
                      value={planDetails[recommendedPlan].description}
                      readOnly
                      disabled
                      className="h-10 bg-muted cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3.4.4: Error Display */}
              {submitError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive font-medium">Error</p>
                  <p className="text-sm text-destructive/80 mt-1">{submitError}</p>
                </div>
              )}

              {/* Step 2.7.6: Submit Button */}
              <Button
                onClick={handleSubmitProposal}
                size="lg"
                className="w-full"
                disabled={!canSubmitProposal() || isSubmitting || isCreatingClient}
              >
                {isSubmitting || isCreatingClient ? (
                  <>
                    Submitting...
                    <ArrowRight className="ml-2 h-5 w-5 animate-pulse" />
                  </>
                ) : (
                  <>
                    Submit & View Proposal
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Step 2.8.2: Success Dialog */}
          <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <DialogTitle className="text-xl">Proposal Request Submitted!</DialogTitle>
                <DialogDescription className="text-center pt-2">
                  You will receive your personalized proposal on your email within 24 hours.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center pt-4">
                <Button onClick={handleSuccessDialogClose} size="lg">
                  Continue to Dashboard
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      ) : recommendedPlan ? (
        /* Step 2.6.2: Plan Recommendation Screen */
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-xl w-full text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>

            {recommendedPlan === 'enterprise' && !showEnterpriseForm ? (
              <>
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Your business qualifies for our custom Enterprise solution
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Let's discuss your complex needs in a dedicated strategy call.
                </p>

                {/* Step 3.5.1: Calendly Integration */}
                <div className="bg-card border border-border rounded-xl p-8 mb-6">
                  <h3 className="font-semibold text-foreground mb-4">Schedule Your Consultation</h3>
                  <p className="text-muted-foreground mb-6 text-center">
                    Book a personalized strategy call with our team to discuss your Enterprise solution needs.
                  </p>
                  <Button onClick={handleBookCall} size="lg" className="w-full">
                    Book a Call
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    You'll be redirected to our scheduling page
                  </p>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Your recommended plan is {planDetails[recommendedPlan].name}!
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  A formal proposal detailing the scope and fixed price is being prepared for you.
                </p>

                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-foreground mb-2">{planDetails[recommendedPlan].name} Plan</h3>
                  <p className="text-muted-foreground">{planDetails[recommendedPlan].description}</p>
                </div>

                {/* Step 2.6.3: Get Your Proposal Button */}
                <Button onClick={handleGetProposal} size="lg" className="w-full max-w-sm">
                  Get Your Proposal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </main>
      ) : (
        /* Step 2.2.1: Main Form Container */
        <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
          <div className="animate-fade-in">
            {/* Step 2.3.1: Step 1 - Business Basics */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Business Basics</h2>
                  <p className="text-muted-foreground">Tell us about your business size and needs.</p>
                </div>

                {/* Step 2.3.2: Question 1 - Revenue */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    What is your estimated or actual annual business revenue? (in USD)
                  </Label>
                  <RadioGroup
                    value={answers.q1Revenue || ""}
                    onValueChange={(value) => setAnswers({ ...answers, q1Revenue: value })}
                    className="space-y-3"
                  >
                    {revenueOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="cursor-pointer flex-1">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Step 2.3.3: Question 2 - Support */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    What level of strategic support are you seeking?
                  </Label>
                  <RadioGroup
                    value={answers.q2Support || ""}
                    onValueChange={(value) => setAnswers({ ...answers, q2Support: value })}
                    className="space-y-3"
                  >
                    {supportOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="cursor-pointer flex-1">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 2.4.1: Step 2 - Business Details */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Business Details</h2>
                  <p className="text-muted-foreground">Help us understand your specific requirements.</p>
                </div>

                {/* Step 2.4.2: Question 3 - Customization */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    Does your business require a customized or specialized accounting solution?
                  </Label>
                  <RadioGroup
                    value={answers.q3Customization || ""}
                    onValueChange={(value) => setAnswers({ ...answers, q3Customization: value })}
                    className="space-y-3"
                  >
                    {customizationOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="cursor-pointer flex-1">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Step 2.4.3: Question 4 - Business Structure */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    What is your current legal business structure?
                  </Label>
                  <Select
                    value={answers.q4Structure || ""}
                    onValueChange={(value) => setAnswers({ ...answers, q4Structure: value })}
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
            )}

            {/* Step 2.5.1: Step 3 - Additional Information */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Additional Information</h2>
                  <p className="text-muted-foreground">A few more questions to finalize your recommendation.</p>
                </div>

                {/* Step 2.5.2: Question 5 - Cleanup */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    Does your business require a historical clean-up or catch-up of past bookkeeping records?
                  </Label>
                  <RadioGroup
                    value={answers.q5Cleanup || ""}
                    onValueChange={(value) => setAnswers({ ...answers, q5Cleanup: value })}
                    className="space-y-3"
                  >
                    {cleanupOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="cursor-pointer flex-1">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Step 2.5.3: Question 6 - Tax */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    Do you anticipate needing assistance with state/local sales tax or international tax filings?
                  </Label>
                  <RadioGroup
                    value={answers.q6Tax || ""}
                    onValueChange={(value) => setAnswers({ ...answers, q6Tax: value })}
                    className="space-y-3"
                  >
                    {taxOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="cursor-pointer flex-1">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}
          </div>

          {/* Step 2.2.1: Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-6 border-t border-border">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {currentStep === TOTAL_STEPS ? 'Get My Recommendation' : 'Continue'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </main>
      )}
    </div>
  );
};

export default Questionnaire;
