import api from "../api";

// TYPES

export interface DashboardStats {
  total_inventory: number;
  available_vehicles: number;
  reserved_vehicles: number;
  vehicles_sold: number;
  under_maintenance: number;

  staff: number;

  monthly_sales: number;
  total_expenses: number;
  monthly_profit: number;

  cost_of_units_sold: number;
  total_parts_cost: number;
  vehicle_expenses: number;

  pending_reservations: number;
  // Job orders that are pending, assigned or in progress.
  pending_job_orders: number;

  customers: number;

  // Work waiting on staff.
  attention: {
    ids_to_review: number;
    payments_to_verify: number;
    documents_to_check: number;
    unassigned_requests: number;
    releases_pending: number;
  };
}

export interface DashboardStatsResponse {
  message: string;
  data: DashboardStats;
}

// DASHBOARD API

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStatsResponse>("/dashboard/stats");

  return response.data.data;
};
