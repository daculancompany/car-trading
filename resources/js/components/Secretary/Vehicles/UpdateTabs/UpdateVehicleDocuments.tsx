import React, { useEffect, useState } from "react";

import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Flex,
    FormLabel,
    Icon,
    Image,
    SimpleGrid,
    Spinner,
    Text,
    useToast,
} from "@chakra-ui/react";

import {
    DocumentCheckIcon,
    DocumentTextIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";

import type { Vehicle } from "../../../../api/VehicleManagement/vehicleApi";

import {
    getVehicleDocuments,
    updateVehicleDocument,
} from "../../../../api/VehicleManagement/vehicleDocumentApi";

import type {
    VehicleDocument,
} from "../../../../api/VehicleManagement/vehicleDocumentApi";

// TYPES

interface UpdateVehicleDocumentsProps {
    vehicle: Vehicle;
    onReload: () => void | Promise<void>;
    onClose: () => void;
}

interface DocumentFiles {
    vehicle_cr?: File;
    vehicle_or?: File;
}

type DocumentType = "vehicle_cr" | "vehicle_or";

// COMPONENT

const UpdateVehicleDocuments: React.FC<
    UpdateVehicleDocumentsProps
> = ({ vehicle, onReload, onClose }) => {
    const toast = useToast();

    // STATES

    const [vehicleDocument, setVehicleDocument] =
        useState<VehicleDocument | null>(null);

    const [documents, setDocuments] = useState<DocumentFiles>({});

    const [previews, setPreviews] = useState<{
        vehicle_cr?: string;
        vehicle_or?: string;
    }>({});

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [isSubmitting, setIsSubmitting] =
        useState<boolean>(false);

    // BACKEND URL

    const backendUrl =
        import.meta.env.VITE_BACKEND_URL ||
        "";

    // LOAD EXISTING DOCUMENTS

    useEffect(() => {
        let isMounted = true;

        const loadVehicleDocument = async () => {
            try {
                setIsLoading(true);

                const allDocuments = await getVehicleDocuments();

                const existingDocument = allDocuments.find(
                    (document) =>
                        Number(document.vehicle_id) === Number(vehicle.id)
                );

                if (isMounted) {
                    setVehicleDocument(existingDocument ?? null);
                }
            } catch (error) {
                console.error(
                    "Error loading vehicle documents:",
                    error
                );

                toast({
                    title: "Error",
                    description:
                        "Unable to load existing vehicle documents.",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                });
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadVehicleDocument();

        return () => {
            isMounted = false;
        };
    }, [vehicle.id, toast]);

    // CREATE DOCUMENT URL

    const getDocumentUrl = (
        filePath: string | null | undefined
    ): string | null => {
        if (!filePath) {
            return null;
        }

        // Already a complete URL
        if (
            filePath.startsWith("http://") ||
            filePath.startsWith("https://")
        ) {
            return filePath;
        }

        const normalizedPath = filePath.replace(/^\/+/, "");

        // Path already contains storage
        if (normalizedPath.startsWith("storage/")) {
            return `${backendUrl}/${normalizedPath}`;
        }

        return `${backendUrl}/storage/${normalizedPath}`;
    };

    // GET FILE NAME

    const getFileName = (
        filePath: string | null | undefined
    ): string => {
        if (!filePath) {
            return "Existing document";
        }

        return filePath.split("/").pop() || "Existing document";
    };

    // CHECK PDF

    const isPdfFile = (
        file: File | undefined,
        filePath: string | null | undefined
    ): boolean => {
        if (file) {
            return file.type === "application/pdf";
        }

        if (filePath) {
            return filePath
                .split("?")[0]
                .toLowerCase()
                .endsWith(".pdf");
        }

        return false;
    };

    // HANDLE FILE VALIDATION

    const validateFile = (file: File): boolean => {
        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
        ];

        const maxFileSize = 10 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "Invalid file type",
                description:
                    "Only PDF, JPG, JPEG, and PNG files are allowed.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });

            return false;
        }

        if (file.size > maxFileSize) {
            toast({
                title: "File is too large",
                description:
                    "The maximum file size is 10 MB.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });

            return false;
        }

        return true;
    };

    // HANDLE FILE SELECT

    const handleFileSelect = (
        event: React.ChangeEvent<HTMLInputElement>,
        documentType: DocumentType
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!validateFile(file)) {
            event.target.value = "";
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        setDocuments((previous) => ({
            ...previous,
            [documentType]: file,
        }));

        setPreviews((previous) => {
            // Revoke previous preview URL
            const previousUrl = previous[documentType];

            if (previousUrl) {
                URL.revokeObjectURL(previousUrl);
            }

            return {
                ...previous,
                [documentType]: previewUrl,
            };
        });

        // Allow selecting the same file again
        event.target.value = "";
    };

    // REMOVE SELECTED REPLACEMENT

    const removeSelectedFile = (
        documentType: DocumentType
    ) => {
        const previewUrl = previews[documentType];

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setDocuments((previous) => ({
            ...previous,
            [documentType]: undefined,
        }));

        setPreviews((previous) => ({
            ...previous,
            [documentType]: undefined,
        }));
    };

    // CLEAN PREVIEW URLS

    useEffect(() => {
        return () => {
            Object.values(previews).forEach((previewUrl) => {
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
            });
        };
    }, [previews]);

    // RENDER DOCUMENT PREVIEW

    const renderDocumentPreview = (
        documentType: DocumentType,
        existingPath: string | null | undefined
    ) => {
        const selectedFile = documents[documentType];

        const selectedPreview = previews[documentType];

        const existingUrl = getDocumentUrl(existingPath);

        const previewUrl = selectedPreview || existingUrl;

        const isPdf = isPdfFile(
            selectedFile,
            existingPath
        );

        if (!previewUrl) {
            return (
                <Flex
                    minH="220px"
                    align="center"
                    justify="center"
                    direction="column"
                    gap={2}
                    bg="gray.50"
                    borderRadius="lg"
                    border="1px dashed"
                    borderColor="gray.300"
                >
                    <Icon
                        as={DocumentTextIcon}
                        boxSize={12}
                        color="gray.400"
                    />

                    <Text
                        fontSize="sm"
                        color="gray.500"
                    >
                        No document uploaded
                    </Text>
                </Flex>
            );
        }

        if (isPdf) {
            return (
                <Box
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    overflow="hidden"
                    bg="gray.50"
                >
                    <iframe
                        src={previewUrl}
                        title={`${documentType} preview`}
                        width="100%"
                        height="220px"
                        style={{
                            border: "none",
                        }}
                    />
                </Box>
            );
        }

        return (
            <Box
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                overflow="hidden"
                bg="gray.50"
            >
                <Image
                    src={previewUrl}
                    alt={`${documentType} preview`}
                    width="100%"
                    height="220px"
                    objectFit="contain"
                    bg="gray.50"
                />
            </Box>
        );
    };

    // SUBMIT UPDATE

    const handleSubmit = async () => {
        if (!vehicleDocument?.id) {
            toast({
                title: "Document record not found",
                description:
                    "No existing document record was found for this vehicle. Create the document record first.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });

            return;
        }

        if (
            !documents.vehicle_cr &&
            !documents.vehicle_or
        ) {
            toast({
                title: "No changes selected",
                description:
                    "Please select a new CR or OR document.",
                status: "info",
                duration: 4000,
                isClosable: true,
            });

            return;
        }

        try {
            setIsSubmitting(true);

            await updateVehicleDocument(
                vehicleDocument.id,
                {
                    vehicle_id: vehicle.id,
                    vehicle_cr: documents.vehicle_cr,
                    vehicle_or: documents.vehicle_or,
                }
            );

            toast({
                title: "Documents updated",
                description:
                    "Vehicle documents have been updated successfully.",
                status: "success",
                duration: 4000,
                isClosable: true,
            });

            await onReload();

            onClose();
        } catch (error) {
            console.error(
                "Error updating vehicle documents:",
                error
            );

            toast({
                title: "Update failed",
                description:
                    "Unable to update vehicle documents.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // LOADING STATE

    if (isLoading) {
        return (
            <Flex
                justify="center"
                align="center"
                direction="column"
                minH="300px"
                gap={3}
            >
                <Spinner
                    size="lg"
                    color="red.500"
                />

                <Text
                    fontSize="sm"
                    color="gray.500"
                >
                    Loading existing documents...
                </Text>
            </Flex>
        );
    }

    // EXISTING PATHS

    const existingCrPath =
        vehicleDocument?.vehicle_cr_path ?? null;

    const existingOrPath =
        vehicleDocument?.vehicle_or_path ?? null;

    // RENDER

    return (
        <Box>
            <Flex
                direction="column"
                gap={1}
                mb={5}
            >
                <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color="gray.800"
                >
                    Update Vehicle Documents
                </Text>

                <Text
                    fontSize="sm"
                    color="gray.500"
                >
                    Replace the existing Certificate of
                    Registration or Official Receipt.
                </Text>
            </Flex>

            {!vehicleDocument && (
                <Alert
                    status="warning"
                    mb={5}
                    borderRadius="lg"
                >
                    <AlertIcon />

                    No document record was found for this
                    vehicle.
                </Alert>
            )}

            <SimpleGrid
                columns={{
                    base: 1,
                    md: 2,
                }}
                spacing={5}
            >
                {/* VEHICLE CR */}

                <Box
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="xl"
                    p={4}
                    bg="white"
                >
                    <Flex
                        align="center"
                        gap={2}
                        mb={3}
                    >
                        <Icon
                            as={DocumentTextIcon}
                            boxSize={5}
                            color="red.500"
                        />

                        <Text
                            fontWeight="semibold"
                            color="gray.800"
                        >
                            Certificate of Registration
                        </Text>
                    </Flex>

                    <FormLabel
                        htmlFor="vehicle-cr"
                        cursor="pointer"
                        mb={3}
                    >
                        <Flex
                            align="center"
                            justify="center"
                            gap={2}
                            border="1px dashed"
                            borderColor="red.300"
                            borderRadius="lg"
                            py={3}
                            px={3}
                            color="red.500"
                            _hover={{
                                bg: "red.50",
                            }}
                        >
                            <Icon
                                as={DocumentCheckIcon}
                                boxSize={5}
                            />

                            <Text
                                fontSize="sm"
                                fontWeight="medium"
                            >
                                Choose Replacement CR
                            </Text>
                        </Flex>
                    </FormLabel>

                    <input
                        id="vehicle-cr"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        hidden
                        onChange={(event) =>
                            handleFileSelect(
                                event,
                                "vehicle_cr"
                            )
                        }
                    />

                    {renderDocumentPreview(
                        "vehicle_cr",
                        existingCrPath
                    )}

                    <Box mt={3}>
                        <Text
                            fontSize="xs"
                            color="gray.500"
                            mb={1}
                        >
                            {documents.vehicle_cr
                                ? "Selected replacement:"
                                : existingCrPath
                                    ? "Existing document:"
                                    : "Status:"}
                        </Text>

                        <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.700"
                            noOfLines={2}
                        >
                            {documents.vehicle_cr
                                ? documents.vehicle_cr.name
                                : existingCrPath
                                    ? getFileName(existingCrPath)
                                    : "No CR uploaded"}
                        </Text>
                    </Box>

                    {documents.vehicle_cr && (
                        <Button
                            mt={3}
                            size="sm"
                            width="100%"
                            variant="outline"
                            colorScheme="red"
                            leftIcon={
                                <Icon
                                    as={TrashIcon}
                                    boxSize={4}
                                />
                            }
                            onClick={() =>
                                removeSelectedFile(
                                    "vehicle_cr"
                                )
                            }
                        >
                            Remove Replacement
                        </Button>
                    )}
                </Box>

                {/* VEHICLE OR */}

                <Box
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="xl"
                    p={4}
                    bg="white"
                >
                    <Flex
                        align="center"
                        gap={2}
                        mb={3}
                    >
                        <Icon
                            as={DocumentTextIcon}
                            boxSize={5}
                            color="red.500"
                        />

                        <Text
                            fontWeight="semibold"
                            color="gray.800"
                        >
                            Official Receipt
                        </Text>
                    </Flex>

                    <FormLabel
                        htmlFor="vehicle-or"
                        cursor="pointer"
                        mb={3}
                    >
                        <Flex
                            align="center"
                            justify="center"
                            gap={2}
                            border="1px dashed"
                            borderColor="red.300"
                            borderRadius="lg"
                            py={3}
                            px={3}
                            color="red.500"
                            _hover={{
                                bg: "red.50",
                            }}
                        >
                            <Icon
                                as={DocumentCheckIcon}
                                boxSize={5}
                            />

                            <Text
                                fontSize="sm"
                                fontWeight="medium"
                            >
                                Choose Replacement OR
                            </Text>
                        </Flex>
                    </FormLabel>

                    <input
                        id="vehicle-or"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        hidden
                        onChange={(event) =>
                            handleFileSelect(
                                event,
                                "vehicle_or"
                            )
                        }
                    />

                    {renderDocumentPreview(
                        "vehicle_or",
                        existingOrPath
                    )}

                    <Box mt={3}>
                        <Text
                            fontSize="xs"
                            color="gray.500"
                            mb={1}
                        >
                            {documents.vehicle_or
                                ? "Selected replacement:"
                                : existingOrPath
                                    ? "Existing document:"
                                    : "Status:"}
                        </Text>

                        <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.700"
                            noOfLines={2}
                        >
                            {documents.vehicle_or
                                ? documents.vehicle_or.name
                                : existingOrPath
                                    ? getFileName(existingOrPath)
                                    : "No OR uploaded"}
                        </Text>
                    </Box>

                    {documents.vehicle_or && (
                        <Button
                            mt={3}
                            size="sm"
                            width="100%"
                            variant="outline"
                            colorScheme="red"
                            leftIcon={
                                <Icon
                                    as={TrashIcon}
                                    boxSize={4}
                                />
                            }
                            onClick={() =>
                                removeSelectedFile(
                                    "vehicle_or"
                                )
                            }
                        >
                            Remove Replacement
                        </Button>
                    )}
                </Box>
            </SimpleGrid>

            {/* ACTION BUTTONS */}

            <Flex
                justify="flex-end"
                gap={3}
                mt={6}
            >
                <Button
                    variant="outline"
                    onClick={onClose}
                    isDisabled={isSubmitting}
                >
                    Cancel
                </Button>

                <Button
                    colorScheme="red"
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    loadingText="Updating..."
                >
                    Update Documents
                </Button>
            </Flex>
        </Box>
    );
};

export default UpdateVehicleDocuments;