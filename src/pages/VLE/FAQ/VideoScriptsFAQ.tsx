import FAQPage, { type FAQItem } from "./shared/FAQPage";

const VIDEO_SCRIPTS_FAQS: FAQItem[] = [
  {
    q: "What is the purpose of the Har Payment Digital session?",
    a: "To help citizens understand and safely use digital payments, especially UPI, for daily transactions.",
  },
  {
    q: "Who conducts these digital payment awareness sessions?",
    a: "Certified Village Level Entrepreneurs (VLEs) trained under the RBI-supported program.",
  },
  {
    q: "How long does a typical awareness session last?",
    a: "Approximately 90 minutes, including video, discussion, and hands-on practice.",
  },
  {
    q: "What is meant by digital payment?",
    a: "Digital payment means making or receiving payments without cash using mobile phones or digital tools.",
  },
  {
    q: "Are digital payments safe?",
    a: "Yes, digital payments are safe when basic precautions like protecting UPI PIN and avoiding unknown links are followed.",
  },
  {
    q: "What is UPI?",
    a: "UPI (Unified Payments Interface) is a system that allows instant money transfer between bank accounts using a mobile phone.",
  },
  {
    q: "Which apps can be used for UPI payments?",
    a: "BHIM, Google Pay, PhonePe, Paytm, and other UPI-enabled apps.",
  },
  {
    q: "What is required to register for UPI?",
    a: "A mobile phone, bank account, mobile number linked with the bank, and Aadhaar card or ATM card.",
  },
  {
    q: "Can UPI be used on feature phones?",
    a: "Yes, UPI can be used on feature phones through UPI123PAY using a phone call.",
  },
  {
    q: "What can be done using UPI?",
    a: "Sending money, receiving money, QR code payments, bill payments, recharges, and balance checks.",
  },
  {
    q: "Is UPI available 24×7?",
    a: "Yes, UPI works 24 hours a day, 7 days a week, including holidays.",
  },
  {
    q: "What is a UPI PIN and why is it important?",
    a: "UPI PIN is a secret number required to authorize payments and must never be shared with anyone.",
  },
  {
    q: "Is UPI PIN required to receive money?",
    a: "No, UPI PIN is required only to send money, not to receive it.",
  },
  {
    q: "What precautions should be taken to avoid digital fraud?",
    a: "Never share PIN/OTP, avoid unknown links or apps, and always verify the recipient’s name before payment.",
  },
  {
    q: "Will I get confirmation after every transaction?",
    a: "Yes, an SMS confirmation is received for every successful or failed transaction.",
  },
  {
    q: "What should I do if money is debited but not received by the other person?",
    a: "The amount is usually auto-reversed within 24 hours; otherwise, raise a complaint via the UPI app or bank.",
  },
  {
    q: "Where can complaints related to UPI be raised?",
    a: "Complaints can be raised through the UPI app, bank, or RBI Ombudsman if unresolved within 30 days.",
  },
  {
    q: "What is the helpline number for cyber fraud?",
    a: "Call 1930 or report on cybercrime.gov.in immediately.",
  },
  {
    q: "Will participants get any learning material after the session?",
    a: "Yes, participants receive a handbook containing key information and steps.",
  },
  {
    q: "What is the key outcome of the session?",
    a: "Participants gain confidence to perform digital payments independently and safely.",
  },
];

const VideoScriptsFAQ = () => {
  return (
    <FAQPage
      headerTitle="Video Scripts: Frequently Asked Questions (FAQs)"
      faqs={VIDEO_SCRIPTS_FAQS}
    />
  );
};

export default VideoScriptsFAQ;
