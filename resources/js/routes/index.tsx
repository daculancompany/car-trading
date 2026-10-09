import { lazy, Suspense } from "react";
import { Center, Spinner } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// PROTECTED ROUTE
import ProtectedRoute from "./ProtectedRoute";

// ROUTE BASED ON THE MAINLAYOUT PROTECTED
import AdminMainLayout from "../layouts/Admin/MainLayout";

import SecretaryMainLayout from "../layouts/Secretary/SecretaryMainLayout";

import CustomerMainLayout from "../layouts/Customers/CustomerMainLayout";

// FRONT PAGE

const CustomerLogin = lazy(() => import("../pages/Customer/CustomerLogin"));
const MyJobs = lazy(() => import("../pages/Staff/MyJobs"));

//ADMIN ROUTE
const Dashboard = lazy(() => import("../pages/Admin/Dashboard"));
const Vehicles = lazy(() => import("../pages/Admin/Vehicles"));
const Customers = lazy(() => import("../pages/Admin/Customers"));
const Reservations = lazy(() => import("../pages/Admin/Reservations"));
const Documents = lazy(() => import("../pages/Admin/Documents"));
const Financings = lazy(() => import("../pages/Admin/FinancingInfo"));
const Payments = lazy(() => import("../pages/Admin/Payments"));
const Sales = lazy(() => import("../pages/Admin/Sales"));
const Releases = lazy(() => import("../pages/Admin/VehicleReleases"));
const Reports = lazy(() => import("../pages/Admin/Reports"));
const RequestServices = lazy(() => import("../pages/Admin/RequestServices"));
const JobOrders = lazy(() => import("../pages/Admin/JobOrders"));
const SchedulePage = lazy(() => import("../components/Shared/Schedule/SchedulePage"));
const ActivityLogs = lazy(() => import("../pages/Admin/ActivityLogs"));
const VehicleParts = lazy(() => import("../pages/Admin/VehicleParts"));
const Staffs = lazy(() => import("../pages/Admin/Staffs"));
const Roles = lazy(() => import("../pages/Admin/Roles"));
const Messages = lazy(() => import("../pages/Admin/Messages"));

//SECRETARY ROUTE
const SecretaryDashboard = lazy(() => import("../pages/Secretary/Dashboard"));
const SecretaryVehicles = lazy(() => import("../pages/Secretary/Vehicles"));
const SecretaryCustomers = lazy(() => import("../pages/Secretary/Customers"));
const SecretaryReservations = lazy(() => import("../pages/Secretary/Reservations"));
const SecretaryDocuments = lazy(() => import("../pages/Secretary/Documents"));
const SecretaryPayments = lazy(() => import("../pages/Secretary/Payments"));
const SecretaryFinancings = lazy(() => import("../pages/Secretary/Financings"));
const SecretarySales = lazy(() => import("../pages/Secretary/Sales"));
const SecretaryReleases = lazy(() => import("../pages/Secretary/VehicleReleases"));
const SecretaryRequestServices = lazy(() => import("../pages/Secretary/RequestServices"));
const SecretaryJobOrders = lazy(() => import("../pages/Secretary/JobOrders"));
const SecretaryReports = lazy(() => import("../pages/Secretary/Reports"));
const SecretaryMessages = lazy(() => import("../pages/Secretary/Messages"));

