import { Fragment, useEffect, useMemo, useState } from "react";

import {
    Badge,
    Box,
    Button,
    Divider,
    HStack,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
    VStack,
    useToast,
} from "@chakra-ui/react";

import { FiCheck, FiX, FiEye, FiDownload } from "react-icons/fi";

import {
    getFinancing,
    type Financing,
} from "../../../api/FinancingManagement/financingInfoApi";
import {
    getActiveFinancingRequirements,
    type FinancingRequirement,
} from "../../../api/FinancingManagement/requirementApi";

import {
    getFinancingDocuments,
    getFinancingDocumentPreview,
    rejectFinancingDocument,
    verifyFinancingDocument,
} from "../../../api/FinancingManagement/documentApi";
import { createNotification } from "../../../api/Notifications/notificationApi";
import { updateReservation } from "../../../api/ReservationManagement/reservationApi";

import type {
    FinancingDocument,
} from "../../../api/FinancingManagement/documentApi";

// Props

interface FinancingDocumentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    financing: Financing | null;
    onRefresh?: () => void;
}

// Component

const FinancingDocumentsModal = ({
    isOpen,
    onClose,
    financing,
    onRefresh,
}: FinancingDocumentsModalProps) => {
    const toast = useToast();

    // States

    const [documents, setDocuments] = useState<FinancingDocument[]>([]);

    const [requirements, setRequirements] = useState<FinancingRequirement[]>([]);

    const [financingDetails, setFinancingDetails] = useState<Financing | null>(null);

    const [loading, setLoading] = useState(false);

    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const [selectedDocument, setSelectedDocument] =
        useState<FinancingDocument | null>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [previewLoading, setPreviewLoading] = useState(false);

    // Load Documents

    const loadDocuments = async () => {
        if (!financing?.id) {
            setDocuments([]);
            return;
        }

        setLoading(true);

        try {
            // 1. Load financing information
            let financingData: Financing | null = null;

            try {
                financingData = await getFinancing(financing.id);
                setFinancingDetails(financingData);
            } catch (error: any) {
                console.error(
                    "Failed to load financing:",
                    error?.response?.data ?? error
                );
            }

            // 2. Load financing requirements
            try {
                const requirementData = await getActiveFinancingRequirements();
                setRequirements(requirementData);
            } catch (error: any) {
                console.error(
                    "Failed to load financing requirements:",
                    error?.response?.data ?? error
                );
            }

            // 3. Load financing documents
            try {
                const allDocuments = await getFinancingDocuments();

                const filteredDocuments = allDocuments.filter(
                    (document) =>
                        Number(document.financing_info_id) ===
                        Number(financing.id)
                );

                setDocuments(filteredDocuments);
            } catch (error: any) {
                console.error(
                    "Failed to load financing documents:",
                    error?.response?.status
                );

                console.error(
                    "Document API response:",
                    error?.response?.data
                );

                console.error(
                    "Document API error:",
                    error
                );

                toast({
                    title: "Documents failed to load",
                    description:
                        error?.response?.data?.message ??
                        "Unable to retrieve financing documents.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });

                setDocuments([]);
            }
        } finally {
            setLoading(false);
        }
    };

    // Load Documents When Modal Opens

    useEffect(() => {
        if (isOpen && financing?.id) {
            loadDocuments();
        }

        if (!isOpen) {
            setDocuments([]);
            setRequirements([]);
            setFinancingDetails(null);
            handleClosePreview();
        }
    }, [isOpen, financing?.id]);

    // Preview Helpers

    const isPdf = (fileName: string): boolean => {
        return fileName.toLowerCase().endsWith(".pdf");
    };

    const getDocumentName = (
        document: FinancingDocument
    ): string => {
        return document.file_name || "Unnamed document";
    };

    const getRequirementName = (
        document: FinancingDocument
    ): string => {
        return (
            document.financing_requirement?.requirement_name ??
            "Uncategorized"
        );
    };

    const getGroupName = (
        document: FinancingDocument
    ): string => {
        return (
            document.financing_requirement?.group?.group_name ??
            "Uncategorized"
        );
    };

    const getStatusColor = (
        status: FinancingDocument["verification_status"]
    ) => {
        if (status === "verified") return "green";

        if (status === "rejected") return "red";

        return "yellow";
    };

    const groupedDocuments = useMemo(() => {
        const latestByRequirement = new Map<number, FinancingDocument>();

        [...documents]
            .sort((first, second) => {
                const firstDate = new Date(
                    first.created_at ?? first.uploaded_at,
                ).getTime();
                const secondDate = new Date(
                    second.created_at ?? second.uploaded_at,
                ).getTime();

                return secondDate - firstDate || second.id - first.id;
            })
            .forEach((document) => {
                if (!latestByRequirement.has(document.financing_requirement_id)) {
                    latestByRequirement.set(document.financing_requirement_id, document);
                }
            });

        return Array.from(latestByRequirement.values()).sort((first, second) =>
            getGroupName(first).localeCompare(getGroupName(second)),
        );
    }, [documents]);

    const wasResubmitted = (document: FinancingDocument) =>
        documents.some(
            (previousDocument) =>
                previousDocument.financing_requirement_id ===
                document.financing_requirement_id &&
                previousDocument.id !== document.id &&
                previousDocument.verification_status === "rejected",
        );

    const customerName = [
        financingDetails?.reservation?.customer?.first_name ?? financing?.reservation?.customer?.first_name,
        financingDetails?.reservation?.customer?.middle_name ?? financing?.reservation?.customer?.middle_name,
        financingDetails?.reservation?.customer?.last_name ?? financing?.reservation?.customer?.last_name,
    ]
        .filter(Boolean)
        .join(" ");

    const customer = financingDetails?.reservation?.customer;
    const customerData = customer as (Record<string, unknown> | undefined);
    const reservationData = financingDetails?.reservation as
        | (Record<string, unknown> & {
            valid_id_front?: string | null;
            valid_id_back?: string | null;
            valid_id_front_status?: string | null;
            valid_id_back_status?: string | null;
        })
        | undefined;
    const applicableRequirements = requirements.filter((requirement) => {
        const groupCode = requirement.group?.group_code?.toUpperCase();

        if (groupCode === "COMMON") return true;
        if (groupCode === "EMPLOYED") return customerData?.employment_type === "employed";
        if (groupCode === "SELF_EMPLOYED") return customerData?.employment_type === "self_employed";
        if (groupCode === "MARRIED") return customerData?.civil_status === "married";

        return false;
    });

    const requirementGroups = useMemo(() => {
        const groups = new Map<string, FinancingRequirement[]>();

        applicableRequirements.forEach((requirement) => {
            const groupName = requirement.group?.group_name ?? "Other Requirements";
            groups.set(groupName, [...(groups.get(groupName) ?? []), requirement]);
        });

        return Array.from(groups.entries());
    }, [applicableRequirements]);

    const isValidIdRequirement = (requirement: FinancingRequirement) =>
        /valid\s*id|id\s*(front|back)/i.test(requirement.requirement_name);

    const getReservationFileUrl = (path?: string | null) => {
        if (!path) return "";

        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ?? "";
        return `${baseUrl}/storage/${path.replace(/^\/+/, "")}`;
    };

    function renderReservationValidIds() {
        if (!reservationData?.valid_id_front || !reservationData.valid_id_back) {
            return null;
        }

        return (
            <Box mt={3}>
                <Text fontSize="xs" color="purple.600" fontWeight="700" textTransform="uppercase" mb={1}>
                    Requirement Group
                </Text>
                <Text fontSize="md" color="purple.800" fontWeight="700" mb={3}>
                    Common Requirements
                </Text>
                <VStack align="stretch" spacing={3}>
                    {[
                        {
                            label: "Front ID",
                            path: reservationData.valid_id_front,
                            status: reservationData.valid_id_front_status,
                        },
                        {
                            label: "Back ID",
                            path: reservationData.valid_id_back,
                            status: reservationData.valid_id_back_status,
                        },
                    ].map((idDocument) => (
                        <Box key={idDocument.label} borderWidth="1px" borderRadius="lg" p={3}>
                            <Box p={3}>
                                <HStack justify="space-between" align="flex-start">
                                    <Box>
                                        <Text fontSize="sm" fontWeight="600">{idDocument.label}</Text>
                                        <Text fontSize="xs" color="gray.500" mt={1}>
                                            Reservation valid ID
                                        </Text>
                                        <HStack mt={2} spacing={2}>
                                            <Button
                                                size="xs"
                                                colorScheme="blue"
                                                leftIcon={<FiEye />}
                                                onClick={() => handleReservationIdPreview(idDocument.label, idDocument.path)}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    handleDownloadReservationId(
                                                        idDocument.label,
                                                        idDocument.path,
                                                    )
                                                }
                                                size="xs"
                                                colorScheme="orange"
                                                leftIcon={<FiDownload />}
                                            >
                                                Download
                                            </Button>
                                        </HStack>
                                    </Box>
                                    <Badge colorScheme={idDocument.status === "approved" ? "green" : "yellow"}>
                                        {idDocument.status === "approved" ? "VERIFIED" : "SUBMITTED"}
                                    </Badge>
                                </HStack>
                            </Box>
                        </Box>
                    ))}
                </VStack>
            </Box>
        );
    }

    // Handle Preview

    const handlePreview = async (
        document: FinancingDocument
    ) => {
        try {
            setPreviewLoading(true);

            // Remove previous preview URL
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }

            const url = await getFinancingDocumentPreview(
                document.id
            );

            setPreviewUrl(url);

            setSelectedDocument(document);
        } catch (error) {
            console.error("Document preview failed:", error);

            toast({
                title: "Preview failed",
                description: "Unable to display the document.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setPreviewLoading(false);
        }
    };

    // Close Preview

    const handleClosePreview = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(null);

        setSelectedDocument(null);
    };

    const handleDownloadPreview = () => {
        if (!selectedDocument || !previewUrl) return;

        const link = window.document.createElement("a");
        link.href = previewUrl;
        link.download = selectedDocument.file_name || "financing-document";
        link.click();
    };

    const handleDownloadReservationId = async (
        label: string,
        path: string,
    ) => {
        try {
            const response = await fetch(getReservationFileUrl(path));

            if (!response.ok) {
                throw new Error("Unable to download reservation ID.");
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = window.document.createElement("a");

            link.href = url;
            link.download = label.replace(/\s+/g, "-").toLowerCase();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Reservation ID download failed:", error);

            toast({
                title: "Download failed",
                description: "Unable to download the reservation ID.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleReservationIdPreview = (
        label: string,
        path: string,
    ) => {
        setPreviewUrl(getReservationFileUrl(path));
        setSelectedDocument({
            id: 0,
            financing_info_id: financing?.id ?? 0,
            financing_requirement_id: 0,
            verified_by: null,
            file_name: label,
            file_path: path,
            uploaded_at: "",
            verification_status: "verified",
            verified_at: null,
            remarks: null,
        });
    };

    // Verify Document

    const handleVerify = async (
        document: FinancingDocument
    ) => {
        try {
            setActionLoading(document.id);

            await verifyFinancingDocument(document.id);

            toast({
                title: "Document verified",
                description: "The document was successfully verified.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            await loadDocuments();

            const documentsAfterVerification = groupedDocuments.map(
                (financingDocument) =>
                    financingDocument.id === document.id
                        ? {
                            ...financingDocument,
                            verification_status: "verified" as const,
                        }
                        : financingDocument,
            );
            const allDocumentsVerified =
                documentsAfterVerification.length > 0 &&
                documentsAfterVerification.every(
                    (financingDocument) =>
                        financingDocument.verification_status === "verified",
                );
            const customerUserId =
                financingDetails?.reservation?.customer?.user?.id;
            const reservationId = financingDetails?.reservation_id;

            if (allDocumentsVerified && customerUserId && reservationId) {
                try {
                    await updateReservation(reservationId, {
                        reservation_status: "pending_payment",
                    });

                    await createNotification({
                        receiver_user_id: customerUserId,
                        title: "Financing and Documents Verified",
                        message:
                            "Your financing application and all required documents have been verified. Please proceed with the next payment step.",
                        notification_type: "payment",
                    });
                } catch (completionError) {
                    console.error(
                        "Failed to complete financing verification workflow:",
                        completionError,
                    );
                }
            }

            onRefresh?.();
        } catch (error) {
            console.error("Verification failed:", error);

            toast({
                title: "Verification failed",
                description: "Unable to verify the document.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setActionLoading(null);
        }
    };

    // Reject Document

    const handleReject = async (
        document: FinancingDocument
    ) => {
        try {
            setActionLoading(document.id);

            await rejectFinancingDocument(
                document.id,
                "Document rejected by administrator.",
            );

            toast({
                title: "Document rejected",
                description: "The document was rejected.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            await loadDocuments();

            onRefresh?.();
        } catch (error) {
            console.error("Rejection failed:", error);

            toast({
                title: "Rejection failed",
                description: "Unable to reject the document.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setActionLoading(null);
        }
    };

    // Render

    return (
        <>
            {/* MAIN FINANCING DOCUMENTS MODAL */}

            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size="5xl"
                isCentered
                scrollBehavior="inside"
            >
                <ModalOverlay />

                <ModalContent maxH="90vh" overflow="hidden">
                    <ModalHeader>
                        <Text fontSize="xl" fontWeight="700">
                            Customer Financing Requirements
                        </Text>
                        <Text fontSize="sm" fontWeight="400" color="gray.500" mt={1}>
                            {customerName || "Customer"} | Financing #{financing?.id ?? "—"}
                        </Text>
                    </ModalHeader>

                    <ModalCloseButton />

                    <ModalBody overflowY="auto">
                        <VStack
                            align="stretch"
                            spacing={5}
                        >
                            <Divider />

                            <Box>
                                <Text fontWeight="bold" fontSize="md" mb={3}>
                                    Customer Requirements Checklist
                                </Text>

                                {loading ? (
                                    <HStack justify="center" py={4}>
                                        <Spinner size="sm" />
                                        <Text fontSize="sm" color="gray.500">
                                            Loading customer requirements...
                                        </Text>
                                    </HStack>
                                ) : requirementGroups.length === 0 ? (
                                    <Text fontSize="sm" color="gray.500">
                                        No customer-specific requirements were found.
                                    </Text>
                                ) : (
                                    <VStack align="stretch" spacing={3}>
                                        {requirementGroups.map(([groupName, groupRequirements]) => (
                                            <Box key={groupName} borderWidth="1px" borderRadius="md" p={3}>
                                                <Text fontSize="sm" fontWeight="700" color="purple.700" mb={2}>
                                                    {groupName}
                                                </Text>
                                                <VStack align="stretch" spacing={2}>
                                                    {groupRequirements.map((requirement) => {
                                                        const submitted = groupedDocuments.filter(
                                                            (document) =>
                                                                Number(document.financing_requirement_id) === Number(requirement.id),
                                                        );
                                                        const isReservationValidId = isValidIdRequirement(requirement);
                                                        const hasReservationValidId = Boolean(
                                                            isReservationValidId &&
                                                            reservationData?.valid_id_front &&
                                                            reservationData?.valid_id_back,
                                                        );
                                                        const hasSubmitted =
                                                            hasReservationValidId || submitted.length > 0;
                                                        const allVerified =
                                                            hasReservationValidId
                                                                ? reservationData?.valid_id_front_status === "approved" &&
                                                                reservationData?.valid_id_back_status === "approved"
                                                                : hasSubmitted &&
                                                                submitted.every((document) => document.verification_status === "verified");

                                                        return (
                                                            <HStack key={requirement.id} justify="space-between" spacing={3}>
                                                                <Text fontSize="sm" color="gray.700">
                                                                    {requirement.requirement_name}
                                                                </Text>
                                                                <Badge colorScheme={allVerified ? "green" : hasSubmitted ? "yellow" : "red"}>
                                                                    {allVerified ? "Verified" : hasSubmitted ? "Submitted" : "Pending"}
                                                                </Badge>
                                                            </HStack>
                                                        );
                                                    })}
                                                </VStack>
                                            </Box>
                                        ))}
                                    </VStack>
                                )}
                            </Box>

                            {/* Submitted Documents */}

                            <Box>
                                <Text
                                    fontWeight="bold"
                                    fontSize="md"
                                    mb={3}
                                >
                                    Submitted Documents
                                </Text>

                                {renderReservationValidIds()}

                                {loading ? (
                                    <HStack
                                        justify="center"
                                        py={8}
                                    >
                                        <Spinner size="sm" />

                                        <Text
                                            fontSize="sm"
                                            color="gray.500"
                                        >
                                            Loading documents...
                                        </Text>
                                    </HStack>
                                ) : documents.length === 0 ? (
                                    <Box
                                        borderWidth="1px"
                                        borderRadius="lg"
                                        p={6}
                                        textAlign="center"
                                    >
                                        <Text color="gray.500">
                                            No documents available.
                                        </Text>
                                    </Box>
                                ) : (
                                    <VStack
                                        align="stretch"
                                        spacing={4}
                                    >
                                        {groupedDocuments.map(
                                            (document) => {
                                                const isLoading =
                                                    actionLoading ===
                                                    document.id;
                                                const documentIndex = groupedDocuments.indexOf(document);
                                                const groupName = getGroupName(document);
                                                const previousGroupName =
                                                    documentIndex > 0
                                                        ? getGroupName(groupedDocuments[documentIndex - 1])
                                                        : null;
                                                const hasCommonValidIds = Boolean(
                                                    reservationData?.valid_id_front &&
                                                    reservationData?.valid_id_back,
                                                );

                                                return (
                                                    <Fragment key={document.id}>
                                                        {groupName !== previousGroupName &&
                                                            !(groupName.toLowerCase().includes("common") && hasCommonValidIds) && (
                                                                <Box
                                                                    bg="purple.50"
                                                                    borderLeftWidth="4px"
                                                                    borderColor="purple.400"
                                                                    borderRadius="md"
                                                                    px={4}
                                                                    py={3}
                                                                    mt={documentIndex === 0 ? 0 : 3}
                                                                >
                                                                    <Text fontSize="xs" color="purple.600" textTransform="uppercase" fontWeight="700">
                                                                        Requirement Group
                                                                    </Text>
                                                                    <Text fontSize="md" fontWeight="700" color="purple.800">
                                                                        {groupName}
                                                                    </Text>
                                                                </Box>
                                                            )}

                                                        <Box
                                                            borderWidth="1px"
                                                            borderRadius="lg"
                                                            p={4}
                                                        >
                                                            {/* Requirement */}

                                                            <Text
                                                                fontSize="xs"
                                                                color="gray.500"
                                                            >
                                                                Requirement
                                                            </Text>

                                                            <Text
                                                                fontSize="sm"
                                                                fontWeight="medium"
                                                                mb={3}
                                                            >
                                                                {getRequirementName(
                                                                    document
                                                                )}
                                                            </Text>

                                                            <Divider mb={3} />

                                                            {/* File Information */}

                                                            <HStack
                                                                justify="space-between"
                                                                align="start"
                                                                spacing={4}
                                                            >
                                                                <Box flex="1">
                                                                    <Text
                                                                        fontSize="sm"
                                                                        fontWeight="medium"
                                                                        wordBreak="break-word"
                                                                    >
                                                                        {getDocumentName(
                                                                            document
                                                                        )}
                                                                    </Text>

                                                                    <Text
                                                                        fontSize="xs"
                                                                        color="gray.500"
                                                                        mt={1}
                                                                    >
                                                                        Document
                                                                        ID: #
                                                                        {
                                                                            document.id
                                                                        }
                                                                    </Text>

                                                                    <Badge
                                                                        mt={2}
                                                                        colorScheme={getStatusColor(
                                                                            document.verification_status
                                                                        )}
                                                                    >
                                                                        {wasResubmitted(document)
                                                                            ? "RESUBMITTED - NEEDS REVIEW"
                                                                            : document.verification_status.toUpperCase()}
                                                                    </Badge>
                                                                </Box>

                                                                {/* View */}

                                                                <Button
                                                                    size="sm"
                                                                    colorScheme="blue"
                                                                    leftIcon={
                                                                        <FiEye />
                                                                    }
                                                                    isLoading={
                                                                        previewLoading
                                                                    }
                                                                    onClick={() =>
                                                                        handlePreview(
                                                                            document
                                                                        )
                                                                    }
                                                                >
                                                                    View
                                                                </Button>
                                                            </HStack>

                                                            {/* Verify and Reject */}

                                                            {document.verification_status ===
                                                                "pending" && (
                                                                    <HStack
                                                                        justify="end"
                                                                        mt={4}
                                                                        spacing={2}
                                                                    >
                                                                        <Button
                                                                            size="sm"
                                                                            colorScheme="green"
                                                                            leftIcon={
                                                                                <FiCheck />
                                                                            }
                                                                            isLoading={
                                                                                isLoading
                                                                            }
                                                                            onClick={() =>
                                                                                handleVerify(
                                                                                    document
                                                                                )
                                                                            }
                                                                        >
                                                                            Verify
                                                                        </Button>

                                                                        <Button
                                                                            size="sm"
                                                                            colorScheme="red"
                                                                            variant="outline"
                                                                            leftIcon={
                                                                                <FiX />
                                                                            }
                                                                            isLoading={
                                                                                isLoading
                                                                            }
                                                                            onClick={() =>
                                                                                handleReject(
                                                                                    document
                                                                                )
                                                                            }
                                                                        >
                                                                            Reject
                                                                        </Button>
                                                                    </HStack>
                                                                )}

                                                            {/* Remarks */}

                                                            {document.remarks && (
                                                                <Box mt={3}>
                                                                    <Text
                                                                        fontSize="xs"
                                                                        color="gray.500"
                                                                    >
                                                                        Remarks
                                                                    </Text>

                                                                    <Text fontSize="sm">
                                                                        {
                                                                            document.remarks
                                                                        }
                                                                    </Text>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Fragment>
                                                );
                                            }
                                        )}
                                    </VStack>
                                )}
                            </Box>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* DOCUMENT PREVIEW MODAL */}

            <Modal
                isOpen={selectedDocument !== null}
                onClose={handleClosePreview}
                size="6xl"
                isCentered
                scrollBehavior="inside"
            >
                <ModalOverlay />

                <ModalContent maxH="92vh" overflow="hidden">
                    <ModalHeader>
                        {selectedDocument?.file_name ??
                            "Document Preview"}
                    </ModalHeader>

                    <ModalCloseButton />

                    <ModalBody overflowY="auto">
                        {previewLoading ? (
                            <VStack
                                minH="500px"
                                justify="center"
                                spacing={3}
                            >
                                <Spinner size="lg" />

                                <Text color="gray.500">
                                    Loading document preview...
                                </Text>
                            </VStack>
                        ) : selectedDocument && previewUrl ? (
                            <Box
                                width="100%"
                                minH="500px"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                {isPdf(
                                    selectedDocument.file_name
                                ) ? (
                                    <Box width="100%">
                                        <iframe
                                            src={previewUrl}
                                            title={
                                                selectedDocument.file_name
                                            }
                                            width="100%"
                                            height="600px"
                                            style={{
                                                border: "none",
                                            }}
                                        />
                                    </Box>
                                ) : (
                                    <Image
                                        src={previewUrl}
                                        alt={
                                            selectedDocument.file_name
                                        }
                                        width="100%"
                                        maxH="600px"
                                        objectFit="contain"
                                    />
                                )}
                            </Box>
                        ) : (
                            <Text
                                textAlign="center"
                                color="gray.500"
                            >
                                No preview available.
                            </Text>
                        )}
                    </ModalBody>

                    <ModalFooter gap={3}>
                        <Button
                            colorScheme="blue"
                            leftIcon={<FiDownload />}
                            onClick={handleDownloadPreview}
                            isDisabled={!previewUrl || previewLoading}
                        >
                            Download
                        </Button>
                        <Button onClick={handleClosePreview}>
                            Close Preview
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default FinancingDocumentsModal;