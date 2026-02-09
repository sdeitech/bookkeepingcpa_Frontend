// questionnaire/enterprise/EnterpriseCalendly.tsx

import { InlineWidget } from "react-calendly";

const EnterpriseCalendly = ({ url }) => {
  return (
    <div className="border rounded-xl overflow-hidden">
      <InlineWidget url={url} styles={{ height: "500px" }} />
    </div>
  );
};

export default EnterpriseCalendly;
