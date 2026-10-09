import {
    Box,
    Button,
    ButtonGroup,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    HStack,
    InputGroup,
    InputRightAddon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    NumberInput,
    NumberInputField,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Text,
} from "@chakra-ui/react";
import { useState } from "react";

import { LOAN_DEFAULTS, TERM_OPTIONS, monthlyPayment, peso } from "./loan";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    price: number;
    title: string;
}

export default function LoanCalculatorModal({ isOpen, onClose, price, title }: Props) {
    const [downPercent, setDownPercent] = useState(LOAN_DEFAULTS.downPercent);
    const [months, setMonths] = useState(LOAN_DEFAULTS.months);
    const [rate, setRate] = useState(LOAN_DEFAULTS.annualRate);

    const down = (price * downPercent) / 100;
    const financed = price - down;
    const monthly = monthlyPayment(price, downPercent, months, rate);
    const totalPaid = down + monthly * months;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
            <ModalOverlay />
            <ModalContent borderRadius="xl" mx={3}>
                <ModalHeader pb={1}>
                    <Text fontSize="lg" fontWeight="800">
                        Loan estimate
                    </Text>
                    <Text fontSize="sm" color="gray.500" fontWeight="500">
                        {title} · {peso(price)}
                    </Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <Box bg="brand.50" border="1px solid" borderColor="brand.100" borderRadius="xl" p={4} textAlign="center" mb={5}>
                        <Text fontSize="xs" color="gray.600" fontWeight="700" textTransform="uppercase">
                            Estimated monthly
                        </Text>
                        <Text fontSize="4xl" fontWeight="800" color="brand.600" lineHeight="1.1">
                            {peso(monthly)}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                            for {months} months
                        </Text>
                    </Box>

                    <FormControl mb={5}>
                        <Flex justify="space-between" mb={1}>
                            <FormLabel fontSize="sm" mb={0}>
                                Down payment
                            </FormLabel>
                            <Text fontSize="sm" fontWeight="700">
                                {downPercent}% · {peso(down)}
                            </Text>
                        </Flex>
                        <Slider min={10} max={80} step={5} value={downPercent} onChange={setDownPercent} colorScheme="brand">
                            <SliderTrack>
                                <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb boxSize={5} />
                        </Slider>
                    </FormControl>

                    <FormControl mb={5}>
                        <FormLabel fontSize="sm">Term</FormLabel>
                        <ButtonGroup size="sm" isAttached variant="outline" w="full">
                            {TERM_OPTIONS.map((option) => (
                                <Button key={option} flex="1" variant={months === option ? "solid" : "outline"} colorScheme={months === option ? "brand" : "gray"} onClick={() => setMonths(option)}>
                                    {option / 12} yr
                                </Button>
                            ))}
                        </ButtonGroup>
                    </FormControl>

                    <FormControl mb={5} maxW="200px">
                        <FormLabel fontSize="sm">Interest per year</FormLabel>
                        <InputGroup size="sm">
                            <NumberInput min={0} max={40} step={0.5} value={rate} onChange={(_, value) => setRate(Number.isNaN(value) ? 0 : value)} w="full">
                                <NumberInputField borderRightRadius={0} />
                            </NumberInput>
                            <InputRightAddon>%</InputRightAddon>
                        </InputGroup>
                    </FormControl>

                    <Divider mb={3} />
                    {[
                        ["Cash price", peso(price)],
                        ["Down payment", peso(down)],
                        ["Amount financed", peso(financed)],
                        ["Total you pay", peso(totalPaid)],
                    ].map(([label, value]) => (
                        <HStack key={label} justify="space-between" fontSize="sm" py={1}>
                            <Text color="gray.600">{label}</Text>
                            <Text fontWeight="700">{value}</Text>
                        </HStack>
                    ))}
                    <Text fontSize="xs" color="gray.500" mt={3}>
                        Sample computation only. The final rate and approval come from the bank or financing company.
                    </Text>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