//CUSTOMER ROUTE
const BrowseVehicles = lazy(() => import("../pages/Customer/BrowseVehicles"));
const Scan = lazy(() => import("../pages/Shared/Scan"));
const Profile = lazy(() => import("../pages/Shared/Profile"));
const Contact = lazy(() => import("../pages/Customer/Contact"));
const AboutUs = lazy(() => import("../pages/Customer/AboutUs"));
const CustomerDashboard = lazy(() => import("../pages/Customer/Dashboard"));
const CustomerVehicles = lazy(() => import("../pages/Customer/Vehicles"));
const CustomerOwnedVehicles = lazy(() => import("../pages/Customer/OwnedVehicles"));
const CustomerReservations = lazy(() => import("../pages/Customer/Reservations"));
const CustomerDocuments = lazy(() => import("../pages/Customer/Documents"));
const CustomerFinancings = lazy(() => import("../pages/Customer/Financings"));
const CustomerPayments = lazy(() => import("../pages/Customer/Payments"));
const CustomerRequestServices = lazy(() => import("../pages/Customer/RequestServices"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      {/* Pages load on demand; show a spinner while a page's code downloads. */}
      <Suspense fallback={<Center minH="60vh"><Spinner color="brand.500" size="lg" thickness="3px" /></Center>}>
      <Routes>
        {/* FRONT PAGE */}
        <Route path="/" element={<Navigate to="/browse-vehicles" replace />} />

        <Route path="/login" element={<CustomerLogin />} />
        {/* Old per-portal login URLs */}
        <Route path="/admin-login" element={<Navigate to="/login" replace />} />
        <Route path="/secretary-login" element={<Navigate to="/login" replace />} />
        <Route path="/customer-login" element={<Navigate to="/login" replace />} />

        <Route path="/browse-vehicles" element={<BrowseVehicles />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<AboutUs />} />

        {/* ADMIN ROUTE */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route element={<AdminMainLayout />}>
            <Route path="/admin-profile" element={<Profile />} />
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/admin-vehicles" element={<Vehicles />} />
            <Route path="/admin-customers" element={<Customers />} />
            <Route path="/admin-reservations" element={<Reservations />} />
            <Route path="/admin-documents" element={<Documents />} />
            <Route path="/admin-financings" element={<Financings />} />
            <Route path="/admin-payments" element={<Payments />} />
            <Route path="/admin-sales" element={<Sales />} />
            <Route path="/admin-releases" element={<Releases />} />
            <Route path="/admin-reports" element={<Reports />} />
            <Route path="/admin-request-services" element={<RequestServices />} />
            <Route path="/admin-job-orders" element={<JobOrders />} />
            <Route path="/admin-schedule" element={<SchedulePage />} />
            <Route path="/admin-activity-logs" element={<ActivityLogs />} />
            <Route path="/admin-vehicle-parts" element={<VehicleParts />} />
            <Route path="/admin-staffs" element={<Staffs />} />
            <Route path="/admin-roles" element={<Roles />} />
            <Route path="/admin-messages" element={<Messages />} />
          </Route>
        </Route>

        {/* SECRETARY ROUTE */}
        <Route element={<ProtectedRoute allowedRoles={["Secretary"]} />}>
          <Route element={<SecretaryMainLayout />}>
            <Route path="/secretary-profile" element={<Profile />} />
            <Route path="/secretary-dashboard" element={<SecretaryDashboard />} />
            <Route path="/secretary-vehicles" element={<SecretaryVehicles />} />
            <Route path="/secretary-customers" element={<SecretaryCustomers />} />
            <Route path="/secretary-reservations" element={<SecretaryReservations />} />
            <Route path="/secretary-documents" element={<SecretaryDocuments />} />
            <Route path="/secretary-payments" element={<SecretaryPayments />} />
            <Route path="/secretary-financings" element={<SecretaryFinancings />} />
            <Route path="/secretary-sales" element={<SecretarySales />} />
            <Route path="/secretary-releases" element={<SecretaryReleases />} />
            <Route path="/secretary-request-services" element={<SecretaryRequestServices />} />
            <Route path="/secretary-job-orders" element={<SecretaryJobOrders />} />
            <Route path="/secretary-schedule" element={<SchedulePage />} />
            <Route path="/secretary-vehicle-parts" element={<VehicleParts />} />
            <Route path="/secretary-reports" element={<SecretaryReports />} />
            <Route path="/secretary-messages" element={<SecretaryMessages />} />

          </Route>
        </Route>

        {/* MECHANIC / WASHER */}
        <Route element={<ProtectedRoute allowedRoles={["Mechanic", "Washer"]} loginPath="/login" />}>
          <Route path="/my-jobs" element={<MyJobs />} />
        </Route>

        {/* CUSTOMER ROUTE */}
        <Route element={<ProtectedRoute allowedRoles={["Customer"]} />}>
          <Route element={<CustomerMainLayout />}>
            <Route path="/customer-profile" element={<Profile />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/customer-vehicles" element={<CustomerVehicles />} />
            <Route path="/customer-owned-vehicles" element={<CustomerOwnedVehicles />} />
            <Route path="/customer-reservations" element={<CustomerReservations />} />
            <Route path="/customer-documents" element={<CustomerDocuments />} />
            <Route path="/customer-payments" element={<CustomerPayments />} />
            <Route path="/customer-financings" element={<CustomerFinancings />} />
            <Route path="/customer-request-services" element={<CustomerRequestServices />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/browse-vehicles" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
