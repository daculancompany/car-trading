import api from "../api";

// Types

export type FinancialPeriod = "Week" | "Month";

export interface FinancialData {
  period: string;
  sales: number;
  expenses: number;
  profit: number;
}

export interface DashboardFinancialPerformance {
  period: FinancialPeriod;
  financial_data: FinancialData[];
}

export interface DashboardFinancialPerformanceResponse {
  message: string;
  data: DashboardFinancialPerformance;
}

// Get Financial Performance

export const getDashboardFinancialPerformance = async (
  period: FinancialPeriod,
): Promise<DashboardFinancialPerformance> => {
  const response = await api.get<DashboardFinancialPerformanceResponse>(
    "/dashboard/financial-performance",
    {
      params: {
        period,
      },
    },
  );

  return response.data.data;
};
