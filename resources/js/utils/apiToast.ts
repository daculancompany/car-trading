import axios from "axios";
import type { UseToastOptions } from "@chakra-ui/react";

type ToastFunction = (options: UseToastOptions) => void;

export const showSuccessToast = (
  toast: ToastFunction,
  title: string,
  description: string,
) => {
  toast({
    title,
    description,
    status: "success",
    duration: 3000,
    isClosable: true,
    position: "top-right",
  });
};

export const showErrorToast = (
  toast: ToastFunction,
  error: unknown,
  defaultMessage = "Something went wrong.",
) => {
  let title = "Error";
  let description = defaultMessage;

  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (data?.errors) {
      title = "Validation Error";

      description = Object.values(data.errors).flat().join("\n");
    } else if (data?.message) {
      description = data.message;
    } else if (error.message) {
      description = error.message;
    }
  } else if (error instanceof Error) {
    description = error.message;
  }

  toast({
    title,
    description,
    status: "error",
    duration: 5000,
    isClosable: true,
    position: "top-right",
  });
};
