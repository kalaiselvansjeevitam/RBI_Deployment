import Layout from "../../../../app/components/Layout/Layout";

export type FAQItem = {
  q: string;
  a: string;
};

const FAQPage = ({
  headerTitle,
  subtitle,
  faqs,
}: {
  headerTitle: string;
  subtitle?: string;
  faqs: FAQItem[];
}) => {
  return (
    <Layout headerTitle={headerTitle}>
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800">{headerTitle}</h3>
          {subtitle ? (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          ) : null}

          <div className="mt-6 space-y-4">
            {faqs.map((item, idx) => (
              <div
                key={`${idx}-${item.q}`}
                className="border rounded-2xl p-5 bg-white"
              >
                <div className="text-sm font-semibold text-gray-800">
                  {idx + 1}. {item.q}
                </div>
                <div className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
