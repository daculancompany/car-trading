import { useEffect, useState } from "react";

import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Image,
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
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import {
  resubmitPaymentProof,
  type Payment,
} from "../../../api/PaymentManagement/paymentApi";

interface ResubmitPaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onSubmitted: () => void;
}

export default function ResubmitPaymentProofModal({
  isOpen,
  onClose,
  payment,
  onSubmitted,
}: ResubmitPaymentProofModalProps) {
  const toast = useToast();

  const [proof, setProof] =
    useState<File | null>(null);

  const [referenceNumber, setReferenceNumber] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure();

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  // RESET FORM

  useEffect(() => {
    if (isOpen) {
      setProof(null);
      setReferenceNumber(
        payment?.reference_number ?? ""
      );
      setPreviewUrl(null);
    }
  }, [isOpen, payment]);

  // CLEAN OBJECT URL

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!payment) {
    return null;
  }

  // FILE CHANGE

  const handleProofChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0] ?? null;

    if (!file) {
      setProof(null);
      setPreviewUrl(null);
      return;
    }

    // Remove previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setProof(file);
    const url =
      URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // SUBMIT

  const handleSubmit = async () => {
    if (!proof) {
      toast({
        title: "Payment proof required",
        description:
          "Please upload a replacement payment proof.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      await resubmitPaymentProof(
        payment.id,
        {
          payment_proof: proof,
          reference_number:
            referenceNumber.trim() || null,
        }
      );

      toast({
        title:
          "Payment proof resubmitted",
        description:
          "Your payment is waiting for staff verification again.",
        status: "success",
        duration: 3500,
        isClosable: true,
      });

      onSubmitted();
      onClose();
    } catch (error: any) {
      toast({
        title: "Resubmission failed",
        description:
          error?.response?.data?.message ||
          "Unable to resubmit payment proof.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* RESUBMIT MODAL */}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        size={{
          base: "full",
          sm: "md",
          md: "lg",
        }}
      >
        <ModalOverlay bg="blackAlpha.600" />

        <ModalContent
          mx={{
            base: 0,
            sm: 4,
          }}
          borderRadius={{
            base: "none",
            sm: "xl",
          }}
          overflow="hidden"
        >
          <ModalHeader>
            Resubmit Payment Proof
          </ModalHeader>

          <ModalCloseButton
            isDisabled={loading}
          />

          <ModalBody>
            <Stack spacing={5}>
              {/* REJECTION NOTICE */}

              <Alert
                status="error"
                borderRadius="md"
                alignItems="flex-start"
              >
                <AlertIcon mt={1} />

                <Text fontSize="sm">
                  Your payment was rejected.
                  Upload a corrected proof
                  for staff review.
                </Text>
              </Alert>

              {/* STAFF REMARKS */}

              {payment.remarks && (
                <BoxNote
                  label="Staff remarks"
                  value={payment.remarks}
                />
              )}

              {/* PAYMENT PROOF */}

              <FormControl isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="700"
                  mb={2}
                >
                  Replacement Payment Proof
                </FormLabel>

                {/* LARGE QR / PAYMENT PROOF PREVIEW */}

                {previewUrl && (
                  <Box
                    mb={3}
                    border="2px solid"
                    borderColor="blue.200"
                    borderRadius="xl"
                    bg="blue.50"
                    p={{
                      base: 3,
                      sm: 4,
                    }}
                  >
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      color="blue.700"
                      mb={3}
                      textAlign="center"
                    >
                      Payment Proof Preview
                    </Text>

                    <Box
                      bg="white"
                      border="2px solid"
                      borderColor="gray.200"
                      borderRadius="lg"
                      p={{
                        base: 3,
                        sm: 5,
                      }}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      minH={{
                        base: "240px",
                        sm: "300px",
                      }}
                      cursor="zoom-in"
                      onClick={onPreviewOpen}
                      _hover={{
                        borderColor: "blue.300",
                        boxShadow:
                          "0 4px 18px rgba(0,0,0,0.10)",
                      }}
                      transition="all 0.2s"
                    >
                      <Image
                        src={previewUrl}
                        alt="Payment proof preview"
                        maxW="100%"
                        maxH={{
                          base: "240px",
                          sm: "320px",
                        }}
                        objectFit="contain"
                        display="block"
                      />
                    </Box>

                    <Text
                      mt={2}
                      textAlign="center"
                      fontSize="xs"
                      color="gray.500"
                    >
                      Click the image to view it
                      clearly
                    </Text>
                  </Box>
                )}

                {/* FILE INPUT */}

                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  p={1}
                  onChange={
                    handleProofChange
                  }
                  isDisabled={loading}
                  cursor="pointer"
                />
              </FormControl>

              {/* REFERENCE NUMBER */}

              <FormControl>
                <FormLabel
                  fontSize="sm"
                  fontWeight="600"
                >
                  Reference Number
                </FormLabel>

                <Input
                  value={referenceNumber}
                  onChange={(event) =>
                    setReferenceNumber(
                      event.target.value
                    )
                  }
                  placeholder="Enter a new reference number if needed"
                  isDisabled={loading}
                />
              </FormControl>

              {/* FILE INFORMATION */}

              <Text
                color="gray.500"
                fontSize="xs"
              >
                Accepted files: JPG, JPEG,
                PNG, or WEBP. Maximum size:
                2 MB.
              </Text>
            </Stack>
          </ModalBody>

          {/* FOOTER */}

          <ModalFooter
            gap={3}
            flexWrap="wrap"
          >
            <Button
              variant="ghost"
              onClick={onClose}
              isDisabled={loading}
            >
              Cancel
            </Button>

            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
              loadingText="Submitting"
            >
              Resubmit for Review
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* FULL QR / PAYMENT PROOF VIEWER */}

      <Modal
        isOpen={isPreviewOpen}
        onClose={onPreviewClose}
        isCentered
        size="xl"
      >
        <ModalOverlay bg="blackAlpha.800" />

        <ModalContent
          mx={4}
          bg="white"
        >
          <ModalHeader
            fontSize="md"
            textAlign="center"
          >
            Payment Proof
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody
            display="flex"
            justifyContent="center"
            alignItems="center"
            p={{
              base: 4,
              md: 6,
            }}
          >
            {previewUrl && (
              <Box
                w="full"
                display="flex"
                justifyContent="center"
                alignItems="center"
                bg="gray.50"
                borderRadius="lg"
                p={{
                  base: 3,
                  md: 6,
                }}
              >
                <Image
                  src={previewUrl}
                  alt="Payment proof full preview"
                  maxW="100%"
                  maxH={{
                    base: "65vh",
                    md: "70vh",
                  }}
                  objectFit="contain"
                />
              </Box>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              onClick={onPreviewClose}
              size="sm"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

// STAFF REMARKS

function BoxNote({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Stack
      spacing={1}
      bg="gray.50"
      borderRadius="md"
      p={3}
    >
      <Text
        fontSize="xs"
        fontWeight="700"
        color="gray.600"
      >
        {label}
      </Text>

      <Text
        fontSize="sm"
        color="gray.700"
        whiteSpace="pre-wrap"
      >
        {value}
      </Text>
    </Stack>
  );
}