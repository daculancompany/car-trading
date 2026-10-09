import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Box,
    Button,
    Divider,
    Flex,
    Text,
    useToast,
} from "@chakra-ui/react";

import { useRef, useState } from "react";

import {
    archiveVehicle,
    type Vehicle,
} from "../../../api/VehicleManagement/vehicleApi";

interface ArchiveVehicleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: Vehicle | null;
    onArchived?: () => void | Promise<void>;
}

export default function ArchiveVehicleDialog({
    isOpen,
    onClose,
    vehicle,
    onArchived,
}: ArchiveVehicleDialogProps) {
    const cancelRef = useRef<HTMLButtonElement>(null);

    const toast = useToast();
    const [loading, setLoading] = useState(false);

    // HANDLE ARCHIVE

    const handleArchive = async () => {
        if (!vehicle) return;

        try {
            setLoading(true);

            await archiveVehicle(vehicle.id);

            toast({
                title: "Vehicle Archived",
                description:
                    "The vehicle has been archived successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            await onArchived?.();

            onClose();
        } catch (error: any) {
            console.error("Archive vehicle error:", error);

            const errorMessage =
                error?.response?.data?.message ||
                "Unable to archive vehicle.";

            toast({
                title: "Archive Failed",
                description: errorMessage,
                status: "error",
                duration: 4000,
                isClosable: true,
                position: "top-right",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
            isCentered
        >
            <AlertDialogOverlay
                bg="blackAlpha.600"
                backdropFilter="blur(3px)"
            />

            <AlertDialogContent
                mx={4}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="2xl"
            >
                {/* HEADER */}

                <AlertDialogHeader
                    px={6}
                    py={5}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    fontSize="lg"
                    fontWeight="700"
                    color="gray.800"
                >
                    Archive Vehicle
                </AlertDialogHeader>

                {/* BODY */}

                <AlertDialogBody px={6} py={6}>
                    <Text
                        fontSize="sm"
                        color="gray.600"
                        lineHeight="1.6"
                    >
                        Are you sure you want to archive this
                        vehicle?
                    </Text>

                    {/* Vehicle Information */}

                    {vehicle && (
                        <Box
                            mt={5}
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="lg"
                            overflow="hidden"
                            bg="gray.50"
                        >
                            {/* Vehicle Name */}

                            <Box px={4} py={4}>
                                <Text
                                    fontSize="xs"
                                    fontWeight="600"
                                    color="gray.500"
                                    textTransform="uppercase"
                                    letterSpacing="0.04em"
                                    mb={1}
                                >
                                    Vehicle
                                </Text>

                                <Text
                                    fontSize="md"
                                    fontWeight="700"
                                    color="gray.800"
                                >
                                    {vehicle.brand?.brand}{" "}
                                    {vehicle.model?.model}{" "}
                                    {vehicle.variant?.variant}
                                </Text>
                            </Box>

                            <Divider />

                            {/* Stock Number */}

                            <Flex
                                px={4}
                                py={3}
                                justify="space-between"
                                align="center"
                                gap={4}
                            >
                                <Text
                                    fontSize="xs"
                                    fontWeight="600"
                                    color="gray.500"
                                    textTransform="uppercase"
                                    letterSpacing="0.04em"
                                >
                                    Stock No.
                                </Text>

                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.800"
                                >
                                    {vehicle.stock_no || "-"}
                                </Text>
                            </Flex>

                            <Divider />

                            {/* Year Model */}

                            <Flex
                                px={4}
                                py={3}
                                justify="space-between"
                                align="center"
                                gap={4}
                            >
                                <Text
                                    fontSize="xs"
                                    fontWeight="600"
                                    color="gray.500"
                                    textTransform="uppercase"
                                    letterSpacing="0.04em"
                                >
                                    Year Model
                                </Text>

                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.800"
                                >
                                    {vehicle.year_model || "-"}
                                </Text>
                            </Flex>
                        </Box>
                    )}

                    {/* WARNING */}

                    <Box
                        mt={5}
                        px={4}
                        py={3}
                        borderRadius="lg"
                        bg="orange.50"
                        border="1px solid"
                        borderColor="orange.100"
                    >
                        <Text
                            fontSize="sm"
                            fontWeight="600"
                            color="orange.700"
                        >
                            This vehicle will be archived.
                        </Text>

                        <Text
                            mt={1}
                            fontSize="xs"
                            color="orange.600"
                            lineHeight="1.5"
                        >
                            The vehicle will be hidden from active
                            inventory but will remain in the database.
                        </Text>
                    </Box>
                </AlertDialogBody>

                {/* FOOTER */}

                <AlertDialogFooter
                    px={6}
                    py={4}
                    gap={3}
                    borderTop="1px solid"
                    borderColor="gray.100"
                    bg="gray.50"
                >
                    <Button
                        ref={cancelRef}
                        onClick={onClose}
                        isDisabled={loading}
                        size="sm"
                        variant="outline"
                        borderColor="gray.300"
                        bg="white"
                        _hover={{
                            bg: "gray.100",
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        colorScheme="orange"
                        onClick={handleArchive}
                        isLoading={loading}
                        loadingText="Archiving..."
                        size="sm"
                        px={5}
                        boxShadow="sm"
                        _hover={{
                            boxShadow: "md",
                        }}
                    >
                        Archive Vehicle
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}