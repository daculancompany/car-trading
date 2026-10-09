import api from "../api";

export type SalesPeriod = "7 Days" | "30 Days" | "6 Months" | "1 Year";

export interface SalesData {
  period: string;
  sales: number;
}

export interface DashboardSalesTrend {
  period: SalesPeriod;
  sales_data: SalesData[];
}

export interface DashboardSalesTrendResponse {
  message: string;
  data: DashboardSalesTrend;
}

export const getDashboardSalesTrend = async (
  period: SalesPeriod,
): Promise<DashboardSalesTrend> => {
  const response = await api.get<DashboardSalesTrendResponse>(
    "/dashboard/sales-trend",
    {
      params: {
        period,
      },
    },
  );

  return response.data.data;
};
