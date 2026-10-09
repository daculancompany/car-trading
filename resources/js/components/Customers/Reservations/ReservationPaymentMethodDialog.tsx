import { useEffect, useRef, useState } from "react";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Checkbox,
    Divider,
    HStack,
    Icon,
    Text,
    VStack,
    Box,
} from "@chakra-ui/react";
import {
    BanknotesIcon,
    CheckCircleIcon,
    CreditCardIcon,
    DocumentCheckIcon,
    InformationCircleIcon,
    XMarkIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import type { Vehicle } from "../../../api/VehicleManagement/vehicleApi";

interface ReservationPaymentMethodDialogProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: Vehicle | null;
    onSelect: (paymentMethod: "cash" | "financing") => void;
}

const getVehicleName = (vehicle: Vehicle | null) => {
    if (!vehicle) return "";

    return [
        vehicle.brand?.brand,
        vehicle.model?.model,
        vehicle.variant?.variant,
    ]
        .filter(Boolean)
        .join(" / ");
};

export default function ReservationPaymentMethodDialog({
    isOpen,
    onClose,
    vehicle,
    onSelect,
}: ReservationPaymentMethodDialogProps) {
    const cancelRef = useRef<HTMLButtonElement>(null);
    const [step, setStep] = useState<"terms" | "payment">("terms");
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const vehicleName = getVehicleName(vehicle);

    useEffect(() => {
        if (isOpen) {
            setStep("terms");
            setAcceptedTerms(false);
        }
    }, [isOpen]);

    const handleContinue = () => {
        if (!acceptedTerms) return;
        setStep("payment");
    };

    const handleClose = () => {
        setStep("terms");
        setAcceptedTerms(false);
        onClose();
    };

    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={handleClose}
            isCentered
        >
            <AlertDialogOverlay
                bg="blackAlpha.600"
            />
            <AlertDialogContent
                mx={4}
                maxW="500px"
                maxH="90vh"
                overflow="hidden"
                borderRadius="md"
                boxShadow="sm"
                bg="white"
            >
                <AlertDialogHeader
                    px={6}
                    py={5}
                    bg="gray.50"
                    color="white"
                    position="relative"
                >
                    <HStack spacing={3} align="center">
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            w="30px"
                            h="30px"
                            borderRadius="md"
                            bg="whiteAlpha.50"
                        >
                            <Icon
                                as={
                                    step === "terms"
                                        ? DocumentCheckIcon
                                        : CreditCardIcon
                                }
                                boxSize={6}
                                color="brand.700"
                            />
                        </Box>

                        <VStack align="start" spacing={0}>
                            <Text fontSize="md" fontWeight="800" color="dark.600">
                                {step === "terms"
                                    ? "Terms and Conditions"
                                    : "Choose Payment Method"}
                            </Text>

                            <Text fontSize="xs" color="gray.800" >
                                {step === "terms"
                                    ? "Please review before continuing"
                                    : "Select your preferred purchase option"}
                            </Text>
                        </VStack>
                    </HStack>

                    <Button
                        aria-label="Close dialog"
                        onClick={handleClose}
                        position="absolute"
                        top={3}
                        right={3}
                        size="sm"
                        variant="ghost"
                        color="brand.600"
                        _hover={{ bg: "whiteAlpha.200" }}
                    >
                        <Icon as={XMarkIcon} boxSize={6} />
                    </Button>
                </AlertDialogHeader>

                <AlertDialogBody
                    px={6}
                    py={6}
                    overflowY="auto"
                    maxH="calc(90vh - 170px)"
                    sx={{
                        "&::-webkit-scrollbar": {
                            width: "6px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            background: "var(--chakra-colors-gray-300)",
                            borderRadius: "full",
                        },
                        "&::-webkit-scrollbar-track": {
                            background: "transparent",
                        },
                    }}
                >
                    {step === "terms" ? (
                        <VStack align="stretch" spacing={5}>
                            <Box>
                                <HStack spacing={2} mb={2}>
                                    <Icon
                                        as={InformationCircleIcon}
                                        boxSize={5}
                                        color="brand.600"
                                    />
                                    <Text
                                        fontSize="sm"
                                        fontWeight="800"
                                        color="gray.800"
                                    >
                                        Before You Continue
                                    </Text>
                                </HStack>

                                <Text
                                    fontSize="xs"
                                    color="gray.700"
                                    lineHeight="1.7"
                                >
                                    Please read and acknowledge the following
                                    terms before selecting your payment method.
                                </Text>
                            </Box>

                            {vehicleName && (
                                <Box
                                    px={4}
                                    py={3}
                                    borderRadius="md"
                                    bg="brand.50"
                                >
                                    <Text
                                        fontSize="xs"
                                        fontWeight="600"
                                        color="brand.700"
                                        textTransform="uppercase"
                                        letterSpacing="wide"
                                    >
                                        Selected Vehicle
                                    </Text>

                                    <Text
                                        mt={1}
                                        fontSize="sm"
                                        fontWeight="700"
                                        color="gray.800"
                                    >
                                        {vehicleName}
                                    </Text>
                                </Box>
                            )}

                            <Box
                                px={4}
                                py={1}
                                borderRadius="md"
                                bg="gray.50"
                            >
                                <VStack
                                    align="stretch"
                                    spacing={2}
                                    fontSize="sm"
                                    color="gray.800"
                                    lineHeight="1.6"
                                >
                                    <Text>
                                        • The customer confirms that all information provided
                                        during the reservation is accurate and complete.
                                    </Text>

                                    <Text>
                                        • Vehicle reservations are subject to CDO Car Trading's
                                        reservation policies and vehicle availability.
                                    </Text>

                                    <Text>
                                        • A reservation does not automatically guarantee the
                                        completion of the vehicle purchase.
                                    </Text>

                                    <Text>
                                        • For cash payments, the customer must complete the
                                        required payment according to the agreed payment terms.
                                    </Text>

                                    <Text>
                                        • For financing, the customer is responsible for selecting
                                        and coordinating with their preferred financing company.
                                    </Text>

                                    <Text>
                                        • Financing approval, requirements, terms, and conditions
                                        are determined solely by the selected financing company.
                                    </Text>

                                    <Text>
                                        • CDO Car Trading records the financing information provided
                                        by the customer but does not guarantee financing approval.
                                    </Text>

                                    <Text>
                                        • The customer agrees that the information provided may be
                                        recorded and used for reservation and transaction documentation.
                                    </Text>
                                </VStack>
                            </Box>

                            <Checkbox
                                isChecked={acceptedTerms}
                                onChange={(event) =>
                                    setAcceptedTerms(event.target.checked)
                                }
                                colorScheme="red"
                                alignItems="flex-start"
                                spacing={3}
                            >
                                <Text fontSize="xs" color="gray.800">
                                    I have read and agree to the terms and
                                    conditions.
                                </Text>
                            </Checkbox>
                        </VStack>
                    ) : (
                        <VStack align="stretch" spacing={5}>
                            <Box>
                                <Text
                                    fontSize="sm"
                                    color="gray.800"
                                    lineHeight="1.6"
                                >
                                    Choose your preferred payment option for
                                    the selected vehicle.
                                </Text>

                                {vehicleName && (
                                    <Box
                                        mt={3}
                                        px={4}
                                        py={3}
                                        borderRadius="md"
                                        bg="brand.50"
                                    >
                                        <Text
                                            fontSize="xs"
                                            fontWeight="600"
                                            color="brand.700"
                                            textTransform="uppercase"
                                            letterSpacing="wide"
                                        >
                                            Selected Vehicle
                                        </Text>

                                        <Text
                                            mt={1}
                                            fontSize="sm"
                                            fontWeight="700"
                                            color="gray.800"
                                        >
                                            {vehicleName}
                                        </Text>
                                    </Box>
                                )}
                            </Box>

                            <Divider borderColor="brand.200" />

                            <VStack spacing={3} align="stretch">
                                <Button
                                    type="button"
                                    h="auto"
                                    minH="100px"
                                    px={4}
                                    py={4}
                                    borderRadius="md"
                                    bg="green.50"
                                    color="green.800"
                                    onClick={() => onSelect("cash")}
                                    _hover={{
                                        bg: "green.100",
                                        transform: "translateY(-1px)",
                                        boxShadow: "md",
                                    }}
                                    _active={{
                                        transform: "translateY(0)",
                                    }}
                                    transition="all 0.2s"
                                >
                                    <HStack
                                        w="full"
                                        spacing={4}
                                        align="center"
                                    >
                                        <Box
                                            flexShrink={0}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            w="30px"
                                            h="30px"
                                        >
                                            <Icon
                                                as={BanknotesIcon}
                                                boxSize={5}
                                                color="green.600"
                                            />
                                        </Box>

                                        <VStack
                                            flex={1}
                                            align="start"
                                            spacing={1}
                                        >
                                            <Text
                                                fontSize="md"
                                                fontWeight="700"
                                            >
                                                Cash Payment
                                            </Text>

                                            <Text
                                                fontSize="xs"
                                                fontWeight="400"
                                                color="green.700"
                                                textAlign="left"
                                            >
                                                Full payment for the vehicle
                                            </Text>
                                        </VStack>

                                        <Icon
                                            as={CheckCircleIcon}
                                            boxSize={5}
                                            color="green.600"
                                        />
                                    </HStack>
                                </Button>

                                <Button
                                    type="button"
                                    h="auto"
                                    minH="100px"
                                    px={4}
                                    py={4}
                                    borderRadius="md"
                                    bg="blue.50"
                                    color="blue.800"
                                    onClick={() => onSelect("financing")}
                                    _hover={{
                                        bg: "blue.100",
                                        transform: "translateY(-1px)",
                                        boxShadow: "md",
                                    }}
                                    _active={{
                                        transform: "translateY(0)",
                                    }}
                                    transition="all 0.2s"
                                >
                                    <HStack
                                        w="full"
                                        spacing={4}
                                        align="center"
                                    >
                                        <Box
                                            flexShrink={0}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            w="30px"
                                            h="30px"
                                        >
                                            <Icon
                                                as={CreditCardIcon}
                                                boxSize={5}
                                                color="blue.600"
                                            />
                                        </Box>

                                        <VStack
                                            flex={1}
                                            align="start"
                                            spacing={1}
                                        >
                                            <Text
                                                fontSize="md"
                                                fontWeight="700"
                                            >
                                                Financing
                                            </Text>

                                            <Text
                                                fontSize="xs"
                                                fontWeight="400"
                                                color="blue.700"
                                                textAlign="left"
                                            >
                                                Record financing details from
                                                your chosen financing company
                                            </Text>
                                        </VStack>

                                        <Icon
                                            as={CheckCircleIcon}
                                            boxSize={5}
                                            color="blue.600"
                                        />
                                    </HStack>
                                </Button>
                            </VStack>
                        </VStack>
                    )}
                </AlertDialogBody>

                <AlertDialogFooter
                    px={6}
                    py={4}
                    bg="gray.50"
                    borderTopWidth="1px"
                    borderColor="gray.100"
                >
                    {step === "terms" ? (
                        <HStack w="full" justify="space-between">
                            <Button
                                ref={cancelRef}
                                onClick={handleClose}
                                variant="outline"
                                borderRadius="lg"
                                color="gray.700"
                                borderColor="gray.300"
                                leftIcon={
                                    <Icon as={XMarkIcon} boxSize={4} />
                                }
                                _hover={{
                                    bg: "white",
                                    borderColor: "gray.400",
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={handleContinue}
                                isDisabled={!acceptedTerms}
                                bg="brand.800"
                                color="white"
                                borderRadius="lg"
                                rightIcon={
                                    <Icon as={ArrowRightIcon} boxSize={4} />
                                }
                                _hover={{
                                    bg: "brand.700",
                                }}
                                _disabled={{
                                    opacity: 0.5,
                                    cursor: "not-allowed",
                                }}
                            >
                                Continue
                            </Button>
                        </HStack>
                    ) : (
                        <HStack w="full" justify="space-between">
                            <Button
                                onClick={() => setStep("terms")}
                                variant="outline"
                                borderRadius="lg"
                                color="gray.700"
                                borderColor="gray.300"
                                leftIcon={
                                    <Icon as={ArrowLeftIcon} boxSize={4} />
                                }
                                _hover={{
                                    bg: "white",
                                    borderColor: "gray.400",
                                }}
                            >
                                Back
                            </Button>

                            <Button
                                ref={cancelRef}
                                onClick={handleClose}
                                variant="ghost"
                                borderRadius="lg"
                                color="gray.600"
                                _hover={{
                                    bg: "gray.100",
                                }}
                            >
                                Cancel
                            </Button>
                        </HStack>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
