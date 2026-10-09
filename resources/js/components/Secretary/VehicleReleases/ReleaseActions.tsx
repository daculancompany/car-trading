import {
  Flex,
  IconButton,
  Tooltip,
  useToast,
} from "@chakra-ui/react";

import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

import {
  downloadVehicleReleaseDeedOfSale,
  downloadVehicleReleaseReceipt,
  releaseVehicle,
  viewVehicleReleaseDeedOfSale,
  viewVehicleReleaseReceipt,
  type VehicleRelease,
} from "../../../api/VehicleManagement/releaseApi";

interface ReleaseDocumentStatus {
  hasCR: boolean;
  hasOR: boolean;
  complete: boolean;
}

interface ReleaseActionsProps {
  release: VehicleRelease;
  documentStatus: ReleaseDocumentStatus;
  onRefresh: () => void;
}

// RELEASE ACTIONS

export default function ReleaseActions({
  release,
  onRefresh,
}: ReleaseActionsProps) {
  const toast = useToast();

  // VIEW RECEIPT

  const handleViewReceipt = async () => {
    try {
      const blob = await viewVehicleReleaseReceipt(release.id);

      const url = URL.createObjectURL(blob);

      window.open(url, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      console.error("Failed to open receipt:", error);

      toast({
        title: "Unable to open receipt",
        description: "The receipt could not be generated.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // DOWNLOAD RECEIPT

  const handleDownloadReceipt = async () => {
    try {
      const blob = await downloadVehicleReleaseReceipt(
        release.id
      );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `Receipt-${release.release_number}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download receipt:", error);

      toast({
        title: "Download failed",
        description: "Unable to download the receipt.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // VIEW DEED OF SALE

  const handleViewDeedOfSale = async () => {
    try {
      const blob = await viewVehicleReleaseDeedOfSale(
        release.id
      );

      const url = URL.createObjectURL(blob);

      window.open(url, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      console.error(
        "Failed to open deed of sale:",
        error
      );

      toast({
        title: "Unable to open deed of sale",
        description:
          "The deed of sale could not be generated.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // DOWNLOAD DEED OF SALE

  const handleDownloadDeedOfSale = async () => {
    try {
      const blob =
        await downloadVehicleReleaseDeedOfSale(
          release.id
        );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download =
        `Deed-of-Sale-${release.release_number}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Failed to download deed of sale:",
        error
      );

      toast({
        title: "Download failed",
        description:
          "Unable to download the deed of sale.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // VIEW CR

  const handleViewCR = () => {
    const documents =
      release.sale?.reservation?.vehicle?.vehicle_documents;

    const path = documents?.vehicle_cr_path;

    if (!path) {
      toast({
        title: "CR not available",
        description:
          "No CR document has been uploaded for this vehicle.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });

      return;
    }

    const storageUrl =
      import.meta.env.VITE_STORAGE_URL ?? "/storage";

    const url = `${storageUrl}/${path}`;

    window.open(url, "_blank");
  };

  // VIEW OR

  const handleViewOR = () => {
    const documents =
      release.sale?.reservation?.vehicle?.vehicle_documents;

    const path = documents?.vehicle_or_path;

    if (!path) {
      toast({
        title: "OR not available",
        description:
          "No OR document has been uploaded for this vehicle.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });

      return;
    }

    const storageUrl =
      import.meta.env.VITE_STORAGE_URL ?? "/storage";

    const url = `${storageUrl}/${path}`;

    window.open(url, "_blank");
  };

  // RELEASE VEHICLE

  const handleRelease = async () => {
    try {
      await releaseVehicle(release.id);

      toast({
        title: "Vehicle released",
        description:
          "The vehicle has been successfully released.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      onRefresh();
    } catch (error: any) {
      console.error(
        "Failed to release vehicle:",
        error
      );

      const message =
        error?.response?.data?.message ??
        "Unable to release the vehicle.";

      toast({
        title: "Release failed",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  // UI
  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      gap={1}
    >
      {/* RECEIPT + DEED OF SALE View → Download → View → Download */}

      <Flex
        justify="center"
        align="center"
        gap={1}
        flexWrap="nowrap"
      >
        {/* View Receipt */}
        <Tooltip
          label="View Receipt"
          hasArrow
          placement="top"
        >
          <IconButton
            aria-label="View Receipt"
            size="sm"
            variant="ghost"
            color="gray.600"
            icon={
              <EyeIcon
                width={18}
                height={18}
              />
            }
            onClick={handleViewReceipt}
            _hover={{
              bg: "blue.50",
              color: "blue.500",
            }}
          />
        </Tooltip>

        {/* Download Receipt */}
        <Tooltip
          label="Download Receipt"
          hasArrow
          placement="top"
        >
          <IconButton
            aria-label="Download Receipt"
            size="sm"
            variant="ghost"
            color="gray.600"
            icon={
              <ArrowDownTrayIcon
                width={18}
                height={18}
              />
            }
            onClick={handleDownloadReceipt}
            _hover={{
              bg: "orange.50",
              color: "orange.500",
            }}
          />
        </Tooltip>

        {/* View Deed of Sale */}
        <Tooltip
          label="View Deed of Sale"
          hasArrow
          placement="top"
        >
          <IconButton
            aria-label="View Deed of Sale"
            size="sm"
            variant="ghost"
            color="gray.600"
            icon={
              <DocumentTextIcon
                width={18}
                height={18}
              />
            }
            onClick={handleViewDeedOfSale}
            _hover={{
              bg: "purple.50",
              color: "purple.500",
            }}
          />
        </Tooltip>

        {/* Download Deed of Sale */}
        <Tooltip
          label="Download Deed of Sale"
          hasArrow
          placement="top"
        >
          <IconButton
            aria-label="Download Deed of Sale"
            size="sm"
            variant="ghost"
            color="gray.600"
            icon={
              <ArrowDownTrayIcon
                width={18}
                height={18}
              />
            }
            onClick={handleDownloadDeedOfSale}
            _hover={{
              bg: "orange.50",
              color: "orange.500",
            }}
          />
        </Tooltip>
      </Flex>

      {/* VEHICLE DOCUMENTS + RELEASE */}

      <Flex
        justify="center"
        align="center"
        gap={1}
        flexWrap="nowrap"
      >
        {/* View CR */}
        <Tooltip
          label="View CR"
          hasArrow
          placement="top"
        >
          <IconButton
            aria-label="View CR"
            size="sm"
            variant="ghost"
            color="gray.600"
            icon={
              <DocumentTextIcon
                width={18}
                height={18}
              />
            }
            onClick={handleViewCR}
            _hover={{
              bg: "purple.50",
              color: "purple.500",
            }}
          />
        </Tooltip>

        {/* View OR */}
        <Tooltip
          label="View OR"
          hasArrow
          placement="top"
        >
          <IconButton
            aria-label="View OR"
            size="sm"
            variant="ghost"
            color="gray.600"
            icon={
              <DocumentTextIcon
                width={18}
                height={18}
              />
            }
            onClick={handleViewOR}
            _hover={{
              bg: "purple.50",
              color: "purple.500",
            }}
          />
        </Tooltip>

        {/* Release Vehicle */}
        {release.status === "pending" && (
          <Tooltip
            label="Release Vehicle"
            hasArrow
            placement="top"
          >
            <IconButton
              aria-label="Release Vehicle"
              size="sm"
              variant="ghost"
              color="gray.600"
              icon={
                <CheckCircleIcon
                  width={18}
                  height={18}
                />
              }
              onClick={handleRelease}
              _hover={{
                bg: "green.50",
                color: "green.500",
              }}
            />
          </Tooltip>
        )}
      </Flex>
    </Flex>
  );
}

