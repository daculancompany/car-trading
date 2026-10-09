import api from "../api";

export interface VehicleStatusData {
  name: string;
  value: number;
}

export interface DashboardVehicleStatusResponse {
  message: string;
  data: VehicleStatusData[];
}

export const getDashboardVehicleStatus = async (): Promise<
  VehicleStatusData[]
> => {
  const response = await api.get<DashboardVehicleStatusResponse>(
    "/dashboard/vehicle-status",
  );

  return response.data.data;
};
