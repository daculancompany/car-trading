import { useCallback, useEffect, useState } from "react";

import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";
import { DocumentTextIcon, KeyIcon, PhotoIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

import PageHeader from "../../components/Customers/Dashboard/DashboardPageHeader";
import { EmptyState, InfoGrid, InfoItem, LoadingState, Panel } from "../../components/Shared/ui";
import { getMe } from "../../api/UserManagement/authApi";
import { getSales, type Sale } from "../../api/SaleManagement/saleApi";
import {
  getVehicleDocuments,
  type VehicleDocument,
} from "../../api/VehicleManagement/vehicleDocumentApi";
import {
  getVehicleReleases,
  type VehicleRelease,
  downloadVehicleReleaseDeedOfSale,
  downloadVehicleReleaseReceipt,
  viewVehicleReleaseDeedOfSale,
  viewVehicleReleaseReceipt,
} from "../../api/VehicleManagement/releaseApi";
import { showErrorToast } from "../../utils/apiToast";

const formatDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
};

const formatAmount = (value: number) =>
  Number(value).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function CustomerOwnedVehiclesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [vehicleDocuments, setVehicleDocuments] = useState<VehicleDocument[]>([]);
  const [vehicleReleases, setVehicleReleases] = useState<VehicleRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentViewer, setDocumentViewer] = useState<{
    label: string;
    url: string;
    directUrl?: string;
    releaseId?: number;
    type?: "receipt" | "deed";
  } | null>(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const openGeneratedDocument = async (
    label: string,
    releaseId: number,
    documentType: "receipt" | "deed",
  ) => {
    try {
      setDocumentLoading(true);
      const documentBlob =
        documentType === "receipt"
          ? await viewVehicleReleaseReceipt(releaseId)
          : await viewVehicleReleaseDeedOfSale(releaseId);

      const documentUrl = URL.createObjectURL(documentBlob);
      setDocumentViewer({
        label,
        url: documentUrl,
        releaseId,
        type: documentType,
      });
    } catch (error) {
      showErrorToast(toast, error);
    } finally {
      setDocumentLoading(false);
    }
  };

  const closeDocumentViewer = () => {
    if (documentViewer?.url.startsWith("blob:")) {
      URL.revokeObjectURL(documentViewer.url);
    }
    setDocumentViewer(null);
  };

  const downloadDocument = async () => {
    if (!documentViewer) return;

    try {
      let blob: Blob;

      if (documentViewer.directUrl) {
        const response = await fetch(documentViewer.directUrl);
        blob = await response.blob();
      } else if (documentViewer.releaseId && documentViewer.type) {
        blob =
          documentViewer.type === "receipt"
            ? await downloadVehicleReleaseReceipt(documentViewer.releaseId)
            : await downloadVehicleReleaseDeedOfSale(documentViewer.releaseId);
      } else {
        return;
      }

      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `${documentViewer.label.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      anchor.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      showErrorToast(toast, error);
    }
  };

  const loadOwnedVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const [currentUser, salesResponse, documentsResponse, releasesResponse] =
        await Promise.all([
          getMe(),
          getSales(),
          getVehicleDocuments(),
          getVehicleReleases(),
        ]);

      setSales(
        salesResponse.filter(
          (sale) =>
            sale.status === "completed" &&
            sale.reservation?.customer?.user_id === currentUser.id,
        ),
      );
      setVehicleDocuments(documentsResponse);
      setVehicleReleases(releasesResponse);
    } catch (error) {
      console.error("Failed to load owned vehicles:", error);
      showErrorToast(toast, error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadOwnedVehicles();
  }, [loadOwnedVehicles]);

  return (
    <>
      <PageHeader
        title="My Vehicles"
        subtitle="Cars you bought from us, with release papers."
        onRefresh={loadOwnedVehicles}
        refreshing={loading}
      />

      <Box mt={4}>
        {loading ? (
          <Panel>
            <LoadingState label="Loading your vehicles…" />
          </Panel>
        ) : sales.length === 0 ? (
          <Panel>
            <EmptyState
              icon={KeyIcon}
              title="No vehicles yet"
              message="Once a purchase is completed and the car is released to you, it shows up here with its papers."
              action={
                <Button size="sm" colorScheme="brand" onClick={() => navigate("/customer-vehicles")}>
                  See cars for sale
                </Button>
              }
            />
          </Panel>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, "2xl": 3 }} spacing={4}>
            {sales.map((sale) => {
              const vehicle = sale.reservation?.vehicle;
              const documents = vehicleDocuments.find(
                (document) => document.vehicle_id === vehicle?.id,
              );
              const release = vehicleReleases.find((item) => item.sale_id === sale.id);
              const cover = vehicle?.images?.[0]?.image_path;
              const paid =
                Number(vehicle?.selling_price ?? 0) - Number(sale.discount_amount ?? 0);
              const isReleased = String(release?.status ?? "").toLowerCase() === "released";

              return (
                <Panel key={sale.id} overflow="hidden" display="flex" flexDirection="column">
                  <Box bg="gray.100" position="relative">
                    <AspectRatio ratio={16 / 9}>
                      {cover ? (
                        <Image src={`/storage/${cover}`} alt={vehicle?.model?.model ?? "Vehicle"} objectFit="cover" />
                      ) : (
                        <Flex align="center" justify="center" color="gray.400">
                          <Icon as={PhotoIcon} boxSize={8} />
                        </Flex>
                      )}
                    </AspectRatio>
                    <Badge
                      position="absolute"
                      top={3}
                      left={3}
                      colorScheme={isReleased ? "green" : "orange"}
                      variant="solid"
                      borderRadius="full"
                      px={2.5}
                      fontSize="10px"
                    >
                      {isReleased ? "Released to you" : "Release pending"}
                    </Badge>
                  </Box>

                  <Stack spacing={4} p={{ base: 4, md: 5 }} flex="1" minW={0}>
                    <Box>
                      <Heading size="sm" color="dark.900" noOfLines={1}>
                        {vehicle?.brand?.brand} {vehicle?.model?.model} {vehicle?.variant?.variant}
                      </Heading>
                      <Text fontSize="sm" color="gray.500">
                        {[vehicle?.year_model, vehicle?.color, vehicle?.specs?.plate_number].filter(Boolean).join(" · ")}
                      </Text>
                    </Box>

                    <InfoGrid>
                      <InfoItem label="Invoice" value={sale.invoice_number || "—"} />
                      <InfoItem label="Purchased" value={formatDate(sale.sale_date)} />
                      <InfoItem label="Price paid" value={`₱${formatAmount(paid)}`} />
                      <InfoItem
                        label="Released"
                        value={release?.release_date ? formatDate(release.release_date) : "Not yet"}
                      />
                    </InfoGrid>

                    <Box>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
                          Papers
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {[documents?.vehicle_cr_path, documents?.vehicle_or_path, release, release].filter(Boolean).length} of 4 ready
                        </Text>
                      </Flex>
                      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                        <DocumentLink
                          label="CR"
                          path={documents?.vehicle_cr_path}
                          onOpen={(url) => setDocumentViewer({ label: "CR", url, directUrl: url })}
                        />
                        <DocumentLink
                          label="OR"
                          path={documents?.vehicle_or_path}
                          onOpen={(url) => setDocumentViewer({ label: "OR", url, directUrl: url })}
                        />
                        <DocumentLink
                          label="Receipt"
                          path={release?.receipt_path}
                          onOpenGenerated={
                            release ? () => openGeneratedDocument("Receipt", release.id, "receipt") : undefined
                          }
                        />
                        <DocumentLink
                          label="Deed of Sale"
                          path={release?.deed_of_sale_path}
                          onOpenGenerated={
                            release ? () => openGeneratedDocument("Deed of Sale", release.id, "deed") : undefined
                          }
                        />
                      </SimpleGrid>
                    </Box>

                    <Flex
                      mt="auto"
                      align="center"
                      gap={3}
                      p={3}
                      borderRadius="lg"
                      bg={isReleased ? "brand.50" : "gray.50"}
                      border="1px solid"
                      borderColor={isReleased ? "brand.100" : "gray.200"}
                    >
                      <Flex boxSize="36px" borderRadius="lg" bg={isReleased ? "brand.500" : "gray.300"} color="white" align="center" justify="center" flexShrink={0}>
                        <Icon as={WrenchScrewdriverIcon} boxSize={5} />
                      </Flex>
                      <Box flex="1" minW={0}>
                        <Text fontSize="sm" fontWeight="700" color={isReleased ? "dark.900" : "gray.500"}>
                          Need a check-up or repair?
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {isReleased ? "Book service for this car with our mechanics." : "Available once the car is released to you."}
                        </Text>
                      </Box>
                      <Button
                        size="sm"
                        colorScheme="brand"
                        flexShrink={0}
                        isDisabled={!isReleased}
                        onClick={() => navigate("/customer-request-services")}
                      >
                        Request service
                      </Button>
                    </Flex>
                  </Stack>
                </Panel>
              );
            })}
          </SimpleGrid>
        )}
      </Box>

      <Modal
        isOpen={Boolean(documentViewer) || documentLoading}
        onClose={closeDocumentViewer}
        size="5xl"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent mx={4} h="calc(100vh - 2rem)">
          <ModalHeader>{documentViewer?.label || "Loading document"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0} bg="gray.700">
            {documentViewer ? (
              <Box as="iframe" src={documentViewer.url} w="100%" h="100%" border="0" title={documentViewer.label} />
            ) : (
              <Flex h="100%" align="center" justify="center">
                <Spinner color="white" size="lg" />
              </Flex>
            )}
          </ModalBody>
          <ModalFooter gap={3}>
            <Button onClick={closeDocumentViewer} variant="ghost">
              Close
            </Button>
            <Button onClick={downloadDocument} colorScheme="blue" isDisabled={!documentViewer}>
              Download
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

const DOCUMENT_STYLE: Record<string, { name: string; color: string }> = {
  CR: { name: "Registration", color: "blue" },
  OR: { name: "Official Receipt", color: "teal" },
  Receipt: { name: "Payment receipt", color: "green" },
  "Deed of Sale": { name: "Ownership transfer", color: "purple" },
};

function DocumentLink({
  label,
  path,
  onOpen,
  onOpenGenerated,
}: {
  label: string;
  path?: string | null;
  onOpen?: (url: string) => void;
  onOpenGenerated?: () => void;
}) {
  const url = path
    ? path.startsWith("http://") || path.startsWith("https://")
      ? path
      : getStorageDocumentUrl(path)
    : null;

  const available = Boolean(url || onOpenGenerated);
  const style = DOCUMENT_STYLE[label] ?? { name: "Document", color: "gray" };

  return (
    <Flex
      as="button"
      type="button"
      align="center"
      gap={3}
      w="full"
      textAlign="left"
      p={2.5}
      borderRadius="lg"
      border="1px solid"
      borderColor={available ? "gray.200" : "gray.100"}
      bg={available ? "white" : "gray.50"}
      cursor={available ? "pointer" : "not-allowed"}
      transition="all 0.15s"
      _hover={available ? { borderColor: `${style.color}.300`, bg: `${style.color}.50`, transform: "translateY(-1px)" } : undefined}
      onClick={available ? () => (onOpenGenerated ? onOpenGenerated() : url && onOpen?.(url)) : undefined}
      aria-disabled={!available}
      title={available ? `Open ${label}` : `${label} not available yet`}
    >
      <Flex
        boxSize="36px"
        borderRadius="md"
        bg={available ? `${style.color}.50` : "gray.100"}
        color={available ? `${style.color}.500` : "gray.400"}
        align="center"
        justify="center"
        flexShrink={0}
      >
        <Icon as={DocumentTextIcon} boxSize={5} />
      </Flex>
      <Box flex="1" minW={0}>
        <Text fontSize="sm" fontWeight="700" color={available ? "dark.900" : "gray.400"} noOfLines={1}>
          {label}
        </Text>
        <Text fontSize="xs" color="gray.500" noOfLines={1}>
          {style.name}
        </Text>
      </Box>
      {available ? (
        <Text fontSize="xs" fontWeight="700" color={`${style.color}.600`} flexShrink={0}>
          View →
        </Text>
      ) : (
        <Badge colorScheme="gray" variant="subtle" fontSize="2xs" flexShrink={0}>
          Not yet
        </Badge>
      )}
    </Flex>
  );
}

function getStorageDocumentUrl(path: string) {
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return `/storage/${path}`;
  }

  return `/storage/${path}`;
}
