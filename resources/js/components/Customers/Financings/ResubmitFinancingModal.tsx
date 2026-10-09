import { useEffect, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
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
  SimpleGrid,
  Text,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";

import {
  resubmitFinancing,
  type Financing,
} from "../../../api/FinancingManagement/financingInfoApi";

interface ResubmitFinancingModalProps {
  isOpen: boolean;
  onClose: () => void;
  financing: Financing | null;
  onResubmitted?: () => void;
}

export default function ResubmitFinancingModal({
  isOpen,
  onClose,
  financing,
  onResubmitted,
}: ResubmitFinancingModalProps) {
  const toast = useToast();

  const [loading, setLoading] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [financingReferenceNo, setFinancingReferenceNo] = useState("");
  const [financedAmount, setFinancedAmount] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [loanTermMonths, setLoanTermMonths] = useState("");

  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (!financing || !isOpen) return;

    setCompanyName(financing.company_name ?? "");
    setContactPerson(financing.contact_person ?? "");
    setContactNumber(financing.contact_number ?? "");
    setEmail(financing.email ?? "");
    setAddress(financing.address ?? "");

    setFinancingReferenceNo(financing.financing_reference_no ?? "");
    setFinancedAmount(String(financing.financed_amount ?? ""));
    setMonthlyPayment(
      financing.monthly_payment !== null &&
        financing.monthly_payment !== undefined
        ? String(financing.monthly_payment)
        : ""
    );
    setLoanTermMonths(
      financing.loan_term_months !== null &&
        financing.loan_term_months !== undefined
        ? String(financing.loan_term_months)
        : ""
    );

    // New remarks are entered separately from the previous rejection remarks.
    setRemarks("");
  }, [financing, isOpen]);

  const handleSubmit = async () => {
    if (!financing) return;

    const amount = Number(financedAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        title: "Financed amount required",
        description:
          "Enter a valid financed amount before resubmitting.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });

      return;
    }

    if (
      !companyName.trim() ||
      !contactPerson.trim() ||
      !contactNumber.trim() ||
      !email.trim() ||
      !address.trim()
    ) {
      toast({
        title: "Financing information required",
        description:
          "Complete all required financing company information before resubmitting.",
        status: "warning",
        duration: 3500,
        isClosable: true,
      });

      return;
    }

    if (
      monthlyPayment &&
      (!Number.isFinite(Number(monthlyPayment)) ||
        Number(monthlyPayment) < 0)
    ) {
      toast({
        title: "Invalid monthly payment",
        description: "Enter a valid monthly payment amount.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });

      return;
    }

    if (
      loanTermMonths &&
      (!Number.isInteger(Number(loanTermMonths)) ||
        Number(loanTermMonths) < 1)
    ) {
      toast({
        title: "Invalid loan term",
        description: "Loan term must be at least 1 month.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });

      return;
    }

    try {
      setLoading(true);

      await resubmitFinancing(financing.id, {
        reservation_id: financing.reservation_id,

        company_name: companyName.trim(),
        contact_person: contactPerson.trim(),
        contact_number: contactNumber.trim(),
        email: email.trim(),
        address: address.trim(),

        financing_reference_no:
          financingReferenceNo.trim() || null,

        financed_amount: amount,

        monthly_payment: monthlyPayment
          ? Number(monthlyPayment)
          : null,

        loan_term_months: loanTermMonths
          ? Number(loanTermMonths)
          : null,

        remarks: remarks.trim() || null,
      });

      toast({
        title: "Financing resubmitted",
        description:
          "Your updated financing information has been submitted for verification.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      onResubmitted?.();
      onClose();
    } catch (error: any) {
      toast({
        title: "Resubmission failed",
        description:
          error?.response?.data?.message ||
          "Unable to resubmit the financing information.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay />

      <ModalContent
        maxH="92vh"
        display="flex"
        flexDirection="column"
      >
        <ModalHeader pr={12}>
          Resubmit Financing Information

          <Text
            fontSize="sm"
            fontWeight="400"
            color="gray.500"
            mt={1}
          >
            Update the financing details requested by the reviewer.
          </Text>
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody overflowY="auto">
          {financing && (
            <VStack align="stretch" spacing={5}>
              {/* Rejection Notice */}
              <Alert
                status="error"
                borderRadius="md"
                alignItems="flex-start"
              >
                <AlertIcon mt={1} />

                <Box>
                  <AlertTitle fontSize="sm">
                    Previous financing was rejected
                  </AlertTitle>

                  <AlertDescription fontSize="sm">
                    Review the reviewer&apos;s remarks, update the
                    information below, and submit it again.
                  </AlertDescription>
                </Box>
              </Alert>

              {/* Previous Reviewer Remarks */}
              {financing.remarks && (
                <Box
                  bg="red.50"
                  borderWidth="1px"
                  borderColor="red.200"
                  borderRadius="md"
                  p={4}
                >
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="red.600"
                    mb={2}
                  >
                    REVIEWER REMARKS
                  </Text>

                  <Text fontSize="sm" color="red.700">
                    {financing.remarks}
                  </Text>
                </Box>
              )}

              {/* Financing Company Information */}
              <Box
                bg="gray.50"
                borderRadius="md"
                p={4}
              >
                <Text
                  fontSize="xs"
                  color="gray.500"
                  mb={3}
                >
                  FINANCING COMPANY
                </Text>

                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  spacing={4}
                >
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">
                      Company Name
                    </FormLabel>

                    <Input
                      value={companyName}
                      onChange={(event) =>
                        setCompanyName(event.target.value)
                      }
                      bg="white"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm">
                      Contact Person
                    </FormLabel>

                    <Input
                      value={contactPerson}
                      onChange={(event) =>
                        setContactPerson(event.target.value)
                      }
                      bg="white"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm">
                      Contact Number
                    </FormLabel>

                    <Input
                      value={contactNumber}
                      onChange={(event) =>
                        setContactNumber(event.target.value)
                      }
                      bg="white"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm">
                      Email
                    </FormLabel>

                    <Input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      bg="white"
                    />
                  </FormControl>

                  <FormControl
                    isRequired
                    gridColumn={{
                      base: "auto",
                      md: "1 / -1",
                    }}
                  >
                    <FormLabel fontSize="sm">
                      Address
                    </FormLabel>

                    <Input
                      value={address}
                      onChange={(event) =>
                        setAddress(event.target.value)
                      }
                      bg="white"
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* Financing Details */}
              <Box>
                <Text
                  fontSize="xs"
                  color="gray.500"
                  mb={3}
                >
                  FINANCING DETAILS
                </Text>

                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  spacing={4}
                >
                  <FormControl>
                    <FormLabel>
                      Financing Reference No.
                    </FormLabel>

                    <Input
                      value={financingReferenceNo}
                      onChange={(event) =>
                        setFinancingReferenceNo(
                          event.target.value
                        )
                      }
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>
                      Financed Amount
                    </FormLabel>

                    <Input
                      type="number"
                      value={financedAmount}
                      onChange={(event) =>
                        setFinancedAmount(event.target.value)
                      }
                      min={0}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>
                      Monthly Payment
                    </FormLabel>

                    <Input
                      type="number"
                      value={monthlyPayment}
                      onChange={(event) =>
                        setMonthlyPayment(event.target.value)
                      }
                      min={0}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>
                      Loan Term (Months)
                    </FormLabel>

                    <Input
                      type="number"
                      value={loanTermMonths}
                      onChange={(event) =>
                        setLoanTermMonths(event.target.value)
                      }
                      min={1}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* Resubmission Remarks */}
              <FormControl>
                <FormLabel>
                  Resubmission Remarks
                </FormLabel>

                <Textarea
                  value={remarks}
                  onChange={(event) =>
                    setRemarks(event.target.value)
                  }
                  placeholder="Explain the updates made to the financing information."
                  rows={4}
                />
              </FormControl>

              <Text fontSize="sm" color="gray.600">
                Financing documents are checked and submitted
                separately from this form.
              </Text>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter
          borderTopWidth="1px"
          gap={3}
        >
          <Button
            variant="ghost"
            onClick={onClose}
            isDisabled={loading}
          >
            Cancel
          </Button>

          <Button
            colorScheme="red"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Resubmitting..."
          >
            Resubmit Financing
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
