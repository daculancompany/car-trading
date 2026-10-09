import api from "../api";

// Interfaces

export interface LatestVehicle {
  vehicle_id: number;
  stock_no: string;
  vehicle: string;
  price: number;
  status: "Available" | "Reserved" | "Sold" | "Maintenance" | string;
  created_at: string;
}

export interface DashboardLatestVehiclesResponse {
  message: string;
  data: LatestVehicle[];
}

// API

export const getDashboardLatestVehicles = async (): Promise<
  LatestVehicle[]
> => {
  const response = await api.get<DashboardLatestVehiclesResponse>(
    "/dashboard/latest-vehicles",
  );

  return response.data.data;
};
