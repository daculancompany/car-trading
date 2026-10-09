import { useEffect, useState } from "react";

import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tooltip,
  VStack,
  useToast,
} from "@chakra-ui/react";

import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import {
  getFinancingDocumentPreview,
  type FinancingDocument,
} from "../../../api/FinancingManagement/documentApi";

import ResubmitDocumentModal from "./ResubmitDocumentModal";

// Props

interface DocumentTableProps {
  documents: FinancingDocument[];
  loading?: boolean;
  onReload?: () => void;
}

// Helpers

const getStatusColor = (
  status?: FinancingDocument["verification_status"]
): string => {
  switch (status) {
    case "verified":
      return "green";

    case "pending":
      return "yellow";

    case "rejected":
      return "red";

    default:
      return "gray";
  }
};

const formatStatus = (
  status?: FinancingDocument["verification_status"]
): string => {
  if (!status) {
    return "Unknown";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDate = (
  date?: string | null
): string => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// File Type Helpers

const getFileExtension = (
  fileName?: string
): string => {
  if (!fileName) {
    return "";
  }

  const cleanName = fileName.split("?")[0];

  const parts = cleanName.split(".");

  if (parts.length < 2) {
    return "";
  }

  return parts[parts.length - 1].toLowerCase();
};

const isImageFile = (
  fileName?: string
): boolean => {
  const extension = getFileExtension(fileName);

  return [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "bmp",
  ].includes(extension);
};

const isPdfFile = (
  fileName?: string
): boolean => {
  return getFileExtension(fileName) === "pdf";
};

// Component

export default function DocumentTable({
  documents,
  loading = false,
  onReload,
}: DocumentTableProps) {
  const toast = useToast();

  // Selected document

  const [selectedDocument, setSelectedDocument] =
    useState<FinancingDocument | null>(null);

  // Preview URL

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [previewLoading, setPreviewLoading] =
    useState(false);

  // Download loading

  const [downloadLoading, setDownloadLoading] =
    useState(false);

  // Resubmit document

  const [selectedRejectedDocument, setSelectedRejectedDocument] =
    useState<FinancingDocument | null>(null);

  // Latest document per requirement

  const latestDocuments = (() => {
    const latestByRequirement =
      new Map<number, FinancingDocument>();

    [...documents]
      .sort((first, second) => {
        const firstDate = new Date(
          first.created_at ?? first.uploaded_at
        ).getTime();

        const secondDate = new Date(
          second.created_at ?? second.uploaded_at
        ).getTime();

        return (
          secondDate - firstDate ||
          second.id - first.id
        );
      })
      .forEach((document) => {
        if (
          !latestByRequirement.has(
            document.financing_requirement_id
          )
        ) {
          latestByRequirement.set(
            document.financing_requirement_id,
            document
          );
        }
      });

    return Array.from(
      latestByRequirement.values()
    );
  })();

  // Cleanup preview URL

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Close Preview Modal

  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setSelectedDocument(null);
    setPreviewLoading(false);
  };

  // View Document

  const handleView = async (
    document: FinancingDocument
  ) => {
    try {
      setSelectedDocument(document);
      setPreviewLoading(true);

      const url =
        await getFinancingDocumentPreview(
          document.id
        );

      setPreviewUrl(url);
    } catch (error) {
      console.error(
        "Document preview failed:",
        error
      );

      setSelectedDocument(null);
      setPreviewUrl(null);

      toast({
        title: "Preview failed",
        description:
          "Unable to preview this document.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  // Download Document

  const handleDownload = async (
    document: FinancingDocument
  ) => {
    try {
      setDownloadLoading(true);

      const url =
        await getFinancingDocumentPreview(
          document.id
        );

      const anchor =
        window.document.createElement("a");

      anchor.href = url;

      anchor.download =
        document.file_name ||
        `document-${document.id}`;

      anchor.target = "_blank";

      window.document.body.appendChild(
        anchor
      );

      anchor.click();

      window.document.body.removeChild(
        anchor
      );

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      console.error(
        "Document download failed:",
        error
      );

      toast({
        title: "Download failed",
        description:
          "Unable to download this document.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  // Render

  return (
    <>
      <Box
        layerStyle="panel"
        p={{ base: 4, md: 5 }}
        overflow="hidden"
        mt={0}
      >
        {/* Header */}

        <Flex
          direction={{
            base: "column",
            md: "row",
          }}
          justify="space-between"
          align={{
            base: "flex-start",
            md: "center",
          }}
          gap={2}
          mb={5}
        >
          <Box>
            <Heading
              size={{
                base: "sm",
                md: "md",
              }}
            >
              Financing Documents
            </Heading>

            <Text
              fontSize={{
                base: "xs",
                md: "sm",
              }}
              color="gray.500"
              mt={1}
            >
              View your financing documents and
              monitor their verification status.
            </Text>
          </Box>
        </Flex>

        {/* Table */}

        <Box overflowX="auto">
          <Table
            variant="simple"
            minW="850px"
          >
            <Thead bg="gray.50">
              <Tr>
                <Th>#</Th>

                <Th>
                  Reservation ID
                </Th>

                <Th>
                  Document
                </Th>

                <Th>
                  Uploaded At
                </Th>

                <Th>
                  Status
                </Th>

                <Th textAlign="center">
                  Actions
                </Th>
              </Tr>
            </Thead>

            <Tbody>
              {/* Loading */}

              {loading ? (
                <Tr>
                  <Td colSpan={6}>
                    <Flex
                      justify="center"
                      align="center"
                      gap={3}
                      py={10}
                    >
                      <Spinner
                        size="md"
                        color="blue.500"
                      />

                      <Text color="gray.500">
                        Loading documents...
                      </Text>
                    </Flex>
                  </Td>
                </Tr>
              ) : latestDocuments.length ===
                0 ? (
                // Empty

                <Tr>
                  <Td colSpan={6}>
                    <Flex
                      justify="center"
                      align="center"
                      py={10}
                    >
                      <VStack
                        spacing={2}
                      >
                        <Icon
                          as={
                            DocumentTextIcon
                          }
                          boxSize={10}
                          color="gray.300"
                        />

                        <Text
                          color="gray.500"
                          fontSize="sm"
                        >
                          No documents found.
                        </Text>
                      </VStack>
                    </Flex>
                  </Td>
                </Tr>
              ) : (
                // Documents

                latestDocuments.map(
                  (
                    document,
                    index
                  ) => {
                    const reservationId =
                      document.financing
                        ?.reservation_id;

                    return (
                      <Tr
                        key={
                          document.id
                        }
                      >
                        {/* Number */}

                        <Td>
                          {index + 1}
                        </Td>

                        {/* Reservation */}

                        <Td>
                          {reservationId
                            ? `#${reservationId}`
                            : "—"}
                        </Td>

                        {/* Document */}

                        <Td>
                          <HStack
                            spacing={3}
                            maxW="300px"
                          >
                            <Flex
                              w="36px"
                              h="36px"
                              bg="blue.50"
                              borderRadius="md"
                              align="center"
                              justify="center"
                              flexShrink={0}
                            >
                              <Icon
                                as={
                                  DocumentTextIcon
                                }
                                boxSize={5}
                                color="blue.500"
                              />
                            </Flex>

                            <Box
                              minW={0}
                            >
                              <Text
                                fontWeight="600"
                                fontSize="sm"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                whiteSpace="nowrap"
                                title={
                                  document.file_name
                                }
                              >
                                {document.file_name ||
                                  "Unnamed document"}
                              </Text>

                              {document
                                .financing_requirement
                                ?.requirement_name && (
                                  <Text
                                    fontSize="xs"
                                    color="gray.500"
                                    mt={0.5}
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    whiteSpace="nowrap"
                                  >
                                    {
                                      document
                                        .financing_requirement
                                        .requirement_name
                                    }
                                  </Text>
                                )}
                            </Box>
                          </HStack>
                        </Td>

                        {/* Uploaded */}

                        <Td>
                          <Text
                            fontSize="sm"
                            whiteSpace="nowrap"
                          >
                            {formatDate(
                              document.uploaded_at
                            )}
                          </Text>
                        </Td>

                        {/* Status */}

                        <Td>
                          <Badge
                            colorScheme={getStatusColor(
                              document.verification_status
                            )}
                            px={2}
                            py={1}
                            borderRadius="md"
                          >
                            {formatStatus(
                              document.verification_status
                            )}
                          </Badge>
                        </Td>

                        {/* Actions */}

                        <Td>
                          <HStack
                            justify="center"
                            spacing={1}
                          >
                            {/* View */}

                            <Tooltip
                              label="View document"
                              placement="top"
                              hasArrow
                            >
                              <Button
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                aria-label="View document"
                                onClick={() =>
                                  handleView(
                                    document
                                  )
                                }
                              >
                                <Icon
                                  as={EyeIcon}
                                  boxSize={5}
                                />
                              </Button>
                            </Tooltip>

                            {/* Resubmit */}

                            {document.verification_status ===
                              "rejected" && (
                                <Tooltip
                                  label="Resubmit document"
                                  placement="top"
                                  hasArrow
                                >
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="orange"
                                    aria-label="Resubmit document"
                                    onClick={() =>
                                      setSelectedRejectedDocument(
                                        document
                                      )
                                    }
                                  >
                                    <Icon
                                      as={
                                        ArrowDownTrayIcon
                                      }
                                      boxSize={5}
                                    />
                                  </Button>
                                </Tooltip>
                              )}
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  }
                )
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Document Preview Modal */}

      <Modal
        isOpen={
          selectedDocument !== null
        }
        onClose={
          handleClosePreview
        }
        size="6xl"
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />

        <ModalContent
          mx={{ base: 2, md: 4 }}
          maxH="90vh"
        >
          {/* Modal Header */}

          <ModalHeader
            pr={12}
          >
            <HStack
              spacing={3}
              align="center"
            >
              <Flex
                w="38px"
                h="38px"
                bg="blue.50"
                borderRadius="md"
                align="center"
                justify="center"
                flexShrink={0}
              >
                <Icon
                  as={
                    DocumentTextIcon
                  }
                  boxSize={5}
                  color="blue.500"
                />
              </Flex>

              <Box
                minW={0}
              >
                <Text
                  fontSize={{
                    base: "sm",
                    md: "md",
                  }}
                  fontWeight="700"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {selectedDocument?.file_name ||
                    "Document Preview"}
                </Text>

                {selectedDocument
                  ?.financing_requirement
                  ?.requirement_name && (
                    <Text
                      fontSize="xs"
                      fontWeight="400"
                      color="gray.500"
                      mt={0.5}
                    >
                      {
                        selectedDocument
                          .financing_requirement
                          .requirement_name
                      }
                    </Text>
                  )}
              </Box>
            </HStack>
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody pb={5}>
            {/* Document Information */}

            {selectedDocument && (
              <Box mb={4}>
                <Flex
                  direction={{
                    base: "column",
                    md: "row",
                  }}
                  justify="space-between"
                  align={{
                    base: "flex-start",
                    md: "center",
                  }}
                  gap={3}
                >
                  <VStack
                    align="flex-start"
                    spacing={1}
                  >
                    <Text
                      fontSize="xs"
                      color="gray.500"
                    >
                      Uploaded
                    </Text>

                    <Text
                      fontSize="sm"
                      fontWeight="500"
                    >
                      {formatDate(
                        selectedDocument.uploaded_at
                      )}
                    </Text>
                  </VStack>

                  <VStack
                    align={{
                      base: "flex-start",
                      md: "flex-end",
                    }}
                    spacing={1}
                  >
                    <Text
                      fontSize="xs"
                      color="gray.500"
                    >
                      Status
                    </Text>

                    <Badge
                      colorScheme={getStatusColor(
                        selectedDocument.verification_status
                      )}
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {formatStatus(
                        selectedDocument.verification_status
                      )}
                    </Badge>
                  </VStack>
                </Flex>

                {selectedDocument.remarks && (
                  <Box
                    mt={3}
                    p={3}
                    bg={
                      selectedDocument.verification_status ===
                        "rejected"
                        ? "red.50"
                        : "gray.50"
                    }
                    borderRadius="md"
                    border="1px solid"
                    borderColor={
                      selectedDocument.verification_status ===
                        "rejected"
                        ? "red.100"
                        : "gray.200"
                    }
                  >
                    <Text
                      fontSize="xs"
                      fontWeight="600"
                      color={
                        selectedDocument.verification_status ===
                          "rejected"
                          ? "red.600"
                          : "gray.600"
                      }
                      mb={1}
                    >
                      Remarks
                    </Text>

                    <Text
                      fontSize="sm"
                      color="gray.700"
                    >
                      {
                        selectedDocument.remarks
                      }
                    </Text>
                  </Box>
                )}
              </Box>
            )}

            <Divider mb={4} />

            {/* Actual Document Preview */}

            <Box
              w="full"
              minH={{
                base: "350px",
                md: "550px",
              }}
              bg="gray.100"
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.200"
              overflow="hidden"
              position="relative"
            >
              {previewLoading ? (
                <Flex
                  minH={{
                    base: "350px",
                    md: "550px",
                  }}
                  justify="center"
                  align="center"
                  direction="column"
                  gap={3}
                >
                  <Spinner
                    size="lg"
                    color="blue.500"
                  />

                  <Text
                    fontSize="sm"
                    color="gray.500"
                  >
                    Loading document...
                  </Text>
                </Flex>
              ) : previewUrl &&
                selectedDocument &&
                isImageFile(
                  selectedDocument.file_name
                ) ? (
                // IMAGE PREVIEW

                <Flex
                  w="full"
                  minH={{
                    base: "350px",
                    md: "550px",
                  }}
                  justify="center"
                  align="center"
                  p={{
                    base: 3,
                    md: 6,
                  }}
                  bg="gray.100"
                >
                  <img
                    src={previewUrl}
                    alt={
                      selectedDocument.file_name ||
                      "Document preview"
                    }
                    style={{
                      maxWidth: "100%",
                      maxHeight: "70vh",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </Flex>
              ) : previewUrl &&
                selectedDocument &&
                isPdfFile(
                  selectedDocument.file_name
                ) ? (
                // PDF PREVIEW

                <iframe
                  src={previewUrl}
                  title={
                    selectedDocument.file_name ||
                    "PDF document preview"
                  }
                  style={{
                    width: "100%",
                    height: "70vh",
                    minHeight: "500px",
                    border: "none",
                    display: "block",
                  }}
                />
              ) : previewUrl ? (
                // OTHER FILE PREVIEW

                <Flex
                  minH={{
                    base: "350px",
                    md: "550px",
                  }}
                  justify="center"
                  align="center"
                  direction="column"
                  gap={3}
                  p={6}
                >
                  <Icon
                    as={
                      DocumentTextIcon
                    }
                    boxSize={12}
                    color="gray.400"
                  />

                  <Text
                    fontWeight="600"
                    color="gray.700"
                    textAlign="center"
                  >
                    Preview is not available
                    for this file type.
                  </Text>

                  <Text
                    fontSize="sm"
                    color="gray.500"
                    textAlign="center"
                  >
                    Please use the download
                    button below to open the
                    document.
                  </Text>
                </Flex>
              ) : (
                // No Preview

                <Flex
                  minH={{
                    base: "350px",
                    md: "550px",
                  }}
                  justify="center"
                  align="center"
                  direction="column"
                  gap={3}
                >
                  <Icon
                    as={
                      DocumentTextIcon
                    }
                    boxSize={12}
                    color="gray.400"
                  />

                  <Text
                    color="gray.500"
                    fontSize="sm"
                  >
                    No document preview
                    available.
                  </Text>
                </Flex>
              )}
            </Box>
          </ModalBody>

          {/* Modal Footer */}

          <ModalFooter>
            <HStack spacing={2}>
              {/* Download */}

              <Tooltip
                label="Download document"
                placement="top"
                hasArrow
              >
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  aria-label="Download document"
                  isLoading={
                    downloadLoading
                  }
                  isDisabled={
                    !selectedDocument ||
                    previewLoading
                  }
                  onClick={() => {
                    if (
                      selectedDocument
                    ) {
                      handleDownload(
                        selectedDocument
                      );
                    }
                  }}
                >
                  {!downloadLoading && (
                    <Icon
                      as={
                        ArrowDownTrayIcon
                      }
                      boxSize={5}
                    />
                  )}
                </Button>
              </Tooltip>

              {/* Close */}

              <Tooltip
                label="Close"
                placement="top"
                hasArrow
              >
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Close document preview"
                  onClick={
                    handleClosePreview
                  }
                >
                  <Icon
                    as={XMarkIcon}
                    boxSize={5}
                  />
                </Button>
              </Tooltip>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Resubmit Modal */}

      <ResubmitDocumentModal
        isOpen={
          selectedRejectedDocument !==
          null
        }
        onClose={() =>
          setSelectedRejectedDocument(
            null
          )
        }
        document={
          selectedRejectedDocument
        }
        onResubmitted={() => {
          setSelectedRejectedDocument(
            null
          );

          onReload?.();
        }}
      />
    </>
  );
}