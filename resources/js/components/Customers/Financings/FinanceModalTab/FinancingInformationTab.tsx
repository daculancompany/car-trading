import React, { useEffect, useState } from "react";

import {
  Badge,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";

import {
  submitFinancing,
  type CreateFinancingData,
} from "../../../../api/FinancingManagement/financingInfoApi";

import {
  getReservation,
  type Reservation,
} from "../../../../api/ReservationManagement/reservationApi";

import {
  getSaleByReservation,
  type Sale,
} from "../../../../api/SaleManagement/saleApi";

interface FinancingInformationTabProps {
  reservationId: number;
  onFinancingCreated: (financingId: number) => void;
}

interface FinancingFormData {
  company_name: string;
  contact_person: string;
  contact_number: string;
  email: string;
  address: string;
  financing_reference_no: string;
  financed_amount: string;
  monthly_payment: string;
  loan_term_months: string;
  remarks: string;
}

const FinancingInformationTab: React.FC<
  FinancingInformationTabProps
> = ({ reservationId, onFinancingCreated }) => {
  const toast = useToast();

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [sale, setSale] = useState<Sale | null>(null);

  const [isLoadingReservation, setIsLoadingReservation] =
    useState(false);

  const [isLoadingSale, setIsLoadingSale] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createdFinancingId, setCreatedFinancingId] =
    useState<number | null>(null);

  const [formData, setFormData] =
    useState<FinancingFormData>({
      company_name: "",
      contact_person: "",
      contact_number: "",
      email: "",
      address: "",
      financing_reference_no: "",
      financed_amount: "",
      monthly_payment: "",
      loan_term_months: "",
      remarks: "",
    });

  const [errors, setErrors] = useState<
    Partial<Record<keyof FinancingFormData, string>>
  >({});

  useEffect(() => {
    const loadReservation = async () => {
      if (!reservationId) {
        setReservation(null);
        setSale(null);
        return;
      }

      try {
        setIsLoadingReservation(true);
        setIsLoadingSale(true);

        const data = await getReservation(reservationId);
        setReservation(data);

        try {
          const saleData =
            await getSaleByReservation(reservationId);

          setSale(saleData);
        } catch (saleError: any) {
          console.error(
            "Failed to load sale:",
            saleError
          );

          setSale(null);

          toast({
            title: "Sale Information Unavailable",
            description:
              saleError?.response?.data?.message ||
              "Unable to load the sale information for this reservation.",
            status: "warning",
            duration: 4000,
            isClosable: true,
            position: "top-right",
          });
        }
      } catch (error: any) {
        console.error(
          "Failed to load reservation:",
          error
        );

        toast({
          title: "Failed to Load Reservation",
          description:
            error?.response?.data?.message ||
            "Unable to load the reservation information.",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top-right",
        });

        setReservation(null);
        setSale(null);
      } finally {
        setIsLoadingReservation(false);
        setIsLoadingSale(false);
      }
    };

    loadReservation();
  }, [reservationId, toast]);

  const customerName = reservation?.customer
    ? [
      reservation.customer.first_name,
      reservation.customer.middle_name,
      reservation.customer.last_name,
    ]
      .filter(Boolean)
      .join(" ")
    : "";

  const vehicle = reservation?.vehicle;

  const vehicleName =
    [
      vehicle?.brand?.brand,
      vehicle?.model?.model,
      vehicle?.variant?.variant,
    ]
      .filter(Boolean)
      .join(" ") || "—";

  /*
   * VEHICLE SELLING PRICE
   * This is the single source of truth.
   */
  const sellingPrice = Number(
    vehicle?.selling_price ?? 0
  );

  /*
   * SALE DISCOUNT
   */
  const discountAmount = Math.max(
    Number(sale?.discount_amount ?? 0),
    0
  );

  /*
   * TOTAL SALE AMOUNT
   *
   * Vehicle Selling Price - Discount
   */
  const totalSaleAmount = Math.max(
    sellingPrice - discountAmount,
    0
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleChange = (
    field: keyof FinancingFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const validateField = (
    field: keyof FinancingFormData,
    value: string
  ): string | undefined => {
    const trimmedValue = value.trim();

    switch (field) {
      case "company_name":
        if (!trimmedValue) {
          return "Financing company name is required.";
        }
        break;

      case "contact_person":
        if (!trimmedValue) {
          return "Contact person is required.";
        }
        break;

      case "contact_number":
        if (!trimmedValue) {
          return "Contact number is required.";
        }
        break;

      case "email":
        if (!trimmedValue) {
          return "Email address is required.";
        }

        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            trimmedValue
          )
        ) {
          return "Please enter a valid email address.";
        }
        break;

      case "address":
        if (!trimmedValue) {
          return "Company or branch address is required.";
        }
        break;

      case "financed_amount": {
        const amount = Number(value);

        if (
          !value ||
          Number.isNaN(amount) ||
          amount <= 0
        ) {
          return "Financed amount is required and must be greater than 0.";
        }

        if (
          totalSaleAmount > 0 &&
          amount > totalSaleAmount
        ) {
          return "Financed amount cannot exceed the total sale amount.";
        }

        break;
      }

      case "monthly_payment": {
        if (value) {
          const monthly = Number(value);

          if (
            Number.isNaN(monthly) ||
            monthly < 0
          ) {
            return "Enter a valid monthly payment.";
          }
        }

        break;
      }

      case "loan_term_months": {
        if (value) {
          const months = Number(value);

          if (
            Number.isNaN(months) ||
            !Number.isInteger(months) ||
            months < 1
          ) {
            return "Loan term must be at least 1 month.";
          }
        }

        break;
      }
    }

    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<
      Record<keyof FinancingFormData, string>
    > = {};

    const requiredFields: (
      keyof FinancingFormData
    )[] = [
        "company_name",
        "contact_person",
        "contact_number",
        "email",
        "address",
        "financed_amount",
      ];

    requiredFields.forEach((field) => {
      const error = validateField(
        field,
        formData[field]
      );

      if (error) {
        newErrors[field] = error;
      }
    });

    if (formData.monthly_payment) {
      const error = validateField(
        "monthly_payment",
        formData.monthly_payment
      );

      if (error) {
        newErrors.monthly_payment = error;
      }
    }

    if (formData.loan_term_months) {
      const error = validateField(
        "loan_term_months",
        formData.loan_term_months
      );

      if (error) {
        newErrors.loan_term_months = error;
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!reservationId) {
      toast({
        title: "Reservation Required",
        description:
          "No reservation has been assigned to this financing.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    if (!vehicle?.selling_price) {
      toast({
        title: "Selling Price Unavailable",
        description:
          "The vehicle selling price could not be found.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description:
          "Please complete all required financing information.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    const financedAmount = Number(
      formData.financed_amount
    );

    if (
      totalSaleAmount > 0 &&
      financedAmount > totalSaleAmount
    ) {
      toast({
        title: "Invalid Financing Amount",
        description:
          "The financed amount cannot exceed the total sale amount.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      return;
    }

    const data: CreateFinancingData = {
      reservation_id: reservationId,

      company_name:
        formData.company_name.trim(),

      contact_person:
        formData.contact_person.trim(),

      contact_number:
        formData.contact_number.trim(),

      email:
        formData.email.trim(),

      address:
        formData.address.trim(),

      financing_reference_no:
        formData.financing_reference_no.trim() ||
        null,

      financed_amount: financedAmount,

      monthly_payment:
        formData.monthly_payment !== ""
          ? Number(formData.monthly_payment)
          : null,

      loan_term_months:
        formData.loan_term_months !== ""
          ? Number(formData.loan_term_months)
          : null,

      remarks:
        formData.remarks.trim() || null,
    };

    try {
      setIsSubmitting(true);

      const financing =
        await submitFinancing(data);

      setCreatedFinancingId(financing.id);

      onFinancingCreated(financing.id);

      toast({
        title: "Financing Submitted",
        description:
          `Financing #${financing.id} has been submitted for verification.`,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error: any) {
      console.error(
        "Failed to submit financing:",
        error
      );

      toast({
        title: "Submission Failed",
        description:
          error?.response?.data?.message ||
          "Failed to submit financing. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VStack
      spacing={6}
      align="stretch"
    >
      <Box>
        <HStack
          justify="space-between"
          align="flex-start"
        >
          <Box>
            <Text
              fontSize="xl"
              fontWeight="700"
              color="gray.800"
              mb={1}
            >
              Financing Information
            </Text>

            <Text
              fontSize="sm"
              color="gray.500"
            >
              Enter the financing company and
              financing details for this reservation.
            </Text>
          </Box>

          <Badge
            colorScheme="purple"
            borderRadius="full"
            px={3}
            py={1}
          >
            FINANCING
          </Badge>
        </HStack>
      </Box>

      <Box
        bg="purple.50"
        border="1px solid"
        borderColor="purple.200"
        borderRadius="lg"
        p={4}
      >
        <Text
          fontSize="sm"
          fontWeight="700"
          color="purple.800"
          mb={4}
        >
          Reservation Information
        </Text>

        <SimpleGrid
          columns={{
            base: 1,
            md: 3,
          }}
          spacing={5}
        >
          <Box
            bg="white"
            borderWidth="1px"
            borderColor="purple.100"
            borderRadius="lg"
            p={4}
          >
            <Text
              fontSize="xs"
              fontWeight="700"
              color="gray.500"
              textTransform="uppercase"
              mb={2}
            >
              Reservation
            </Text>

            {isLoadingReservation ? (
              <Text
                fontSize="sm"
                color="gray.400"
              >
                Loading reservation...
              </Text>
            ) : reservation ? (
              <>
                <Text
                  fontSize="lg"
                  fontWeight="700"
                  color="gray.800"
                >
                  #{reservation.id}
                </Text>

                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color="gray.700"
                  mt={1}
                >
                  {customerName || "Customer"}
                </Text>
              </>
            ) : (
              <Text
                fontSize="sm"
                color="red.500"
              >
                Reservation not found.
              </Text>
            )}
          </Box>

          <Box
            bg="white"
            borderWidth="1px"
            borderColor="purple.100"
            borderRadius="lg"
            p={4}
          >
            <Text
              fontSize="xs"
              fontWeight="700"
              color="gray.500"
              textTransform="uppercase"
              mb={2}
            >
              Vehicle
            </Text>

            <Text
              fontSize="lg"
              fontWeight="700"
              color="gray.800"
            >
              {vehicleName}
            </Text>

            <Text
              fontSize="sm"
              color="gray.500"
              mt={1}
            >
              Stock No:{" "}
              {reservation?.vehicle?.stock_no || "—"}
            </Text>
          </Box>

          <Box
            bg="white"
            borderWidth="1px"
            borderColor="purple.100"
            borderRadius="lg"
            p={4}
          >
            <Text
              fontSize="xs"
              fontWeight="700"
              color="gray.500"
              textTransform="uppercase"
              mb={3}
            >
              Vehicle Selling Price
            </Text>

            {isLoadingReservation ? (
              <Text
                fontSize="sm"
                color="gray.400"
              >
                Loading price...
              </Text>
            ) : (
              <Text
                fontSize="2xl"
                fontWeight="800"
                color="purple.600"
              >
                {formatCurrency(sellingPrice)}
              </Text>
            )}

            <Text
              fontSize="xs"
              color="gray.500"
              mt={2}
            >
              Current selling price of the
              reserved vehicle.
            </Text>
          </Box>
        </SimpleGrid>

        <Box
          mt={5}
          bg="white"
          borderWidth="1px"
          borderColor="purple.100"
          borderRadius="lg"
          p={4}
        >
          <Text
            fontSize="sm"
            fontWeight="700"
            color="gray.700"
            mb={3}
          >
            Sale Amount
          </Text>

          <VStack
            align="stretch"
            spacing={3}
          >
            <HStack justify="space-between">
              <Text
                fontSize="sm"
                color="gray.500"
              >
                Vehicle Selling Price
              </Text>

              <Text
                fontWeight="700"
                color="gray.800"
              >
                {formatCurrency(sellingPrice)}
              </Text>
            </HStack>

            <HStack justify="space-between">
              <Text
                fontSize="sm"
                color="gray.500"
              >
                Discount
              </Text>

              <Text
                fontWeight="700"
                color="red.500"
              >
                − {formatCurrency(discountAmount)}
              </Text>
            </HStack>

            <HStack
              justify="space-between"
              pt={3}
              borderTopWidth="1px"
              borderColor="gray.200"
            >
              <Text
                fontWeight="700"
                color="gray.700"
              >
                Total Sale Amount
              </Text>

              <Text
                fontSize="xl"
                fontWeight="800"
                color="purple.600"
              >
                {formatCurrency(totalSaleAmount)}
              </Text>
            </HStack>
          </VStack>
        </Box>
      </Box>

      <Box>
        <Text
          fontSize="md"
          fontWeight="700"
          color="gray.700"
          mb={4}
        >
          Financing Company
        </Text>

        <SimpleGrid
          columns={{
            base: 1,
            md: 2,
          }}
          spacing={5}
        >
          <FormControl
            isRequired
            isInvalid={
              !!errors.company_name
            }
          >
            <FormLabel
              fontSize="sm"
              fontWeight="600"
              color="gray.700"
            >
              Financing Company Name
            </FormLabel>

            <Input
              value={formData.company_name}
              onChange={(e) =>
                handleChange(
                  "company_name",
                  e.target.value
                )
              }
              placeholder="Enter financing company name"
              bg="white"
              borderColor="gray.300"
              focusBorderColor="purple.500"
            />

            <FormErrorMessage>
              {errors.company_name}
            </FormErrorMessage>
          </FormControl>

          <FormControl
            isRequired
            isInvalid={
              !!errors.contact_person
            }
          >
            <FormLabel
              fontSize="sm"
              fontWeight="600"
              color="gray.700"
            >
              Contact Person
            </FormLabel>

            <Input
              value={
                formData.contact_person
              }
              onChange={(e) =>
                handleChange(
                  "contact_person",
                  e.target.value
                )
              }
              placeholder="Enter contact person"
              bg="white"
              borderColor="gray.300"
              focusBorderColor="purple.500"
            />

            <FormErrorMessage>
              {errors.contact_person}
            </FormErrorMessage>
          </FormControl>

          <FormControl
            isRequired
            isInvalid={
              !!errors.contact_number
            }
          >
            <FormLabel
              fontSize="sm"
              fontWeight="600"
              color="gray.700"
            >
              Contact Number
            </FormLabel>

            <Input
              type="tel"
              value={
                formData.contact_number
              }
              onChange={(e) =>
                handleChange(
                  "contact_number",
                  e.target.value
                )
              }
              placeholder="Enter contact number"
              bg="white"
              borderColor="gray.300"
              focusBorderColor="purple.500"
            />

            <FormErrorMessage>
              {errors.contact_number}
            </FormErrorMessage>
          </FormControl>

          <FormControl
            isRequired
            isInvalid={!!errors.email}
          >
            <FormLabel
              fontSize="sm"
              fontWeight="600"
              color="gray.700"
            >
              Email Address
            </FormLabel>

            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                handleChange(
                  "email",
                  e.target.value
                )
              }
              placeholder="Enter email address"
              bg="white"
              borderColor="gray.300"
              focusBorderColor="purple.500"
            />

            <FormErrorMessage>
              {errors.email}
            </FormErrorMessage>
          </FormControl>

          <FormControl
            isRequired
            isInvalid={!!errors.address}
            gridColumn={{
              base: "auto",
              md: "1 / -1",
            }}
          >
            <FormLabel
              fontSize="sm"
              fontWeight="600"
              color="gray.700"
            >
              Company / Branch Address
            </FormLabel>

            <Textarea
              value={formData.address}
              onChange={(e) =>
                handleChange(
                  "address",
                  e.target.value
                )
              }
              placeholder="Enter financing company or branch address"
              rows={3}
              resize="vertical"
              bg="white"
              borderColor="gray.300"
              focusBorderColor="purple.500"
            />

            <FormErrorMessage>
              {errors.address}
            </FormErrorMessage>
          </FormControl>
        </SimpleGrid>
      </Box>

      <Box>
        <Text
          fontSize="md"
          fontWeight="700"
          color="gray.700"
          mb={4}
        >
          Financing Details
        </Text>

        <SimpleGrid
          columns={{
            base: 1,
            md: 2,
          }}
          spacing={5}
        >
          <FormControl>
            <FormLabel
              fontSize="sm"
              fontWeight="600"
              color="gray.700"
            >
              Financing Reference No.
            </FormLabel>

            <Input
              value={
                formData.financing_reference_no
              }
              onChange={(e) =>
                handleChange(
                  "financing_reference_no",
                  e.target.value
                )
              }
              placeholder="Enter financing reference number"
              bg="white"
              borderColor="gray.300"
              focusBorderColor="purple.500"
            />

            <Text
              fontSize="xs"
              color="gray.500"
              mt={1}
            >
              Optional reference number provided
              by the financing company.
            </Text>
          </FormControl>

          <FormControl
            isRequired
            isInvalid={
              !!errors.financed_amount
            }
          >
            <FormLabel
              fontSize="sm"
              fontWeight="600"
              color="gray.700"
            >
              Financed Amount
            </FormLabel>

            <Input
              type="number"
              value={
                formData.financed_amount
              }
              onChange={(e) =>
                handleChange(
                  "financed_amount",
                  e.target.value
                )
              }
              placeholder="Enter financed amount"
              min={0}
              max={totalSaleAmount || undefined}
              bg="white"
              borderColor="gray.300"
              focusBorderColor="purple.500"
            />

            <Text
              fontSize="xs"
              color="gray.500"
              mt={1}
            >
              Maximum financing:
              {" "}
              {formatCurrency(
                totalSaleAmount
              )}
            </Text>

            <FormErrorMessage>
              {errors.financed_amount}
            </FormErrorMessage>
          </FormControl>

          <FormControl
            isInvalid={
              !!errors.monthly_payment
            }
          >
            <FormLabel
              fontSize="sm"
              fontWeight="600"
              color="gray.700"
            >
              Monthly Payment
            </FormLabel>

            <Input
              type="number"
              value={
                formData.monthly_payment
              }
              onChange={(e) =>
                handleChange(
                  "monthly_payment",
                  e.target.value
                )
              }
              placeholder="Enter monthly payment"
              min={0}
              bg="white"
              borderColor="gray.300"
              focusBorderColor="purple.500"
            />

            <FormErrorMessage>
              {errors.monthly_payment}
            </FormErrorMessage>

            <Text
              fontSize="xs"
              color="gray.500"
              mt={1}
            >
              Expected monthly payment based on
              the financing agreement.
            </Text>
          </FormControl>

          <FormControl
            isInvalid={
              !!errors.loan_term_months
            }
          >
            <FormLabel
              fontSize="sm"
              fontWeight="600"
              color="gray.700"
            >
              Loan Term (Months)
            </FormLabel>

            <Input
              type="number"
              value={
                formData.loan_term_months
              }
              onChange={(e) =>
                handleChange(
                  "loan_term_months",
                  e.target.value
                )
              }
              placeholder="Enter loan term in months"
              min={1}
              bg="white"
              borderColor="gray.300"
              focusBorderColor="purple.500"
            />

            <FormErrorMessage>
              {errors.loan_term_months}
            </FormErrorMessage>
          </FormControl>

          <FormControl
            gridColumn={{
              base: "auto",
              md: "1 / -1",
            }}
          >
            <FormLabel
              fontSize="sm"
              fontWeight="600"
              color="gray.700"
            >
              Remarks
            </FormLabel>

            <Textarea
              value={formData.remarks}
              onChange={(e) =>
                handleChange(
                  "remarks",
                  e.target.value
                )
              }
              placeholder="Enter additional financing remarks..."
              rows={4}
              resize="vertical"
              bg="white"
              borderColor="gray.300"
              focusBorderColor="purple.500"
            />

            <Text
              fontSize="xs"
              color="gray.500"
              mt={1}
            >
              Add any additional notes regarding
              the financing arrangement.
            </Text>
          </FormControl>
        </SimpleGrid>
      </Box>

      <Box
        bg="purple.50"
        border="1px solid"
        borderColor="purple.100"
        borderRadius="lg"
        p={4}
      >
        <Text
          fontSize="sm"
          fontWeight="600"
          color="purple.700"
          mb={1}
        >
          Financing Status
        </Text>

        <Text
          fontSize="sm"
          color="purple.600"
        >
          This financing application will be
          submitted with a{" "}
          <strong>Pending</strong> status. The
          status is controlled by the system and
          will be reviewed by the authorized staff.
        </Text>
      </Box>

      {createdFinancingId && (
        <Box
          bg="green.50"
          border="1px solid"
          borderColor="green.200"
          borderRadius="lg"
          p={4}
        >
          <HStack
            justify="space-between"
            align="flex-start"
          >
            <Box>
              <Text
                fontSize="sm"
                fontWeight="700"
                color="green.700"
              >
                Financing Submitted
              </Text>

              <Text
                fontSize="sm"
                color="green.600"
                mt={1}
              >
                Financing ID: #
                {createdFinancingId}
              </Text>
            </Box>

            <Badge
              colorScheme="yellow"
              borderRadius="full"
            >
              PENDING
            </Badge>
          </HStack>

          <Text
            fontSize="xs"
            color="green.600"
            mt={2}
          >
            The financing application is now
            waiting for verification.
          </Text>
        </Box>
      )}

      <HStack
        justify="flex-end"
        pt={2}
      >
        <Button
          colorScheme="purple"
          px={6}
          onClick={handleSubmit}
          isLoading={isSubmitting}
          loadingText="Submitting..."
          isDisabled={
            !reservationId ||
            isLoadingReservation ||
            isLoadingSale ||
            sellingPrice <= 0
          }
        >
          SUBMIT FINANCING
        </Button>
      </HStack>
    </VStack>
  );
};

export default FinancingInformationTab;