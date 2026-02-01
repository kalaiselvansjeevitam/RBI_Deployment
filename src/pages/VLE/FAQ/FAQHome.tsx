import { HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { ROUTE_URL } from "../../../app/core/constants/coreUrl";

const FAQHome = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "OMA portal Frequently Asked Questions (FAQs)",
      desc: "FAQs about using the VLE Dashboard/portal.",
      href: ROUTE_URL.vleFaqOma,
    },
    {
      title: "Overall project-related Frequently Asked Questions (FAQs)",
      desc: "Program objectives, requirements, approvals, and compliance.",
      href: ROUTE_URL.vleFaqProject,
    },
    {
      title: "Video Scripts: Frequently Asked Questions (FAQs)",
      desc: "FAQs aligned with session video/script content.",
      href: ROUTE_URL.vleFaqVideoScripts,
    },
  ];

  return (
    <Layout headerTitle="FAQ">
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">
              FAQ Sections
            </h3>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map((c) => (
              <div
                key={c.title}
                className="border rounded-2xl p-5 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {c.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">{c.desc}</div>
                </div>

                <Button
                  className="mt-4 cursor-pointer"
                  onClick={() => navigate(c.href)}
                  type="button"
                >
                  Open
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQHome;
