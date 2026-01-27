import Layout from "../../../app/components/Layout/Layout";

type Props = {
  title: string;
};

const ReportPlaceholder = ({ title }: Props) => {
  return (
    <Layout headerTitle={title}>
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow p-6">
          {title} (view + download excel coming next)
        </div>
      </div>
    </Layout>
  );
};

export default ReportPlaceholder;
