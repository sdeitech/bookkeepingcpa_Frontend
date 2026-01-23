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
  
  // Step 2.8.1: Add Success Dialog State
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
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

  // Step 2.7.6: Handle proposal form submission
  const handleSubmitProposal = () => {
    // Show success dialog
    setShowSuccessDialog(true);
  };

  // Step 2.7.6: Validate proposal form
  const canSubmitProposal = () => {
    return proposalData.name.trim() !== '' && 
           proposalData.email.trim() !== '' && 
           proposalData.email.includes('@');
  };

  // Step 2.8.3: Handle success dialog close
  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    // For now, navigate to login. Later this will navigate to dashboard
    navigate('/login');
  };

  // Step 2.6.4: Handle Enterprise "Book a Call" button
  const handleBookCall = () => {
    // Placeholder for Calendly integration
    // For now, open a placeholder link or show a message
    alert('Calendly booking will be integrated here. This will open the consultation scheduling page.');
    // TODO: Replace with actual Calendly link/embed
    // window.open('CALENDLY_LINK_HERE', '_blank');
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

      {/* Step 2.7.2: Proposal Form (for Startup/Essential plans) */}
      {showProposalForm && recommendedPlan && recommendedPlan !== 'enterprise' ? (
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

              {/* Step 2.7.6: Submit Button */}
              <Button 
                onClick={handleSubmitProposal} 
                size="lg" 
                className="w-full"
                disabled={!canSubmitProposal()}
              >
                Submit & View Proposal
                <ArrowRight className="ml-2 h-5 w-5" />
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

            {recommendedPlan === 'enterprise' ? (
              <>
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Your business qualifies for our custom Enterprise solution
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Let's discuss your complex needs in a dedicated strategy call.
                </p>

                {/* Step 2.6.4: Calendly Placeholder */}
                <div className="bg-card border border-border rounded-xl p-8 mb-6">
                  <h3 className="font-semibold text-foreground mb-4">Schedule Your Consultation</h3>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    <p className="text-muted-foreground">Calendly Widget Placeholder</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      (Calendly integration will be added here)
                    </p>
                  </div>
                  <Button onClick={handleBookCall} size="lg" className="w-full">
                    Book a Call
                  </Button>
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
