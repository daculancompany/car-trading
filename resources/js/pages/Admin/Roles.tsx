import { useEffect, useMemo, useState } from "react";

import {
  Grid,
  GridItem,
} from "@chakra-ui/react";

import PageHeader from "../../components/Admin/Dashboard/DashboardPageHeader";
import RoleToolbar from "../../components/Admin/Roles/RoleToolbar";
import RolesTable from "../../components/Admin/Roles/RolesTable";
import AddRoleModal from "../../components/Admin/Roles/AddRoleModal";

import {
  getRoles,
  type Role,
  type RoleType,
} from "../../api/UserManagement/roleApi";

export default function AdminRolePage() {
  // State

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [roleType, setRoleType] = useState<RoleType | "">("");

  // Add Role Modal
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);

  // Load Roles

  const loadRoles = async () => {
    try {
      setLoading(true);

      const data = await getRoles();

      setRoles(data);
    } catch (error) {
      console.error("Failed to load roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // Search & Filter

  const filteredRoles = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return roles.filter((role) => {
      const matchesSearch =
        searchValue === "" ||
        role.name.toLowerCase().includes(searchValue) ||
        role.role_type.toLowerCase().includes(searchValue) ||
        (role.description ?? "")
          .toLowerCase()
          .includes(searchValue);

      const matchesRoleType =
        roleType === "" ||
        role.role_type === roleType;

      return matchesSearch && matchesRoleType;
    });
  }, [roles, search, roleType]);

  // Render

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Roles"
        subtitle="Who can use which part of the system."
        onRefresh={loadRoles}
        refreshing={loading}
      />

      <Grid
        mt={4}
        gap={4}
        templateColumns="1fr"
      >
        <GridItem minW={0}>
          {/* Role Toolbar */}
          <RoleToolbar
            search={search}
            roleType={roleType}
            onSearchChange={setSearch}
            onRoleTypeChange={setRoleType}
            onAddRole={() => setIsAddRoleOpen(true)}
          />
        </GridItem>

        <GridItem minW={0}>
          {/* Roles Table */}
          <RolesTable
            roles={filteredRoles}
            loading={loading}
          />
        </GridItem>
      </Grid>

      {/* Add Role Modal */}
      <AddRoleModal
        isOpen={isAddRoleOpen}
        onClose={() => setIsAddRoleOpen(false)}
        onSuccess={loadRoles}
      />
    </>
  );
}

