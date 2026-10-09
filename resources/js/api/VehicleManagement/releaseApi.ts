import api from "../api";

// STATUS

export type VehicleReleaseStatus = "pending" | "released" | "cancelled";

// VEHICLE DOCUMENTS

export interface VehicleDocument {
  id: number;

  vehicle_id: number;

  vehicle_cr_path: string | null;
  vehicle_or_path: string | null;

  created_at?: string;
  updated_at?: string;
}

// VEHICLE RELEASE

export interface VehicleRelease {
  id: number;

  sale_id: number;

  release_number: string;

  // System-generated documents
  // PENDING:
  // These are generated dynamically and these paths are NULL.
  // RELEASED:
  // The generated PDFs are permanently saved and these paths contain
  // the saved file locations.

  receipt_path: string | null;

  deed_of_sale_path: string | null;

  status: VehicleReleaseStatus;

  release_date: string | null;

  created_at?: string;
  updated_at?: string;

  // Relationships
  sale?: Sale;

  requestService?: RequestService | null;
}

// SALE

export interface Sale {
  id: number;

  reservation_id: number;

  created_by: number;

  invoice_number: string;

  selling_price: number;

  discount_amount: number | null;

  sale_date: string;

  status: string;

  reservation?: Reservation;
}

// RESERVATION

export interface Reservation {
  id: number;

  customer_id?: number;

  vehicle_id?: number;

  reservation_source?: "online" | "walk_in";

  purchase_option?: "cash" | "financing";

  reservation_status?: string;

  reserved_at?: string;

  expires_at?: string;

  customer?: Customer;

  vehicle?: Vehicle;
}

// CUSTOMER

export interface Customer {
  id: number;

  user_id?: number;

  first_name?: string;

  middle_name?: string | null;

  last_name?: string;

  mobile_number?: string;

  address?: string;

  email?: string;

  user?: User;
}

// VEHICLE

export interface Vehicle {
  id: number;

  stock_no?: string;

  brand_id?: number;
  model_id?: number;
  variant_id?: number;

  year_model?: number;

  color?: string;

  description?: string | null;

  features?: string | null;

  selling_price?: number;

  discount_amount?: number;

  reservation_price?: number;

  status?: string;

  brand?: VehicleBrand;

  model?: VehicleModel;

  variant?: VehicleVariant;

  // Vehicle Specifications

  specs?: VehicleSpecs | null;

  // Vehicle CR / OR

  vehicleDocuments?: VehicleDocument | null;

  vehicle_documents?: VehicleDocument | null;
}

// VEHICLE SPECS

export interface VehicleSpecs {
  id: number;

  vehicle_id: number;

  plate_number: string;

  engine_number: string;

  chassis_number: string;

  mileage: number;

  fuel_type: string;

  transmission: string;
}

// VEHICLE BRAND

export interface VehicleBrand {
  id: number;

  brand: string;
}

// VEHICLE MODEL

export interface VehicleModel {
  id: number;

  brand_id?: number;

  model: string;
}

// VEHICLE VARIANT

export interface VehicleVariant {
  id: number;

  model_id?: number;

  variant: string;
}

// USER

export interface User {
  id: number;

  username?: string;

  email?: string;

  name?: string;
}

// REQUEST SERVICE

export interface RequestService {
  id: number;

  vehicle_release_id?: number;

  service_type?: string;

  status?: string;
}

// CREATE VEHICLE RELEASE
//
// Normally NOT used.
//
// VehicleReleaseService automatically creates the release
// when Sale becomes COMPLETED.
//

export interface CreateVehicleReleaseData {
  sale_id: number;

  release_number: string;
}

// API RESPONSE INTERFACES

interface VehicleReleaseListResponse {
  message: string;

  data: VehicleRelease[];
}

interface VehicleReleaseResponse {
  message: string;

  data: VehicleRelease;
}

interface VehicleDocumentResponse {
  message: string;

  data: VehicleDocument;
}

interface VehicleReleaseMessageResponse {
  message: string;
}

// GET ALL VEHICLE RELEASES
// GET /api/vehicle-releases

export const getVehicleReleases = async (): Promise<VehicleRelease[]> => {
  const response =
    await api.get<VehicleReleaseListResponse>("/vehicle-releases");

  return response.data.data;
};

// GET ONE VEHICLE RELEASE
// GET /api/vehicle-releases/{id}

export const getVehicleRelease = async (
  id: number,
): Promise<VehicleRelease> => {
  const response = await api.get<VehicleReleaseResponse>(
    `/vehicle-releases/${id}`,
  );

  return response.data.data;
};

// CREATE VEHICLE RELEASE
// POST /api/vehicle-releases
//
// Normally NOT used because the backend automatically
// creates the release after Sale becomes COMPLETED.
//

export const createVehicleRelease = async (
  data: CreateVehicleReleaseData,
): Promise<VehicleRelease> => {
  const response = await api.post<VehicleReleaseResponse>(
    "/vehicle-releases",
    data,
  );

  return response.data.data;
};

