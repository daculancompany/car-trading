import { useRef, useState } from "react";

import {
    Button,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useToast,
} from "@chakra-ui/react";

import {
    archiveCustomer,
    type Customer,
} from "../../../api/UserManagement/customerApi";

interface ArchiveCustomerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    onArchived?: () => void;
}

export default function ArchiveCustomerDialog({
    isOpen,
    onClose,
    customer,
    onArchived,
}: ArchiveCustomerDialogProps) {
    const cancelRef = useRef<HTMLButtonElement>(null);

    const toast = useToast();

    const [loading, setLoading] = useState(false);

    // ARCHIVE CUSTOMER

    const handleArchive = async () => {
        if (!customer) return;

        try {
            setLoading(true);

            await archiveCustomer(customer.id);

            toast({
                title: "Success",
                description: "Customer archived successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            onArchived?.();

            onClose();
        } catch (error) {
            console.error("Archive customer error:", error);

            toast({
                title: "Error",
                description:
                    "Unable to archive customer. The customer may have existing reservations.",
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
            <AlertDialogOverlay />

            <AlertDialogContent>
                {/* Header */}
                <AlertDialogHeader>
                    Archive Customer
                </AlertDialogHeader>

                {/* Body */}
                <AlertDialogBody>
                    Are you sure you want to archive{" "}
                    <strong>
                        {customer?.first_name} {customer?.last_name}
                    </strong>
                    ?

                    <br />

                    This customer will be hidden from the active customer list.
                </AlertDialogBody>

                {/* Footer */}
                <AlertDialogFooter>
                    <Button
                        ref={cancelRef}
                        onClick={onClose}
                        isDisabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        colorScheme="orange"
                        ml={3}
                        onClick={handleArchive}
                        isLoading={loading}
                        loadingText="Archiving"
                    >
                        Archive
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}