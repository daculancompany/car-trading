import PageHeader from "../../components/Admin/Dashboard/DashboardPageHeader";
import ReportsPage from "../../components/Shared/Reports/ReportsPage";

export default function Reports() {
  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Pick a report from the menu, filter by date, status or keyword, then download the PDF if needed."
      />

      <ReportsPage />
    </>
  );
}
