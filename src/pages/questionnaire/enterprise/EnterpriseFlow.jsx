// questionnaire/enterprise/EnterpriseFlow.tsx

import EnterpriseForm from "./EnterpriseForm";
import EnterpriseCalendly from "./EnterpriseCalendly";
import { useEnterpriseFlow } from "./useEnterpriseFlow";

const EnterpriseFlow = ({ answers }) => {
  const {
    step,
    data,
    setData,
    submitForm,
    error,
    isLoading,
    calendlyUrl,
  } = useEnterpriseFlow();

  return (
    <main className="flex-1 flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-3xl">
        {/* FORM STEP */}
        {step === "FORM" && (
          <>
            <h1 className="text-2xl font-semibold text-center text-foreground mb-6">
              Schedule Your Consultation
            </h1>

            <EnterpriseForm
              data={data}
              setData={setData}
              onSubmit={() => submitForm(answers)}
              error={error}
              isLoading={isLoading}
            />
          </>
        )}

        {/* CALENDLY STEP */}
        {step === "CALENDLY" && (
          <>
            <h1 className="text-2xl font-semibold text-center text-foreground mb-6">
              Choose a time that works for you
            </h1>

            <div className="bg-card border border-border rounded-xl shadow-lg p-4">
              <EnterpriseCalendly url={calendlyUrl()} />
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default EnterpriseFlow;
