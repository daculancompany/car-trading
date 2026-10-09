import {
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
    Select,
    Text,
    useToast,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";

import {
    createVehicleModel,
    type CreateVehicleModelData,
} from "../../../../api/VehicleManagement/modelApi";

import {
    getVehicleBrands,
    type VehicleBrand,
} from "../../../../api/VehicleManagement/brandApi";

interface AddModelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const initialForm: CreateVehicleModelData = {
    brand_id: 0,
    model: "",
    is_active: true,
};

export default function AdminAddModelModal({
    isOpen,
    onClose,
    onSuccess,
}: AddModelModalProps) {
    const toast = useToast();

    const [brands, setBrands] = useState<VehicleBrand[]>([]);

    const [form, setForm] =
        useState<CreateVehicleModelData>(initialForm);

    const [loading, setLoading] = useState(false);
    const [loadingBrands, setLoadingBrands] = useState(false);

    // LOAD BRANDS WHEN MODAL OPENS

    useEffect(() => {
        if (isOpen) {
            loadBrands();
        }
    }, [isOpen]);

    // LOAD VEHICLE BRANDS

    const loadBrands = async () => {
        try {
            setLoadingBrands(true);

            const data = await getVehicleBrands();

            setBrands(data);
        } catch (error) {
            console.error(
                "Failed to load vehicle brands:",
                error
            );

            toast({
                title: "Error",
                description:
                    "Unable to load vehicle brands.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setLoadingBrands(false);
        }
    };

    // HANDLE INPUT CHANGE

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                name === "brand_id"
                    ? Number(value)
                    : name === "is_active"
                        ? value === "true"
                        : value,
        }));
    };

    // RESET FORM

    const resetForm = () => {
        setForm(initialForm);
    };

    // CLOSE MODAL

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // SUBMIT

    const handleSubmit = async () => {
        if (!form.brand_id) {
            toast({
                title: "Validation Error",
                description:
                    "Please select a vehicle brand.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        if (!form.model.trim()) {
            toast({
                title: "Validation Error",
                description:
                    "Vehicle model name is required.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });

            return;
        }

        try {
            setLoading(true);

            await createVehicleModel({
                brand_id: form.brand_id,
                model: form.model.trim(),
                is_active: form.is_active,
            });

            toast({
                title: "Success",
                description:
                    "Vehicle model created successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            resetForm();

            onSuccess?.();

            onClose();
        } catch (error: any) {
            console.error(
                "Create vehicle model error:",
                error
            );

            toast({
                title: "Error",
                description:
                    error.response?.data?.message ??
                    "Unable to create vehicle model.",
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
            onClose={handleClose}
            size="sm"
            isCentered
        >
            <ModalOverlay
                bg="blackAlpha.400"
                backdropFilter="blur(3px)"
            />

            <ModalContent
                mx={4}
                rounded="xl"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.200"
                boxShadow="xl"
            >
                {/* HEADER */}

                <ModalHeader
                    px={6}
                    py={4}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    fontSize="lg"
                    fontWeight="700"
                    color="dark.900"
                >
                    Add Vehicle Model

                    <Text
                        mt={1}
                        fontSize="xs"
                        fontWeight="400"
                        color="gray.500"
                    >
                        Add a new vehicle model to the inventory.
                    </Text>
                </ModalHeader>

                <ModalCloseButton
                    top={4}
                    right={4}
                    rounded="md"
                    color="gray.500"
                    _hover={{
                        bg: "gray.100",
                        color: "dark.900",
                    }}
                />

                {/* BODY */}

                <ModalBody px={6} py={5}>
                    {/* Brand */}

                    <FormControl
                        isRequired
                        mb={5}
                    >
                        <FormLabel
                            mb={2}
                            fontSize="sm"
                            fontWeight="600"
                            color="dark.800"
                        >
                            Brand
                        </FormLabel>

                        <Select
                            name="brand_id"
                            placeholder={
                                loadingBrands
                                    ? "Loading brands..."
                                    : "Select Brand"
                            }
                            value={
                                form.brand_id || ""
                            }
                            onChange={handleChange}
                            isDisabled={loadingBrands}
                            h="42px"
                            fontSize="sm"
                            rounded="lg"
                            borderColor="gray.300"
                            bg="white"
                            _hover={{
                                borderColor: "gray.400",
                            }}
                            _focus={{
                                borderColor: "brand.500",
                                boxShadow:
                                    "0 0 0 1px var(--chakra-colors-brand-500)",
                            }}
                        >
                            {brands
                                .filter(
                                    (brand) =>
                                        brand.is_active !==
                                        false
                                )
                                .map((brand) => (
                                    <option
                                        key={brand.id}
                                        value={brand.id}
                                    >
                                        {brand.brand}
                                    </option>
                                ))}
                        </Select>
                    </FormControl>

                    {/* Model Name */}

                    <FormControl
                        isRequired
                        mb={5}
                    >
                        <FormLabel
                            mb={2}
                            fontSize="sm"
                            fontWeight="600"
                            color="dark.800"
                        >
                            Model Name
                        </FormLabel>

                        <Input
                            name="model"
                            placeholder="e.g. Fortuner"
                            value={form.model}
                            onChange={handleChange}
                            h="42px"
                            fontSize="sm"
                            rounded="lg"
                            borderColor="gray.300"
                            bg="white"
                            _hover={{
                                borderColor: "gray.400",
                            }}
                            _focus={{
                                borderColor: "brand.500",
                                boxShadow:
                                    "0 0 0 1px var(--chakra-colors-brand-500)",
                            }}
                        />
                    </FormControl>

                    {/* Status */}

                    <FormControl isRequired>
                        <FormLabel
                            mb={2}
                            fontSize="sm"
                            fontWeight="600"
                            color="dark.800"
                        >
                            Status
                        </FormLabel>

                        <Select
                            name="is_active"
                            value={
                                form.is_active
                                    ? "true"
                                    : "false"
                            }
                            onChange={handleChange}
                            h="42px"
                            fontSize="sm"
                            rounded="lg"
                            borderColor="gray.300"
                            bg="white"
                            _hover={{
                                borderColor: "gray.400",
                            }}
                            _focus={{
                                borderColor: "brand.500",
                                boxShadow:
                                    "0 0 0 1px var(--chakra-colors-brand-500)",
                            }}
                        >
                            <option value="true">
                                Active
                            </option>

                            <option value="false">
                                Inactive
                            </option>
                        </Select>
                    </FormControl>
                </ModalBody>

                {/* FOOTER */}

                <ModalFooter
                    px={6}
                    py={4}
                    gap={3}
                    borderTop="1px solid"
                    borderColor="gray.100"
                    bg="gray.50"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        rounded="lg"
                        color="gray.600"
                        onClick={handleClose}
                        isDisabled={loading}
                        _hover={{
                            bg: "gray.200",
                            color: "dark.900",
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        size="sm"
                        rounded="lg"
                        px={5}
                        bg="brand.500"
                        color="white"
                        onClick={handleSubmit}
                        isLoading={loading}
                        loadingText="Saving..."
                        _hover={{
                            bg: "brand.600",
                        }}
                        _active={{
                            bg: "brand.700",
                        }}
                    >
                        Save Model
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}