import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/Login/LoginForm';
import { PlutifyLogo } from '../components/PlutifyLogo';
import { Button } from '../components/ui/button';
import { ArrowRight, TrendingUp, Shield, Users } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  // Handle "Existing Client" link click - focus email field with smooth scroll
  const handleExistingClientClick = () => {
    const emailInput = document.getElementById('email');
    if (emailInput) {
      // Smooth scroll to email field
      emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus after a small delay to ensure scroll completes
      setTimeout(() => {
        emailInput.focus();
      }, 300);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT COLUMN: Existing Client Login */}
      <div className="w-1/2 bg-card p-8 lg:p-12 flex flex-col justify-center animate-slide-in-left">
        <div className="max-w-md mx-auto w-full">
          <PlutifyLogo className="mb-8" />
          <LoginForm />
        </div>
      </div>

      {/* RIGHT COLUMN: New Prospect Acquisition */}
      <div className="w-1/2 bg-primary p-8 lg:p-12 flex flex-col justify-center animate-slide-in-right">
        <div className="max-w-md mx-auto w-full">
          <PlutifyLogo variant="light" className="mb-8" />
          
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">
            Find Your Perfect Plutify Plan
          </h1>
          <p className="text-primary-foreground/80 mb-8">
            Answer a few quick questions to determine the best service tier for your business needs and growth goals.
          </p>

          {/* Progress Indicator */}
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-primary-foreground/20">
            <p className="text-primary-foreground/70 text-sm mb-2">Progress:</p>
            <p className="text-primary-foreground font-semibold">Step 1 of 3: Business Basics</p>
            <div className="mt-3 h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-primary-foreground rounded-full" />
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span>Strategic financial guidance</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span>Compliance & tax optimization</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span>Dedicated support team</span>
            </div>
          </div>

          {/* Start Now Button */}
          <Button
            onClick={() => navigate("/questionnaire")}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all"
            aria-label="Start questionnaire to find your perfect plan"
          >
            Start Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Existing Client Link */}
          <p className="mt-6 text-center text-primary-foreground/70">
            <span className="font-medium">Existing Client?</span>{" "}
            <button
              onClick={handleExistingClientClick}
              className="text-primary-foreground underline hover:no-underline transition-all bg-transparent"
              type="button"
              aria-label="Focus on email input field"
            >
              Check Your Plan or Upgrade Here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
