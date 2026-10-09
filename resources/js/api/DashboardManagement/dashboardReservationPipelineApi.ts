import api from "../api";

// Types

export interface ReservationPipeline {
  pending: number;
  approved: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface PaymentMethods {
  cash: number;
  financing: number;
  total: number;
}

export interface DashboardReservationPipeline {
  reservation_pipeline: ReservationPipeline;
  payment_methods: PaymentMethods;
}

export interface DashboardReservationPipelineResponse {
  message: string;
  data: DashboardReservationPipeline;
}

// Get Reservation Pipeline Statistics

export const getDashboardReservationPipeline =
  async (): Promise<DashboardReservationPipeline> => {
    const response = await api.get<DashboardReservationPipelineResponse>(
      "/dashboard/reservation-pipeline",
    );

    return response.data.data;
  };
