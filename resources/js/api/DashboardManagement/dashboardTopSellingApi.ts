import api from "../api";

export type SellingPeriod = "Week" | "Month";

export interface TopSellingVehicle {
  vehicle_id: number;
  vehicle: string;
  sold: number;
}

export interface DashboardTopSelling {
  period: SellingPeriod;
  top_selling_vehicles: TopSellingVehicle[];
}

export interface DashboardTopSellingResponse {
  message: string;
  data: DashboardTopSelling;
}

export const getDashboardTopSelling = async (
  period: SellingPeriod,
): Promise<DashboardTopSelling> => {
  const response = await api.get<DashboardTopSellingResponse>(
    "/dashboard/top-selling",
    {
      params: {
        period,
      },
    },
  );

  return response.data.data;
};
