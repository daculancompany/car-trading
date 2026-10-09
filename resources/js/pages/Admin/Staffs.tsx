import { useEffect, useState } from "react";
import {
  Grid,
  GridItem,
} from "@chakra-ui/react";

import PageHeader from "../../components/Admin/Dashboard/DashboardPageHeader";
import StaffTable from "../../components/Admin/Staffs/StaffTable";
import StaffToolbar from "../../components/Admin/Staffs/StaffToolbar";

import {
  getStaffs,
  type Staff,
} from "../../api/UserManagement/staffApi";

export default function AdminStaffPage() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const loadStaffs = async () => {
    try {
      setLoading(true);

      const data = await getStaffs();

      if (data.length > 0) {
      }

      setStaffs(data);
    } catch (error) {
      console.error("Failed to load staffs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffs();
  }, []);

  const filteredStaffs = staffs.filter((staff) => {
    const keyword = search.trim().toLowerCase();

    const fullName = [
      staff.first_name,
      staff.middle_name,
      staff.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const username =
      staff.user?.username?.toLowerCase() || "";

    const email =
      staff.user?.email?.toLowerCase() || "";

    const mobile =
      staff.mobile_number?.toLowerCase() || "";

    const matchesSearch =
      keyword === "" ||
      fullName.includes(keyword) ||
      username.includes(keyword) ||
      email.includes(keyword) ||
      mobile.includes(keyword);

    const matchesStatus =
      status === "" ||
      staff.status === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageHeader
        title="Staff"
        subtitle="Employee accounts, roles and work hours."
        onRefresh={loadStaffs}
        refreshing={loading}
      />

      <Grid
        mt={4}
        gap={4}
        templateColumns="1fr"
      >
        <GridItem minW={0}>
          <StaffToolbar
            search={search}
            status={status}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onReload={loadStaffs}
          />
        </GridItem>

        <GridItem minW={0}>
          <StaffTable
            staffs={filteredStaffs}
            loading={loading}
            onReload={loadStaffs}
          />
        </GridItem>
      </Grid>
    </>
  );
}

