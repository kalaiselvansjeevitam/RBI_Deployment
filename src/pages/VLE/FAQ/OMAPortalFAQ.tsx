import FAQPage, { type FAQItem } from "./shared/FAQPage";

const OMA_FAQS: FAQItem[] = [
  {
    q: "What is the VLE Dashboard used for?",
    a: "The VLE Dashboard is used to create and manage workshops, register citizens, upload documents, and monitor overall performance.",
  },
  {
    q: "Who can access the VLE Dashboard?",
    a: "Authorized Village Level Entrepreneurs (VLEs) who have completed the required training and obtained certification for the project can access the dashboard.",
  },
  {
    q: "What does “Total Sessions” indicate on the dashboard?",
    a: "It shows the total number of workshops/sessions created in the system.",
  },
  {
    q: "What are “Approved Sessions”?",
    a: "These are workshops that have been reviewed and approved by the competent authority.",
  },
  {
    q: "What does “Total Citizens” represent?",
    a: "It displays the total number of citizens registered across all workshops.",
  },
  {
    q: "How do I create a new workshop?",
    a: "Use the Create Workshop option to enter session details such as date, time, and location.",
  },
  {
    q: "When should a workshop be created?",
    a: "A workshop should be created before 3-4 days mapping or registering citizens to it.",
  },
  {
    q: "How can I view existing workshops?",
    a: "Go to the View Workshop page to see a list of all the workshops created.",
  },
  {
    q: "Can workshops be filtered or searched?",
    a: "Yes, workshops can be filtered by date range and status.",
  },
  {
    q: "Is it possible to update a workshop’s status?",
    a: "Yes, workshop status can be updated from the View Workshop page.",
  },
  {
    q: "How are citizens registered on the portal?",
    a: "Citizens can be registered individually or uploaded in bulk using Excel.",
  },
  {
    q: "What is bulk citizen upload?",
    a: "It allows mapping multiple citizens to a workshop at once using an Excel file.",
  },
  {
    q: "When should bulk upload be used?",
    a: "Bulk upload is useful when citizen details are collected offline during camps or sessions.",
  },
  {
    q: "What documents can be uploaded for citizens or workshops?",
    a: "Supporting documents such as photographs (up to 4) and videos (up to 2) can be uploaded.",
  },
  {
    q: "Where can I upload photos and videos?",
    a: "Use the Upload File section linked to the respective workshop or citizen.",
  },
  {
    q: "Can citizens be mapped to a workshop after creation?",
    a: "Yes, citizens can be mapped later either individually or through bulk upload.",
  },
  {
    q: "What happens if incorrect data is uploaded?",
    a: "The data must be corrected and re-uploaded as per portal and project guidelines.",
  },
  {
    q: "Can I monitor my performance through the dashboard?",
    a: "Yes, KPI summary cards and charts provide an overview of sessions and citizen data.",
  },
  {
    q: "Who should be contacted for technical issues or access problems?",
    a: "The designated project IT or portal support team should be contacted for assistance.",
  },
  {
    q: "What is the maximum allowed size for each photograph uploaded on the portal?",
    a: "Each photograph uploaded on the portal must not exceed 2 MB in size.",
  },
  {
    q: "What is the maximum allowed size for the feedback video upload per session?",
    a: "The feedback video uploaded per session must not exceed 50 MB in size.",
  },
];

const OMAPortalFAQ = () => {
  return (
    <FAQPage
      headerTitle="OMA portal Frequently Asked Questions (FAQs)"
      faqs={OMA_FAQS}
    />
  );
};

export default OMAPortalFAQ;
