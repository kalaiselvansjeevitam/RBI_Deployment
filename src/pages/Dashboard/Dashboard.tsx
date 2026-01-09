import Layout from "../../app/components/Layout/Layout";
export const Dashboard = () => {
  return (
    <Layout headerTitle="Dashboard">
      <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-2">
        <h1 className="text-3xl font-semibold text-gray-700">Soon...</h1>
        <p className="text-lg text-gray-600">
          This page is in Progress. Please check back later.
        </p>
      </div>
    </Layout>
  );
};
export default Dashboard;
