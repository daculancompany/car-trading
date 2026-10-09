import {
    Alert,
    AlertIcon,
    Button,
    HStack,
    Text,
    useToast,
} from "@chakra-ui/react";

import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
} from "@chakra-ui/react";

import { useRef, useState } from "react";

import {
    updateReservation,
    type Reservation,
} from "../../../api/ReservationManagement/reservationApi";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    reservation: Reservation | null;
    onCancelled: () => void;
}

export default function CustomerCancelReservationDialog({
    isOpen,
    onClose,
    reservation,
    onCancelled,
}: Props) {
    const cancelRef = useRef<HTMLButtonElement>(null);

    const toast = useToast();

    const [loading, setLoading] = useState(false);

    if (!reservation) return null;

    const handleCancel = async () => {
        try {
            setLoading(true);

            // Customer cancellation:
            // DO NOT archive/delete the reservation.
            // Just change the reservation status to cancelled.
            await updateReservation(reservation.id, {
                reservation_status: "cancelled",
            });

            toast({
                title: "Reservation Cancelled",
                description:
                    "Your reservation has been cancelled successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            onCancelled();
            onClose();
        } catch (error) {
            console.error("Cancel reservation error:", error);

            toast({
                title: "Cancellation Failed",
                description:
                    "Unable to cancel the reservation. Please try again.",
                status: "error",
                duration: 3000,
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
            <AlertDialogOverlay />

            <AlertDialogContent>
                <AlertDialogHeader>
                    Cancel Reservation
                </AlertDialogHeader>

                <AlertDialogBody>
                    <Text mb={3}>
                        Are you sure you want to cancel this reservation?
                    </Text>

                    <Text>
                        <strong>Customer:</strong>{" "}
                        {reservation.customer?.first_name}{" "}
                        {reservation.customer?.last_name}
                    </Text>

                    <Text>
                        <strong>Vehicle:</strong>{" "}
                        {reservation.vehicle?.brand?.brand}{" "}
                        {reservation.vehicle?.model?.model}{" "}
                        {reservation.vehicle?.variant?.variant}
                    </Text>

                    <Alert
                        status="warning"
                        mt={5}
                        borderRadius="md"
                    >
                        <AlertIcon />
                        This action will mark the reservation as
                        cancelled.
                    </Alert>
                </AlertDialogBody>

                <AlertDialogFooter>
                    <HStack>
                        <Button
                            ref={cancelRef}
                            onClick={onClose}
                            isDisabled={loading}
                        >
                            Keep Reservation
                        </Button>

                        <Button
                            colorScheme="red"
                            onClick={handleCancel}
                            isLoading={loading}
                            loadingText="Cancelling"
                        >
                            Cancel Reservation
                        </Button>
                    </HStack>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}