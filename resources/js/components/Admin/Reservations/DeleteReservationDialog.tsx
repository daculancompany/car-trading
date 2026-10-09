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
    deleteReservation,
    type Reservation,
} from "../../../api/ReservationManagement/reservationApi";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    reservation: Reservation | null;
    onDeleted: () => void;
}

export default function DeleteReservationDialog({
    isOpen,
    onClose,
    reservation,
    onDeleted,
}: Props) {
    const cancelRef = useRef<HTMLButtonElement>(null);

    const toast = useToast();

    const [loading, setLoading] = useState(false);

    if (!reservation) return null;

    const handleDelete = async () => {
        try {
            setLoading(true);

            await deleteReservation(reservation.id);

            toast({
                title: "Reservation Deleted",
                description: "Reservation deleted successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            onDeleted();
            onClose();
        } catch (error) {
            console.error(error);

            toast({
                title: "Delete Failed",
                description: "Unable to delete reservation.",
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
                    Delete Reservation
                </AlertDialogHeader>

                <AlertDialogBody>
                    <Text mb={3}>
                        Are you sure you want to delete this reservation?
                    </Text>

                    <Text>
                        <strong>Reservation #</strong>
                        {reservation.id}
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
                        This action cannot be undone. The uploaded
                        Valid ID image will also be removed permanently.
                    </Alert>
                </AlertDialogBody>

                <AlertDialogFooter>
                    <HStack>
                        <Button
                            ref={cancelRef}
                            onClick={onClose}
                        >
                            Cancel
                        </Button>

                        <Button
                            colorScheme="red"
                            onClick={handleDelete}
                            isLoading={loading}
                        >
                            Delete Reservation
                        </Button>
                    </HStack>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}