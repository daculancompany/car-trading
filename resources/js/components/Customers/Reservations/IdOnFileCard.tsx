import { useEffect, useState } from "react";
import { Badge, Box, Button, HStack, Image, SimpleGrid, Text } from "@chakra-ui/react";

import {
    getValidIdOnFile,
    type ValidIdOnFile,
} from "../../../api/ReservationManagement/reservationApi";

// Loads the customer's reusable ID each time a reservation modal opens.
export function useValidIdOnFile(isOpen: boolean) {
    const [idOnFile, setIdOnFile] = useState<ValidIdOnFile | null>(null);
    const [useOnFile, setUseOnFile] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;
        setIdOnFile(null);
        setUseOnFile(false);

        getValidIdOnFile()
            .then((data) => {
                if (cancelled) return;
                setIdOnFile(data);
                setUseOnFile(Boolean(data));
            })
            .catch(() => {
                // No ID on file (or not a customer) — fall back to the upload form.
            });

        return () => {
            cancelled = true;
        };
    }, [isOpen]);

    return { idOnFile, useOnFile, setUseOnFile };
}

type Props = {
    idOnFile: ValidIdOnFile;
    onUseDifferent: () => void;
};

export default function IdOnFileCard({ idOnFile, onUseDifferent }: Props) {
    const approved =
        idOnFile.valid_id_front_status === "approved" &&
        idOnFile.valid_id_back_status === "approved";

    return (
        <Box border="1px solid" borderColor="green.200" bg="green.50" borderRadius="md" p={4}>
            <HStack justify="space-between" align="start" mb={3}>
                <Box>
                    <Text fontSize="sm" fontWeight="800" color="gray.800">
                        Using your {idOnFile.valid_id_type}
                    </Text>
                    <Text fontSize="xs" color="gray.600" mt={0.5}>
                        {approved
                            ? "Already verified by our staff — no need to upload it again."
                            : "Same ID from your last reservation. Our staff will review it."}
                    </Text>
                </Box>
                <Badge colorScheme={approved ? "green" : "yellow"} fontSize="0.65rem">
                    {approved ? "Verified" : "For review"}
                </Badge>
            </HStack>

            <SimpleGrid columns={2} spacing={3}>
                {[idOnFile.valid_id_front, idOnFile.valid_id_back].map((path, index) => (
                    <Box key={path} bg="white" border="1px solid" borderColor="gray.200" borderRadius="sm" overflow="hidden">
                        <Image
                            src={`/storage/${path}`}
                            alt={index === 0 ? "ID front" : "ID back"}
                            h="90px"
                            w="100%"
                            objectFit="contain"
                        />
                    </Box>
                ))}
            </SimpleGrid>

            <Button mt={3} size="xs" variant="link" colorScheme="brand" onClick={onUseDifferent}>
                Use a different ID instead
            </Button>
        </Box>
    );
}
