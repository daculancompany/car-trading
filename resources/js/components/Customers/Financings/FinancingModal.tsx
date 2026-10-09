import {
  Badge,
  Box,
  Button,
  Divider,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Text,
  VStack,
} from "@chakra-ui/react";

import { useState } from "react";

// Child Tabs

import FinancingInformationTab from "../Financings/FinanceModalTab/FinancingInformationTab";
import FinancingRequirementsDocumentsTab from "../Financings/FinanceModalTab/FinancingRequirementsDocumentsTab";

// Steps

const steps = [
  {
    number: 1,
    title: "Financing",
    description: "Company & financing details",
  },
  {
    number: 2,
    title: "Requirements",
    description: "Requirements & documents",
  },
];

// Props

interface FinancingModalProps {
  isOpen: boolean;
  onClose: () => void;

  /**
   * Reservation that is currently being financed.
   */
  reservationId: number;
}

// Component

export default function FinancingModal({
  isOpen,
  onClose,
  reservationId,
}: FinancingModalProps) {
  // Current Step

  const [currentStep, setCurrentStep] = useState(0);

  // Financing ID

  const [financingId, setFinancingId] =
    useState<number | null>(null);

  // Close Modal

  const handleClose = () => {
    setCurrentStep(0);
    setFinancingId(null);

    onClose();
  };

  // Next

  const handleNext = () => {
    // Step 1 → Step 2
    if (currentStep === 0) {
      if (!financingId) {
        return;
      }

      setCurrentStep(1);
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
    }
  };

  // Back

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  };

  // Finish

  const handleFinish = () => {
    setCurrentStep(0);
    setFinancingId(null);

    onClose();
  };

  // Step Navigation

  const handleStepClick = (index: number) => {
    // Step 2 requires a financing record.
    if (index === 1 && !financingId) {
      return;
    }

    setCurrentStep(index);
  };

  // Render Current Tab

  const renderCurrentTab = () => {
    switch (currentStep) {
      // STEP 1

      case 0:
        return (
          <FinancingInformationTab
            reservationId={reservationId}
            onFinancingCreated={(id) => {
              setFinancingId(id);
            }}
          />
        );

      // STEP 2

      case 1:
        if (!financingId) {
          return (
            <Box
              borderWidth="1px"
              borderColor="orange.200"
              bg="orange.50"
              borderRadius="xl"
              p={5}
            >
              <Text
                fontSize="sm"
                fontWeight="600"
                color="orange.700"
              >
                Please complete the financing information
                first.
              </Text>
            </Box>
          );
        }

        return (
          <FinancingRequirementsDocumentsTab
            financingId={financingId}
          />
        );

      default:
        return null;
    }
  };

  // Button State

  const canGoNext =
    currentStep === 0 &&
    financingId !== null;

  // Render

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="5xl"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay />

      <ModalContent
        borderRadius="2xl"
        overflow="hidden"
        maxH="92vh"
      >
        {/* HEADER */}

        <ModalHeader
          px={{ base: 5, md: 7 }}
          py={5}
          borderBottomWidth="1px"
          borderColor="gray.200"
          bg="white"
        >
          <VStack
            align="stretch"
            spacing={1}
          >
            <HStack
              justify="space-between"
              pr={8}
            >
              <Text
                fontSize={{
                  base: "lg",
                  md: "xl",
                }}
                fontWeight="700"
                color="gray.800"
              >
                Financing Application
              </Text>

              <Badge
                colorScheme="purple"
                borderRadius="full"
                px={3}
                py={1}
                fontSize="xs"
                letterSpacing="0.03em"
              >
                FINANCING
              </Badge>
            </HStack>

            <Text
              fontSize="sm"
              color="gray.500"
            >
              Financing application and requirements
            </Text>
          </VStack>
        </ModalHeader>

        <ModalCloseButton
          top={5}
          right={5}
        />

        {/* BODY */}

        <ModalBody
          px={{ base: 4, md: 7 }}
          py={6}
          bg="white"
        >
          <VStack
            spacing={6}
            align="stretch"
          >
            {/* RESERVATION CONTEXT */}

            <Box
              borderWidth="1px"
              borderColor="purple.100"
              borderRadius="xl"
              bg="purple.50"
              px={{ base: 4, md: 5 }}
              py={4}
            >
              <HStack
                justify="space-between"
                align="center"
              >
                <Box>
                  <Text
                    fontSize="10px"
                    fontWeight="600"
                    color="purple.500"
                    letterSpacing="0.06em"
                    mb={1}
                  >
                    FINANCING RESERVATION
                  </Text>

                  <Text
                    fontSize="md"
                    fontWeight="700"
                    color="gray.800"
                  >
                    Reservation #{reservationId}
                  </Text>

                  <Text
                    fontSize="xs"
                    color="gray.500"
                    mt={1}
                  >
                    This financing application is linked
                    directly to this reservation.
                  </Text>
                </Box>

                <Badge
                  colorScheme="purple"
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  RESERVATION
                </Badge>
              </HStack>
            </Box>

            {/* STEPPER */}

            <Box>
              <HStack
                align="start"
                spacing={0}
                width="100%"
              >
                {steps.map((step, index) => {
                  const active =
                    index === currentStep;

                  const completed =
                    index < currentStep;

                  const disabled =
                    index === 1 &&
                    !financingId;

                  return (
                    <Box
                      key={step.number}
                      flex={1}
                      position="relative"
                      cursor={
                        disabled
                          ? "not-allowed"
                          : "pointer"
                      }
                      opacity={
                        disabled ? 0.55 : 1
                      }
                      onClick={() => {
                        if (!disabled) {
                          handleStepClick(index);
                        }
                      }}
                    >
                      {/* CONNECTOR */}

                      {index < steps.length - 1 && (
                        <Box
                          position="absolute"
                          top="17px"
                          left="50%"
                          right="-50%"
                          height="2px"
                          bg={
                            index < currentStep
                              ? "purple.500"
                              : "gray.200"
                          }
                          zIndex={0}
                        />
                      )}

                      <VStack
                        spacing={2}
                        position="relative"
                        zIndex={1}
                      >
                        {/* STEP CIRCLE */}

                        <Box
                          w="36px"
                          h="36px"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          borderWidth="2px"
                          borderColor={
                            active || completed
                              ? "purple.500"
                              : "gray.300"
                          }
                          bg={
                            completed
                              ? "purple.500"
                              : active
                                ? "purple.50"
                                : "white"
                          }
                          color={
                            completed
                              ? "white"
                              : active
                                ? "purple.600"
                                : "gray.400"
                          }
                          fontSize="sm"
                          fontWeight="700"
                        >
                          {completed
                            ? "✓"
                            : step.number}
                        </Box>

                        {/* TITLE */}

                        <Text
                          fontSize={{
                            base: "xs",
                            md: "sm",
                          }}
                          fontWeight={
                            active
                              ? "700"
                              : completed
                                ? "600"
                                : "500"
                          }
                          color={
                            active
                              ? "purple.600"
                              : completed
                                ? "gray.700"
                                : "gray.400"
                          }
                          textAlign="center"
                        >
                          {step.title}
                        </Text>

                        {/* DESCRIPTION */}

                        <Text
                          display={{
                            base: "none",
                            md: "block",
                          }}
                          fontSize="10px"
                          color="gray.500"
                          textAlign="center"
                        >
                          {step.description}
                        </Text>
                      </VStack>
                    </Box>
                  );
                })}
              </HStack>

              {/* PROGRESS */}

              <Progress
                value={
                  ((currentStep + 1) /
                    steps.length) *
                  100
                }
                size="xs"
                colorScheme="purple"
                borderRadius="full"
                mt={5}
              />
            </Box>

            {/* CURRENT TAB TITLE */}

            <Box>
              <Text
                fontSize="lg"
                fontWeight="700"
                color="gray.800"
              >
                Step {currentStep + 1}:{" "}
                {steps[currentStep].title}
              </Text>

              <Text
                fontSize="sm"
                color="gray.500"
                mt={1}
              >
                {steps[currentStep].description}
              </Text>
            </Box>

            <Divider />

            {/* TAB CONTENT */}

            <Box>
              {renderCurrentTab()}
            </Box>
          </VStack>
        </ModalBody>

        {/* FOOTER */}

        <ModalFooter
          px={{ base: 4, md: 7 }}
          py={4}
          borderTopWidth="1px"
          borderColor="gray.200"
          bg="gray.50"
        >
          {/* CANCEL */}

          <Button
            variant="ghost"
            color="gray.600"
            mr="auto"
            onClick={handleClose}
          >
            CANCEL
          </Button>

          <HStack spacing={3}>
            {/* BACK */}

            {currentStep > 0 && (
              <Button
                variant="outline"
                borderColor="gray.300"
                onClick={handleBack}
              >
                ← BACK
              </Button>
            )}

            {/* NEXT */}

            {currentStep <
              steps.length - 1 && (
              <Button
                colorScheme="purple"
                px={6}
                onClick={handleNext}
                isDisabled={!canGoNext}
              >
                NEXT →
              </Button>
            )}

            {/* FINISH */}

            {currentStep ===
              steps.length - 1 && (
              <Button
                colorScheme="purple"
                px={6}
                onClick={handleFinish}
              >
                FINISH
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
