import {
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  Progress,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

// Financing API

import {
  getFinancing,
  type Financing,
} from "../../../../api/FinancingManagement/financingInfoApi";

// Reservation API

import {
  getReservation,
  type Reservation,
} from "../../../../api/ReservationManagement/reservationApi";

// Financing Requirement API

import {
  getActiveFinancingRequirements,
  type FinancingRequirement,
  type FinancingRequirementGroup,
} from "../../../../api/FinancingManagement/requirementApi";

// Financing Document API

import {
  createFinancingDocument,
  type CreateFinancingDocumentData,
} from "../../../../api/FinancingManagement/documentApi";

// Props

interface FinancingRequirementsDocumentsTabProps {
  financingId: number;
}

// Component

export default function FinancingRequirementsDocumentsTab({
  financingId,
}: FinancingRequirementsDocumentsTabProps) {
  const toast = useToast();

  // Financing

  const [, setFinancing] =
    useState<Financing | null>(null);

  const [isLoadingFinancing, setIsLoadingFinancing] =
    useState(false);

  // Reservation / Customer

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [isLoadingCustomer, setIsLoadingCustomer] =
    useState(false);

  // Requirements

  const [requirements, setRequirements] =
    useState<FinancingRequirement[]>([]);

  const [isLoadingRequirements, setIsLoadingRequirements] =
    useState(false);

  // Documents

  const [documents, setDocuments] =
    useState<Record<number, File[]>>({});

  // Remarks

  const [documentRemarks, setDocumentRemarks] =
    useState("");

  // Submit State

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // LOAD FINANCING + CUSTOMER

  useEffect(() => {
    const loadFinancingAndCustomer = async () => {
      if (!financingId) {
        setFinancing(null);
        setReservation(null);
        return;
      }

      try {
        setIsLoadingFinancing(true);
        setIsLoadingCustomer(true);

        // 1. GET FINANCING

        const financingData =
          await getFinancing(financingId);

        setFinancing(financingData);

        // 2. GET RESERVATION

        if (financingData.reservation_id) {
          const reservationData =
            await getReservation(
              financingData.reservation_id,
            );

          setReservation(reservationData);
        } else {
          setReservation(null);
        }
      } catch (error: any) {
        console.error(
          "Failed to load financing/customer:",
          error,
        );

        toast({
          title: "Failed to Load Customer",
          description:
            error?.response?.data?.message ||
            "Unable to load the financing customer information.",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top-right",
        });
      } finally {
        setIsLoadingFinancing(false);
        setIsLoadingCustomer(false);
      }
    };

    loadFinancingAndCustomer();
  }, [financingId, toast]);

  // LOAD ACTIVE REQUIREMENTS

  useEffect(() => {
    const loadRequirements = async () => {
      try {
        setIsLoadingRequirements(true);

        const data =
          await getActiveFinancingRequirements();

        setRequirements(data);
      } catch (error: any) {
        console.error(
          "Failed to load financing requirements:",
          error,
        );

        toast({
          title: "Failed to Load Requirements",
          description:
            error?.response?.data?.message ||
            "Unable to load financing requirements.",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top-right",
        });
      } finally {
        setIsLoadingRequirements(false);
      }
    };

    loadRequirements();
  }, [toast]);

  // CUSTOMER

  const customer =
    reservation?.customer ?? null;

  const civilStatus =
    (customer as Reservation["customer"] & {
      civil_status?: string | null;
    } | null)?.civil_status ?? null;

  const employmentType =
    (customer as Reservation["customer"] & {
      employment_type?: string | null;
    } | null)?.employment_type ?? null;

  // CUSTOMER-SPECIFIC REQUIREMENTS

  const applicableRequirements = useMemo(() => {
    if (!customer) {
      return [];
    }

    return requirements.filter((requirement) => {
      const groupCode =
        requirement.group?.group_code?.toUpperCase();

      switch (groupCode) {
        case "COMMON":
          return true;

        case "EMPLOYED":
          return employmentType === "employed";

        case "SELF_EMPLOYED":
          return employmentType === "self_employed";

        case "MARRIED":
          return civilStatus === "married";

        default:
          return false;
      }
    });
  }, [
    requirements,
    customer,
    employmentType,
    civilStatus,
  ]);

  // GROUP APPLICABLE REQUIREMENTS DYNAMICALLY

  const requirementGroups = useMemo(() => {
    const groups = new Map<
      number,
      {
        group: FinancingRequirementGroup;
        requirements: FinancingRequirement[];
      }
    >();

    applicableRequirements.forEach(
      (requirement) => {
        if (!requirement.group) {
          return;
        }

        const group =
          requirement.group;

        const groupId =
          group.id;

        if (!groups.has(groupId)) {
          groups.set(groupId, {
            group,
            requirements: [],
          });
        }

        groups
          .get(groupId)!
          .requirements.push(
            requirement,
          );
      },
    );

    return Array.from(
      groups.values(),
    );
  }, [applicableRequirements]);

  const isValidIdRequirement = (
    requirement: FinancingRequirement,
  ) =>
    /valid\s*id/i.test(
      requirement.requirement_name,
    );

  const isPayslipRequirement = (
    requirement: FinancingRequirement,
  ) =>
    /payslip/i.test(
      requirement.requirement_name,
    );

  const getRequiredFileCount = (
    requirement: FinancingRequirement,
  ) =>
    isPayslipRequirement(requirement)
      ? 3
      : 1;

  const getReservationFileUrl = (
    path?: string | null,
  ) => {
    if (!path) return null;

    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    return `/storage/${path}`;
  };

  const hasReservationValidId = (
    requirement: FinancingRequirement,
  ) => {
    if (
      !reservation ||
      !isValidIdRequirement(requirement)
    ) {
      return false;
    }

    return Boolean(
      reservation.valid_id_front &&
      reservation.valid_id_back,
    );
  };

  // HANDLE FILE SELECTION

  const handleFileChange = (
    requirementId: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(
      event.target.files ?? [],
    );

    if (files.length === 0) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];

    if (
      files.some(
        (file) =>
          !allowedTypes.includes(file.type),
      )
    ) {
      toast({
        title: "Invalid File Type",
        description:
          "Please upload a JPG, PNG, or PDF file.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      event.target.value = "";

      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (
      files.some(
        (file) => file.size > maxSize,
      )
    ) {
      toast({
        title: "File Too Large",
        description:
          "The maximum allowed file size is 10 MB.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      event.target.value = "";

      return;
    }

    setDocuments((previous) => ({
      ...previous,
      [requirementId]:
        isPayslipRequirement(
          applicableRequirements.find(
            (requirement) =>
              requirement.id ===
              requirementId,
          )!,
        )
          ? [
            ...(previous[
              requirementId
            ] ?? []),
            ...files,
          ].slice(0, 3)
          : [files[0]],
    }));

    event.target.value = "";
  };

  // REMOVE DOCUMENT

  const handleRemoveDocument = (
    requirementId: number,
  ) => {
    setDocuments(
      (previous) => {
        const updated = {
          ...previous,
        };

        delete updated[
          requirementId
        ];

        return updated;
      },
    );
  };

  // HANDLE REMARKS

  const handleRemarksChange = (
    value: string,
  ) => {
    setDocumentRemarks(value);
  };

  // SUBMIT DOCUMENTS

  const handleSubmit = async () => {
    if (!financingId) {
      toast({
        title: "Financing Required",
        description:
          "A financing record is required before documents can be submitted.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    if (!customer) {
      toast({
        title: "Customer Required",
        description:
          "Unable to determine the customer requirements.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    if (
      applicableRequirements.length ===
      0
    ) {
      toast({
        title: "No Requirements",
        description:
          "There are no applicable financing requirements to submit.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    const missingRequirements =
      applicableRequirements.filter(
        (requirement) => {
          if (
            hasReservationValidId(
              requirement,
            )
          ) {
            return false;
          }

          return (
            (documents[
              requirement.id
            ]?.length ?? 0) <
            getRequiredFileCount(
              requirement,
            )
          );
        },
      );

    if (
      missingRequirements.length >
      0
    ) {
      const missingNames =
        missingRequirements
          .map(
            (requirement) =>
              requirement.requirement_name,
          )
          .join(", ");

      toast({
        title:
          "Required Documents Missing",
        description:
          `Please upload: ${missingNames}`,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    const selectedDocuments =
      Object.entries(documents)
        .flatMap(
          ([requirementId, files]) =>
            files.map(
              (file) =>
                [
                  requirementId,
                  file,
                ] as const,
            ),
        )
        .filter(
          ([requirementId]) =>
            applicableRequirements.some(
              (requirement) =>
                requirement.id ===
                Number(
                  requirementId,
                ) &&
                !hasReservationValidId(
                  requirement,
                ),
            ),
        );

    if (
      selectedDocuments.length ===
      0 &&
      totalUploaded <
      totalRequired
    ) {
      toast({
        title:
          "No Documents Selected",
        description:
          "Please select the required financing documents.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    try {
      setIsSubmitting(true);

      for (const [
        requirementId,
        file,
      ] of selectedDocuments) {
        const data: CreateFinancingDocumentData =
        {
          financing_requirement_id:
            Number(
              requirementId,
            ),

          financing_info_id:
            financingId,

          file,

          verified_by: null,

          verified_at: null,

          remarks:
            documentRemarks.trim() ||
            null,
        };

        await createFinancingDocument(
          data,
        );
      }

      toast({
        title:
          "Documents Submitted",
        description:
          "All applicable financing documents have been successfully uploaded.",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });

      setDocuments({});
      setDocumentRemarks("");
    } catch (error: any) {
      console.error(
        "Failed to upload financing documents:",
        error,
      );

      console.error(
        "Validation errors:",
        error?.response?.data
          ?.errors,
      );

      const validationErrors =
        error?.response?.data
          ?.errors;

      let errorDescription =
        error?.response?.data
          ?.message ||
        "Failed to upload financing documents.";

      if (
        validationErrors &&
        typeof validationErrors ===
        "object"
      ) {
        const messages =
          Object.values(
            validationErrors,
          )
            .flat()
            .filter(Boolean);

        if (
          messages.length >
          0
        ) {
          errorDescription =
            messages.join(" ");
        }
      }

      toast({
        title:
          "Submission Failed",
        description:
          errorDescription,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // PROGRESS

  const totalRequired =
    applicableRequirements.reduce(
      (total, requirement) =>
        total +
        getRequiredFileCount(
          requirement,
        ),
      0,
    );

  const totalUploaded =
    applicableRequirements.reduce(
      (total, requirement) => {
        if (
          hasReservationValidId(
            requirement,
          )
        ) {
          return total + 1;
        }

        return (
          total +
          Math.min(
            documents[
              requirement.id
            ]?.length ?? 0,
            getRequiredFileCount(
              requirement,
            ),
          )
        );
      },
      0,
    );

  const progress =
    totalRequired > 0
      ? (totalUploaded /
        totalRequired) *
      100
      : 0;

  // REQUIREMENT CARD

  const renderRequirement = (
    requirement: FinancingRequirement,
  ) => {
    const files =
      documents[
      requirement.id
      ] ?? [];

    if (
      isValidIdRequirement(
        requirement,
      )
    ) {
      const frontUrl =
        getReservationFileUrl(
          reservation?.valid_id_front,
        );

      const backUrl =
        getReservationFileUrl(
          reservation?.valid_id_back,
        );

      const complete =
        hasReservationValidId(
          requirement,
        );

      return (
        <Box
          key={requirement.id}
          borderWidth="1px"
          borderColor={
            complete
              ? "green.200"
              : "gray.200"
          }
          borderRadius="xl"
          overflow="hidden"
          bg="white"
        >
          <Box
            px={{
              base: 4,
              md: 5,
            }}
            py={4}
            bg={
              complete
                ? "green.50"
                : "gray.50"
            }
            borderBottomWidth="1px"
            borderColor="gray.200"
          >
            <HStack
              justify="space-between"
              align="flex-start"
            >
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  color="gray.800"
                >
                  Reservation Valid ID
                </Text>

                <Text
                  fontSize="xs"
                  color="gray.500"
                  mt={1}
                >
                  Using the front and back ID
                  submitted with your
                  reservation.
                </Text>
              </Box>

              <Badge
                colorScheme={
                  complete
                    ? "green"
                    : "orange"
                }
                borderRadius="full"
                px={3}
                fontSize="10px"
              >
                {complete
                  ? "READY"
                  : "MISSING"}
              </Badge>
            </HStack>
          </Box>

          <SimpleGrid
            columns={{
              base: 1,
              md: 2,
            }}
            spacing={4}
            p={{
              base: 4,
              md: 5,
            }}
          >
            {[
              {
                label: "Front",
                url: frontUrl,
              },
              {
                label: "Back",
                url: backUrl,
              },
            ].map((side) => (
              <Box
                key={side.label}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="lg"
                overflow="hidden"
              >
                {side.url ? (
                  <Image
                    src={side.url}
                    alt={`Reservation ID ${side.label}`}
                    w="100%"
                    h="180px"
                    objectFit="contain"
                    bg="gray.50"
                  />
                ) : (
                  <Box
                    h="180px"
                    bg="gray.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text
                      fontSize="sm"
                      color="gray.500"
                    >
                      {side.label} ID
                      unavailable
                    </Text>
                  </Box>
                )}

                <Text
                  px={3}
                  py={2}
                  fontSize="xs"
                  fontWeight="600"
                  color="gray.700"
                >
                  {side.label} of
                  reservation ID
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      );
    }

    const complete =
      files.length >=
      getRequiredFileCount(
        requirement,
      );

    return (
      <Box
        key={requirement.id}
        borderWidth="1px"
        borderColor={
          complete
            ? "green.200"
            : "gray.200"
        }
        borderRadius="xl"
        overflow="hidden"
        bg="white"
        transition="all 0.2s"
        _hover={{
          borderColor:
            complete
              ? "green.300"
              : "purple.200",
        }}
      >
        <Box
          px={{
            base: 4,
            md: 5,
          }}
          py={4}
          bg={
            complete
              ? "green.50"
              : "gray.50"
          }
          borderBottomWidth="1px"
          borderColor="gray.200"
        >
          <HStack
            justify="space-between"
            align="flex-start"
          >
            <Box flex={1}>
              <Text
                fontSize="sm"
                fontWeight="700"
                color="gray.800"
              >
                {
                  requirement.requirement_name
                }
              </Text>

              {requirement.description && (
                <Text
                  fontSize="xs"
                  color="gray.500"
                  mt={1}
                  lineHeight="1.6"
                >
                  {
                    requirement.description
                  }
                </Text>
              )}
            </Box>

            <Badge
              colorScheme={
                complete
                  ? "green"
                  : "orange"
              }
              borderRadius="full"
              px={3}
              fontSize="10px"
            >
              {complete
                ? "UPLOADED"
                : "PENDING"}
            </Badge>
          </HStack>
        </Box>

        <Box
          p={{
            base: 4,
            md: 5,
          }}
        >
          <VStack
            spacing={4}
            align="stretch"
          >
            <HStack
              justify="space-between"
            >
              <Text
                fontSize="xs"
                color="gray.500"
              >
                Document Status
              </Text>

              <Text
                fontSize="sm"
                fontWeight="600"
                color={
                  complete
                    ? "green.600"
                    : "gray.600"
                }
              >
                {Math.min(
                  files.length,
                  getRequiredFileCount(
                    requirement,
                  ),
                )}{" "}
                /{" "}
                {getRequiredFileCount(
                  requirement,
                )}
              </Text>
            </HStack>

            {files.map(
              (file, index) => (
                <Box
                  key={`${file.name}-${index}`}
                  borderWidth="1px"
                  borderColor="green.200"
                  bg="green.50"
                  borderRadius="lg"
                  p={3}
                >
                  <HStack
                    justify="space-between"
                    align="flex-start"
                  >
                    <Box flex={1}>
                      <Text
                        fontSize="xs"
                        fontWeight="600"
                        color="gray.700"
                        wordBreak="break-word"
                      >
                        {file.name}
                      </Text>

                      <Text
                        fontSize="10px"
                        color="gray.500"
                        mt={1}
                      >
                        Document selected
                      </Text>
                    </Box>

                    <Text
                      fontSize="10px"
                      fontWeight="700"
                      color="green.600"
                    >
                      ✓ READY
                    </Text>
                  </HStack>
                </Box>
              ),
            )}

            <FormControl>
              <FormLabel
                fontSize="sm"
                fontWeight="600"
                color="gray.700"
              >
                {isPayslipRequirement(
                  requirement,
                )
                  ? "Upload Payslip"
                  : complete
                    ? "Replace Document"
                    : "Upload Document"}
              </FormLabel>

              <Input
                type="file"
                p={1}
                accept=".jpg,.jpeg,.png,.pdf"
                multiple={isPayslipRequirement(
                  requirement,
                )}
                bg="white"
                borderColor="gray.300"
                focusBorderColor="purple.500"
                _hover={{
                  borderColor:
                    "gray.400",
                }}
                onChange={(event) =>
                  handleFileChange(
                    requirement.id,
                    event,
                  )
                }
              />

              <Text
                fontSize="10px"
                color="gray.500"
                mt={1}
              >
                {isPayslipRequirement(
                  requirement,
                )
                  ? `Upload ${getRequiredFileCount(requirement)} latest monthly payslips.`
                  : "Accepted formats: JPG, PNG, PDF. Maximum size: 10 MB."}
              </Text>
            </FormControl>

            {complete && (
              <Button
                alignSelf="flex-start"
                size="sm"
                variant="outline"
                colorScheme="red"
                onClick={() =>
                  handleRemoveDocument(
                    requirement.id,
                  )
                }
              >
                REMOVE DOCUMENT
              </Button>
            )}
          </VStack>
        </Box>
      </Box>
    );
  };

  // REQUIREMENT SECTION

  const renderSection = (
    group: FinancingRequirementGroup,
    items: FinancingRequirement[],
  ) => {
    if (items.length === 0) {
      return null;
    }

    return (
      <Box key={group.id}>
        <HStack
          justify="space-between"
          align="flex-start"
          mb={4}
        >
          <Box>
            <Text
              fontSize="md"
              fontWeight="700"
              color="gray.800"
            >
              {group.group_name}
            </Text>

            <Text
              fontSize="xs"
              color="gray.500"
              mt={1}
            >
              {group.description ||
                "Required financing documents for this requirement group."}
            </Text>
          </Box>

          <Badge
            colorScheme="purple"
            borderRadius="full"
            px={3}
            fontSize="10px"
          >
            {items.length}{" "}
            {items.length === 1
              ? "REQUIREMENT"
              : "REQUIREMENTS"}
          </Badge>
        </HStack>

        <SimpleGrid
          columns={{
            base: 1,
            lg: 2,
          }}
          spacing={4}
        >
          {items.map(
            renderRequirement,
          )}
        </SimpleGrid>
      </Box>
    );
  };

  // LOADING STATE

  const isLoading =
    isLoadingFinancing ||
    isLoadingCustomer ||
    isLoadingRequirements;

  // UI

  return (
    <VStack
      spacing={6}
      align="stretch"
    >
      {/* HEADER */}

      <Box>
        <HStack
          justify="space-between"
          align="flex-start"
        >
          <Box>
            <Text
              fontSize="lg"
              fontWeight="700"
              color="gray.800"
            >
              Requirements &
              Documents
            </Text>

            <Text
              fontSize="sm"
              color="gray.500"
              mt={1}
            >
              Upload only the
              financing documents
              applicable to this
              customer's profile.
            </Text>
          </Box>

          <Badge
            colorScheme="purple"
            borderRadius="full"
            px={3}
            py={1}
          >
            STEP 3
          </Badge>
        </HStack>
      </Box>

      <Divider />

      {/* CUSTOMER PROFILE */}

      {isLoading && (
        <Box
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="xl"
          p={5}
          bg="gray.50"
        >
          <Text
            fontSize="sm"
            color="gray.500"
          >
            Loading customer
            requirements...
          </Text>
        </Box>
      )}

      {!isLoading &&
        customer && (
          <Box
            borderWidth="1px"
            borderColor="blue.200"
            bg="blue.50"
            borderRadius="xl"
            p={{
              base: 4,
              md: 5,
            }}
          >
            <HStack
              justify="space-between"
              align="flex-start"
              mb={4}
            >
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  color="blue.800"
                >
                  Customer Requirement
                  Profile
                </Text>

                <Text
                  fontSize="xs"
                  color="blue.600"
                  mt={1}
                >
                  Requirements are
                  automatically determined
                  from the customer's civil
                  status and employment type.
                </Text>
              </Box>

              <Badge
                colorScheme="blue"
                borderRadius="full"
                px={3}
              >
                CUSTOMER
              </Badge>
            </HStack>

            <SimpleGrid
              columns={{
                base: 1,
                md: 3,
              }}
              spacing={4}
            >
              <Box>
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  color="blue.500"
                  textTransform="uppercase"
                >
                  Customer
                </Text>

                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color="blue.800"
                  mt={1}
                >
                  {
                    customer.first_name
                  }{" "}
                  {customer.middle_name
                    ? `${customer.middle_name} `
                    : ""}
                  {
                    customer.last_name
                  }
                </Text>
              </Box>

              <Box>
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  color="blue.500"
                  textTransform="uppercase"
                >
                  Civil Status
                </Text>

                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color="blue.800"
                  mt={1}
                  textTransform="capitalize"
                >
                  {civilStatus ||
                    "Not specified"}
                </Text>
              </Box>

              <Box>
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  color="blue.500"
                  textTransform="uppercase"
                >
                  Employment Type
                </Text>

                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color="blue.800"
                  mt={1}
                >
                  {employmentType ===
                    "self_employed"
                    ? "Self-Employed"
                    : employmentType ===
                      "employed"
                      ? "Employed"
                      : "Not specified"}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>
        )}

      {/* NO CUSTOMER */}

      {!isLoading &&
        !customer && (
          <Box
            borderWidth="1px"
            borderColor="red.200"
            bg="red.50"
            borderRadius="xl"
            p={5}
          >
            <Text
              fontSize="sm"
              fontWeight="700"
              color="red.700"
            >
              Customer information
              unavailable
            </Text>

            <Text
              fontSize="xs"
              color="red.600"
              mt={1}
            >
              The customer's civil status
              and employment type could not
              be determined.
            </Text>
          </Box>
        )}

      {/* FINANCING STATUS */}

      {!isLoading &&
        customer && (
          <Box
            borderWidth="1px"
            borderColor="blue.200"
            bg="blue.50"
            borderRadius="xl"
            p={{
              base: 4,
              md: 5,
            }}
          >
            <HStack
              align="flex-start"
              spacing={3}
            >
              <Box
                w="32px"
                h="32px"
                borderRadius="full"
                bg="blue.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  color="blue.600"
                >
                  i
                </Text>
              </Box>

              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  color="blue.800"
                >
                  Financing Document
                  Requirements
                </Text>

                <Text
                  fontSize="xs"
                  color="blue.600"
                  mt={1}
                  lineHeight="1.6"
                >
                  Active requirements are
                  loaded from the financing
                  requirement configuration.
                  Only groups applicable to
                  this customer are displayed.
                </Text>
              </Box>
            </HStack>
          </Box>
        )}

      {/* DOCUMENT PROGRESS */}

      {!isLoading &&
        customer && (
          <Box
            borderWidth="1px"
            borderColor="purple.200"
            bg="purple.50"
            borderRadius="xl"
            p={{
              base: 4,
              md: 5,
            }}
          >
            <HStack
              justify="space-between"
              align="flex-start"
              mb={3}
            >
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  color="purple.800"
                >
                  Document Submission
                </Text>

                <Text
                  fontSize="xs"
                  color="purple.600"
                  mt={1}
                >
                  {totalUploaded} of{" "}
                  {totalRequired}{" "}
                  applicable
                  requirements
                  uploaded
                </Text>
              </Box>

              <Text
                fontSize="sm"
                fontWeight="700"
                color="purple.700"
              >
                {Math.round(
                  progress,
                )}
                %
              </Text>
            </HStack>

            <Progress
              value={progress}
              size="sm"
              colorScheme="purple"
              borderRadius="full"
            />
          </Box>
        )}

      {/* DYNAMIC REQUIREMENT GROUPS */}

      {!isLoading &&
        customer &&
        requirementGroups.map(
          ({
            group,
            requirements:
            groupRequirements,
          }) => (
            <Box key={group.id}>
              {renderSection(
                group,
                groupRequirements,
              )}

              <Divider mt={6} />
            </Box>
          ),
        )}

      {/* NO APPLICABLE REQUIREMENTS */}

      {!isLoading &&
        customer &&
        applicableRequirements.length ===
        0 && (
          <Box
            borderWidth="1px"
            borderColor="orange.200"
            bg="orange.50"
            borderRadius="xl"
            p={5}
          >
            <Text
              fontSize="sm"
              fontWeight="700"
              color="orange.700"
            >
              No Financing
              Requirements Found
            </Text>

            <Text
              fontSize="xs"
              color="orange.600"
              mt={1}
            >
              No active financing
              requirements are currently
              configured for this customer.
            </Text>
          </Box>
        )}

      {/* REMARKS */}

      {!isLoading &&
        customer &&
        applicableRequirements.length >
        0 && (
          <Box
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="xl"
            p={{
              base: 4,
              md: 5,
            }}
            bg="white"
          >
            <Box mb={4}>
              <Text
                fontSize="md"
                fontWeight="700"
                color="gray.800"
              >
                Document Remarks
              </Text>

              <Text
                fontSize="xs"
                color="gray.500"
                mt={1}
              >
                Add any additional notes
                regarding the submitted
                financing documents.
              </Text>
            </Box>

            <FormControl>
              <FormLabel
                fontSize="sm"
                fontWeight="600"
                color="gray.700"
              >
                Remarks
              </FormLabel>

              <Textarea
                value={documentRemarks}
                onChange={(event) =>
                  handleRemarksChange(
                    event.target.value,
                  )
                }
                placeholder="Enter document notes..."
                rows={4}
                resize="vertical"
                bg="white"
                borderColor="gray.300"
                focusBorderColor="purple.500"
                _hover={{
                  borderColor:
                    "gray.400",
                }}
              />
            </FormControl>
          </Box>
        )}

      {/* NOTICE */}

      {!isLoading &&
        customer &&
        applicableRequirements.length >
        0 && (
          <Box
            borderWidth="1px"
            borderColor="orange.200"
            bg="orange.50"
            borderRadius="lg"
            p={4}
          >
            <Text
              fontSize="sm"
              fontWeight="700"
              color="orange.700"
            >
              Document review
            </Text>

            <Text
              fontSize="xs"
              color="orange.600"
              mt={1}
              lineHeight="1.6"
            >
              Submitted documents will be
              reviewed as part of the
              financing application. Upload
              clear and readable copies of all
              applicable requirements.
            </Text>
          </Box>
        )}

      {/* SUBMIT */}

      {!isLoading &&
        customer &&
        applicableRequirements.length >
        0 && (
          <HStack
            justify="flex-end"
            pt={2}
          >
            <Button
              colorScheme="purple"
              px={6}
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Submitting..."
              isDisabled={
                !financingId ||
                totalUploaded !==
                totalRequired
              }
            >
              SUBMIT DOCUMENTS
            </Button>
          </HStack>
        )}
    </VStack>
  );
}