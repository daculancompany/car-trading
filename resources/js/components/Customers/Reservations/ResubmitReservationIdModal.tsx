import { useEffect, useState } from "react";

import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";

import {
  resubmitReservationId,
  type Reservation,
} from "../../../api/ReservationManagement/reservationApi";

interface ResubmitReservationIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onSubmitted: () => void;
}

export default function ResubmitReservationIdModal({
  isOpen,
  onClose,
  reservation,
  onSubmitted,
}: ResubmitReservationIdModalProps) {
  const toast = useToast();
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFrontFile(null);
      setBackFile(null);
    }
  }, [isOpen, reservation]);

  if (!reservation) return null;

  const frontNeedsResubmission = reservation.valid_id_front_status === "resubmit";
  const backNeedsResubmission = reservation.valid_id_back_status === "resubmit";

  const handleSubmit = async () => {
    if ((frontNeedsResubmission && !frontFile) || (backNeedsResubmission && !backFile)) {
      toast({
        title: "Replacement ID required",
        description: "Upload a replacement file for each ID side marked for resubmission.",
        status: "warning",
        duration: 3500,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      await resubmitReservationId(reservation.id, {
        ...(frontFile && { valid_id_front: frontFile }),
        ...(backFile && { valid_id_back: backFile }),
      });

      toast({
        title: "Replacement ID submitted",
        description: "Your replacement document was sent for review.",
        status: "success",
        duration: 3500,
        isClosable: true,
      });

      onSubmitted();
      onClose();
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error?.response?.data?.message || "Unable to submit the replacement ID.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent mx={4}>
        <ModalHeader>Resubmit Required Documents</ModalHeader>
        <ModalCloseButton isDisabled={loading} />

        <ModalBody>
          <Stack spacing={4}>
            <Alert status="warning" borderRadius="md" alignItems="flex-start">
              <AlertIcon mt={1} />
              <Text fontSize="sm">
                Upload a clear replacement image for every document requested by our staff.
              </Text>
            </Alert>

            {frontNeedsResubmission && (
              <FormControl isRequired>
                <FormLabel fontSize="sm">ID Front</FormLabel>
                <Text color="gray.500" fontSize="xs" mb={2}>
                  {reservation.valid_id_front_remarks || "The front ID needs to be replaced."}
                </Text>
                <Input
                  type="file"
                  accept="image/jpeg,image/png"
                  p={1}
                  onChange={(event) => setFrontFile(event.target.files?.[0] ?? null)}
                  isDisabled={loading}
                />
              </FormControl>
            )}

            {backNeedsResubmission && (
              <FormControl isRequired>
                <FormLabel fontSize="sm">ID Back</FormLabel>
                <Text color="gray.500" fontSize="xs" mb={2}>
                  {reservation.valid_id_back_remarks || "The back ID needs to be replaced."}
                </Text>
                <Input
                  type="file"
                  accept="image/jpeg,image/png"
                  p={1}
                  onChange={(event) => setBackFile(event.target.files?.[0] ?? null)}
                  isDisabled={loading}
                />
              </FormControl>
            )}

            <Text color="gray.500" fontSize="xs">
              Accepted files: JPG, JPEG, or PNG. Maximum size: 5 MB per file.
            </Text>
          </Stack>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
            Submit for Review
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
