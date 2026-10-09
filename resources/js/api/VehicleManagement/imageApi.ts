import api from "../api";

// Vehicle Image Interfaces

export interface VehicleImageBrand {
  id: number;
  brand: string;
  is_active?: boolean;
}

export interface VehicleImageModel {
  id: number;
  brand_id: number;
  model: string;
  is_active?: boolean;
}

export interface VehicleImageVariant {
  id: number;
  model_id: number;
  variant: string;
  is_active?: boolean;
}

export interface VehicleImageVehicle {
  id: number;

  brand_id: number;
  model_id: number;
  variant_id: number;

  stock_no?: string;
  year_model?: number;
  color?: string;

  brand?: VehicleImageBrand;
  model?: VehicleImageModel;
  variant?: VehicleImageVariant;
}

// Vehicle Image

export interface VehicleImage {
  id: number;

  vehicle_id: number;

  image_path: string;

  vehicle?: VehicleImageVehicle;

  created_at?: string;
  updated_at?: string;
}

// Create Vehicle Images

export interface CreateVehicleImagesData {
  vehicle_id: number;
  images: File[];
}

// Update Vehicle Image

export interface UpdateVehicleImageData {
  image: File;
}

// API Responses

interface VehicleImageResponse {
  message: string;
  data: VehicleImage;
}

interface VehicleImageListResponse {
  message: string;
  data: VehicleImage[];
}

interface VehicleImageUploadResponse {
  message: string;
  data: VehicleImage[];
}

// GET ALL VEHICLE IMAGES
// GET /api/vehicle-images

export const getVehicleImages = async (): Promise<VehicleImage[]> => {
  const response = await api.get<VehicleImageListResponse>("/vehicle-images");

  return response.data.data;
};

// GET SINGLE VEHICLE IMAGE
// GET /api/vehicle-images/{id}

export const getVehicleImage = async (id: number): Promise<VehicleImage> => {
  const response = await api.get<VehicleImageResponse>(`/vehicle-images/${id}`);

  return response.data.data;
};

// UPLOAD MULTIPLE VEHICLE IMAGES
// POST /api/vehicle-images

export const uploadVehicleImages = async (
  data: CreateVehicleImagesData,
): Promise<VehicleImage[]> => {
  const formData = new FormData();

  formData.append("vehicle_id", String(data.vehicle_id));

  data.images.forEach((image) => {
    formData.append("images[]", image, image.name);
  });

  const response = await api.post<VehicleImageUploadResponse>(
    "/vehicle-images",
    formData,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  return response.data.data;
};

// UPDATE / REPLACE VEHICLE IMAGE
// PUT /api/vehicle-images/{id}

export const updateVehicleImage = async (
  id: number,
  data: UpdateVehicleImageData,
): Promise<VehicleImage> => {
  const formData = new FormData();

  formData.append("image", data.image);

  const response = await api.post<VehicleImageResponse>(
    `/vehicle-images/${id}?_method=PUT`,
    formData,
  );

  return response.data.data;
};

// DELETE VEHICLE IMAGE
// DELETE /api/vehicle-images/{id}

export const deleteVehicleImage = async (id: number): Promise<void> => {
  await api.delete(`/vehicle-images/${id}`);
};