// VIEW / PRINT RECEIPT
// GET /api/vehicle-releases/{id}/receipt
//
// PENDING:
//     Backend generates Receipt dynamically.
//
// RELEASED:
//     Backend opens the saved Receipt PDF.
//
// Returns Blob.
//
// The frontend can create a Blob URL and open it in a
// browser tab. The browser PDF viewer provides printing.
//

export const viewVehicleReleaseReceipt = async (id: number): Promise<Blob> => {
  const response = await api.get(`/vehicle-releases/${id}/receipt`, {
    responseType: "blob",
  });

  return response.data;
};

// DOWNLOAD RECEIPT
// GET /api/vehicle-releases/{id}/receipt/download
//
// PENDING:
//     Backend generates the PDF dynamically and downloads it.
//
// RELEASED:
//     Backend downloads the permanently saved PDF.
//

export const downloadVehicleReleaseReceipt = async (
  id: number,
): Promise<Blob> => {
  const response = await api.get(`/vehicle-releases/${id}/receipt/download`, {
    responseType: "blob",
  });

  return response.data;
};

// VIEW / PRINT DEED OF SALE
// GET /api/vehicle-releases/{id}/deed-of-sale
//
// PENDING:
//     Backend generates Deed of Sale dynamically.
//
// RELEASED:
//     Backend opens the saved Deed of Sale PDF.
//

export const viewVehicleReleaseDeedOfSale = async (
  id: number,
): Promise<Blob> => {
  const response = await api.get(`/vehicle-releases/${id}/deed-of-sale`, {
    responseType: "blob",
  });

  return response.data;
};

// DOWNLOAD DEED OF SALE
// GET /api/vehicle-releases/{id}/deed-of-sale/download
//
// PENDING:
//     Backend generates the PDF dynamically and downloads it.
//
// RELEASED:
//     Backend downloads the permanently saved PDF.
//

export const downloadVehicleReleaseDeedOfSale = async (
  id: number,
): Promise<Blob> => {
  const response = await api.get(
    `/vehicle-releases/${id}/deed-of-sale/download`,
    {
      responseType: "blob",
    },
  );

  return response.data;
};

// GET VEHICLE DOCUMENTS
// GET /api/vehicles/{vehicle}/documents
//
// Returns CR / OR belonging to the vehicle.
//

export const getVehicleDocuments = async (
  vehicleId: number,
): Promise<VehicleDocument | null> => {
  try {
    const response = await api.get<VehicleDocumentResponse>(
      `/vehicles/${vehicleId}/documents`,
    );

    return response.data.data ?? null;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

// UPLOAD VEHICLE CR / OR
// POST /api/vehicles/{vehicle}/documents

export interface UploadVehicleDocumentData {
  vehicle_cr?: File | null;

  vehicle_or?: File | null;
}

export const uploadVehicleDocuments = async (
  vehicleId: number,
  data: UploadVehicleDocumentData,
): Promise<VehicleDocument> => {
  const formData = new FormData();

  if (data.vehicle_cr) {
    formData.append("vehicle_cr", data.vehicle_cr);
  }

  if (data.vehicle_or) {
    formData.append("vehicle_or", data.vehicle_or);
  }

  const response = await api.post<VehicleDocumentResponse>(
    `/vehicles/${vehicleId}/documents`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
};

// UPDATE VEHICLE CR / OR
// POST /api/vehicles/{vehicle}/documents/update

export const updateVehicleDocuments = async (
  vehicleId: number,
  data: UploadVehicleDocumentData,
): Promise<VehicleDocument> => {
  const formData = new FormData();

  if (data.vehicle_cr) {
    formData.append("vehicle_cr", data.vehicle_cr);
  }

  if (data.vehicle_or) {
    formData.append("vehicle_or", data.vehicle_or);
  }

  const response = await api.post<VehicleDocumentResponse>(
    `/vehicles/${vehicleId}/documents/update`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
};

// DELETE VEHICLE DOCUMENTS
// DELETE /api/vehicles/{vehicle}/documents

export const deleteVehicleDocuments = async (
  vehicleId: number,
): Promise<string> => {
  const response = await api.delete<VehicleReleaseMessageResponse>(
    `/vehicles/${vehicleId}/documents`,
  );

  return response.data.message;
};

// DELETE VEHICLE RELEASE
// DELETE /api/vehicle-releases/{id}

export const deleteVehicleRelease = async (id: number): Promise<string> => {
  const response = await api.delete<VehicleReleaseMessageResponse>(
    `/vehicle-releases/${id}`,
  );

  return response.data.message;
};

// RELEASE VEHICLE
// PATCH /api/vehicle-releases/{id}/release
//
// Backend checks:
//
// ✓ Sale is completed
// ✓ Vehicle exists
// ✓ CR exists
// ✓ OR exists
//
// Then:
//
// ✓ Generates Receipt PDF
// ✓ Generates Deed of Sale PDF
// ✓ Saves both PDF files
// ✓ Saves receipt_path
// ✓ Saves deed_of_sale_path
// ✓ Sets release_date
// ✓ pending → released
//

export const releaseVehicle = async (id: number): Promise<VehicleRelease> => {
  const response = await api.patch<VehicleReleaseResponse>(
    `/vehicle-releases/${id}/release`,
  );

  return response.data.data;
};
