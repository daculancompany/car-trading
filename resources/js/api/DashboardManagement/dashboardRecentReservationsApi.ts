import api from "../api";

// Interfaces

export interface RecentReservation {
  reservation_id: number;
  reservation_no: string;
  customer: string;
  vehicle: string;
  date: string;
  status: "Pending" | "Approved" | "Completed" | "Cancelled" | string;
}

export interface DashboardRecentReservationsResponse {
  message: string;
  data: RecentReservation[];
}

// API

export const getDashboardRecentReservations = async (): Promise<
  RecentReservation[]
> => {
  const response = await api.get<DashboardRecentReservationsResponse>(
    "/dashboard/recent-reservations",
  );

  return response.data.data;
};
