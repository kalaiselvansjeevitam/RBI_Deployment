import FAQPage, { type FAQItem } from "./shared/FAQPage";

const PROJECT_FAQS: FAQItem[] = [
  {
    q: "What is the objective of the Secure Digital Payment Awareness Program?",
    a: "The program aims to raise awareness among rural citizens on safe and secure digital payments and empower VLEs as Digital Payment Ambassadors.",
  },
  {
    q: "Who is implementing this program?",
    a: "The program is implemented through Common Services Centers (CSCs) with guidance from the Reserve Bank of India (RBI).",
  },
  {
    q: "Who can participate as a trainer in this program?",
    a: "Certified Village Level Entrepreneurs (VLEs) who have successfully completed Training of Trainers (ToT) are eligible.",
  },
  {
    q: "What is the Training of Trainers (ToT) program?",
    a: "ToT is a structured one-day training that equips VLEs with knowledge on digital payments, fraud prevention, and session delivery.",
  },
  {
    q: "Is certification mandatory for VLEs?",
    a: "Yes, certification is issued only after successful completion of assessment and live demo evaluation.",
  },
  {
    q: "How many sessions is each VLE required to conduct?",
    a: "Each VLE is expected to conduct up to four awareness sessions.",
  },
  {
    q: "What is the duration of each awareness session?",
    a: "Each citizen awareness session is approximately 90 minutes long.",
  },
  {
    q: "How many participants must attend each session?",
    a: "A minimum of 50 participants must attend each session.",
  },
  {
    q: "Who are the target participants for the sessions?",
    a: "Adults aged 18–60 years, including farmers, SHGs, women, elderly citizens, shopkeepers, youth, FPOs, PACS members, and welfare beneficiaries.",
  },
  {
    q: "What topics are covered during the awareness sessions?",
    a: "Basics of digital payments, UPI usage, QR codes, safety practices, fraud prevention, and grievance redressal.",
  },
  {
    q: "Are sessions required to be conducted physically?",
    a: "Yes, sessions must be conducted in a physical, hands-on manner for effective learning.",
  },
  {
    q: "Is advance scheduling of sessions mandatory?",
    a: "Yes, sessions must be scheduled on the portal before conducting them.",
  },
  {
    q: "What materials should be provided to participants?",
    a: "Each participant must receive a handbook and be shown RBI-approved video content.",
  },
  {
    q: "What infrastructure is required at the session venue?",
    a: "A banner, seating arrangement, TV/projector with sound system, and reliable internet connectivity are required.",
  },
  {
    q: "What details must be uploaded after each session?",
    a: "Participant details, minimum four photographs, and one feedback video must be uploaded on the portal.",
  },
  {
    q: "What are the requirements for session photographs?",
    a: "At least four clear, original photographs showing participants, trainer interaction, and session activities must be uploaded.",
  },
  {
    q: "What is required in the feedback video?",
    a: "A video featuring feedback from 2–3 participants sharing their learning experience.",
  },
  {
    q: "What happens after data submission on the portal?",
    a: "Submitted details are verified by authorities before approval.",
  },
  {
    q: "When is payment released to VLEs?",
    a: "Payment is released only after successful verification and approval of all uploaded data.",
  },
  {
    q: "What can lead to rejection of a session record?",
    a: "Incomplete uploads, unclear photographs, insufficient participants, unscheduled sessions, or incorrect data may lead to rejection.",
  },
];

const ProjectFAQ = () => {
  return (
    <FAQPage
      headerTitle="Overall project-related Frequently Asked Questions (FAQs)"
      faqs={PROJECT_FAQS}
    />
  );
};

export default ProjectFAQ;
