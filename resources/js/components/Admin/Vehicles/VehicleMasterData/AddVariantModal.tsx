import {
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
    Select,
    Text,
    useToast,
} from "@chakra-ui/react";

import { useEffect, useMemo, useState } from "react";

import {
    createVehicleVariant,
    type CreateVehicleVariantData,
} from "../../../../api/VehicleManagement/variantApi";

import {
    getVehicleBrands,
    type VehicleBrand,
} from "../../../../api/VehicleManagement/brandApi";

import {
    getVehicleModels,
    type VehicleModel,
} from "../../../../api/VehicleManagement/modelApi";

interface AddVariantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const initialForm: CreateVehicleVariantData = {
    model_id: 0,
    variant: "",
    is_active: true,
};

export default function AddVariantModal({
    isOpen,
    onClose,
    onSuccess,
}: AddVariantModalProps) {
    const toast = useToast();

    const [brands, setBrands] = useState<VehicleBrand[]>([]);
    const [models, setModels] = useState<VehicleModel[]>([]);

    const [selectedBrand, setSelectedBrand] = useState(0);

    const [form, setForm] =
        useState<CreateVehicleVariantData>(initialForm);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    /**
     * Load Brands and Models
     */
    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        try {
            setLoadingData(true);

            const [brandData, modelData] = await Promise.all([
                getVehicleBrands(),
                getVehicleModels(),
            ]);

            setBrands(brandData);
            setModels(modelData);
        } catch (error) {
            console.error(
                "Failed to load vehicle data:",
                error
            );

            toast({
                title: "Error",
                description:
                    "Unable to load vehicle brands and models.",
                status: "error",
                duration: 4000,
                isClosable: true,
                position: "top-right",
            });
        } finally {
            setLoadingData(false);
        }
    };

    /**
     * Active Brands
     */
    const activeBrands = useMemo(() => {
        return brands.filter(
            (brand) => brand.is_active !== false
        );
    }, [brands]);

    /**
     * Models for Selected Brand
     */
    const filteredModels = useMemo(() => {
        if (!selectedBrand) {
            return [];
        }

        return models.filter(
            (model) =>
                model.brand_id === selectedBrand &&
                model.is_active !== false
        );
    }, [models, selectedBrand]);

    /**
     * Brand Change
     */
    const handleBrandChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const brandId = Number(e.target.value);

        setSelectedBrand(brandId);

        setForm((prev) => ({
            ...prev,
            model_id: 0,
        }));
    };

    /**
     * Form Change
     */
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                name === "model_id"
                    ? Number(value)
                    : name === "is_active"
                        ? value === "true"
                        : value,
        }));
    };

    /**
     * Reset Form
     */
    const resetForm = () => {
        setForm({
            ...initialForm,
        });

        setSelectedBrand(0);
    };

    /**
     * Close Modal
     */
    const handleClose = () => {
        if (loading) return;

        resetForm();
        onClose();
    };

    /**
     * Submit
     */
    const handleSubmit = async () => {
        if (loading) return;

        if (!selectedBrand) {
            toast({
                title: "Validation Error",
                description:
                    "Please select a vehicle brand.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            return;
        }

        if (!form.model_id) {
            toast({
                title: "Validation Error",
                description:
                    "Please select a vehicle model.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            return;
        }

        if (!form.variant.trim()) {
            toast({
                title: "Validation Error",
                description:
                    "Vehicle variant name is required.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            return;
        }

        try {
            setLoading(true);

            await createVehicleVariant({
                model_id: form.model_id,
                variant: form.variant.trim(),
                is_active: form.is_active,
            });

            toast({
                title: "Success",
                description:
                    "Vehicle variant created successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            resetForm();

            onSuccess?.();

            onClose();
        } catch (error: any) {
            console.error(
                "Create vehicle variant error:",
                error
            );

            toast({
                title: "Error",
                description:
                    error?.response?.data?.message ??
                    "Unable to create vehicle variant.",
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
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="sm"
            isCentered
        >
            <ModalOverlay
                bg="blackAlpha.500"
                backdropFilter="blur(3px)"
            />

            <ModalContent
                rounded="xl"
                overflow="hidden"
                shadow="xl"
                border="1px solid"
                borderColor="gray.200"
            >
                {/* HEADER */}

                <ModalHeader
                    px={6}
                    py={5}
                    bg="gray.50"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                >
                    <Box pr={8}>
                        <Text
                            fontSize="lg"
                            fontWeight="700"
                            color="gray.800"
                        >
                            Add Vehicle Variant
                        </Text>

                        <Text
                            mt={1}
                            fontSize="xs"
                            color="gray.500"
                            fontWeight="400"
                        >
                            Add a variant under a vehicle model.
                        </Text>
                    </Box>
                </ModalHeader>

                <ModalCloseButton
                    top={4}
                    right={4}
                    isDisabled={loading}
                    rounded="md"
                    color="gray.500"
                    _hover={{
                        bg: "gray.200",
                        color: "gray.700",
                    }}
                />

                {/* BODY */}

                <ModalBody
                    px={6}
                    py={6}
                    bg="white"
                >
                    {/* BRAND */}

                    <FormControl
                        mb={5}
                        isRequired
                    >
                        <FormLabel
                            mb={2}
                            fontSize="sm"
                            fontWeight="600"
                            color="gray.700"
                        >
                            Brand
                        </FormLabel>

                        <Select
                            placeholder={
                                loadingData
                                    ? "Loading brands..."
                                    : "Select Brand"
                            }
                            value={selectedBrand || ""}
                            onChange={handleBrandChange}
                            isDisabled={
                                loadingData || loading
                            }
                            size="md"
                            rounded="md"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{
                                borderColor: "gray.400",
                            }}
                            _focus={{
                                borderColor: "blue.500",
                                boxShadow:
                                    "0 0 0 1px var(--chakra-colors-blue-500)",
                            }}
                        >
                            {activeBrands.map((brand) => (
                                <option
                                    key={brand.id}
                                    value={brand.id}
                                >
                                    {brand.brand}
                                </option>
                            ))}
                        </Select>

                        <Text
                            mt={1.5}
                            fontSize="xs"
                            color="gray.500"
                        >
                            Select the vehicle manufacturer first.
                        </Text>
                    </FormControl>

                    {/* MODEL */}

                    <FormControl
                        mb={5}
                        isRequired
                    >
                        <FormLabel
                            mb={2}
                            fontSize="sm"
                            fontWeight="600"
                            color="gray.700"
                        >
                            Model
                        </FormLabel>

                        <Select
                            name="model_id"
                            placeholder={
                                !selectedBrand
                                    ? "Select brand first"
                                    : filteredModels.length === 0
                                        ? "No models available"
                                        : "Select Model"
                            }
                            value={form.model_id || ""}
                            onChange={handleChange}
                            isDisabled={
                                !selectedBrand ||
                                loadingData ||
                                loading
                            }
                            size="md"
                            rounded="md"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{
                                borderColor: "gray.400",
                            }}
                            _focus={{
                                borderColor: "blue.500",
                                boxShadow:
                                    "0 0 0 1px var(--chakra-colors-blue-500)",
                            }}
                        >
                            {filteredModels.map((model) => (
                                <option
                                    key={model.id}
                                    value={model.id}
                                >
                                    {model.model}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    {/* VARIANT */}

                    <FormControl
                        mb={5}
                        isRequired
                    >
                        <FormLabel
                            mb={2}
                            fontSize="sm"
                            fontWeight="600"
                            color="gray.700"
                        >
                            Variant Name
                        </FormLabel>

                        <Input
                            name="variant"
                            placeholder="e.g. 2.8 G Diesel AT"
                            value={form.variant}
                            onChange={handleChange}
                            isDisabled={loading}
                            size="md"
                            rounded="md"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{
                                borderColor: "gray.400",
                            }}
                            _focus={{
                                borderColor: "blue.500",
                                boxShadow:
                                    "0 0 0 1px var(--chakra-colors-blue-500)",
                            }}
                        />

                        <Text
                            mt={1.5}
                            fontSize="xs"
                            color="gray.500"
                        >
                            Enter the specific vehicle variant.
                        </Text>
                    </FormControl>

                    {/* STATUS */}

                    <FormControl isRequired>
                        <FormLabel
                            mb={2}
                            fontSize="sm"
                            fontWeight="600"
                            color="gray.700"
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
                            isDisabled={loading}
                            size="md"
                            rounded="md"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{
                                borderColor: "gray.400",
                            }}
                            _focus={{
                                borderColor: "blue.500",
                                boxShadow:
                                    "0 0 0 1px var(--chakra-colors-blue-500)",
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
                    bg="gray.50"
                    borderTop="1px solid"
                    borderColor="gray.200"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        rounded="md"
                        color="gray.600"
                        onClick={handleClose}
                        isDisabled={loading}
                        _hover={{
                            bg: "gray.200",
                            color: "gray.800",
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        colorScheme="blue"
                        size="sm"
                        rounded="md"
                        px={6}
                        onClick={handleSubmit}
                        isLoading={loading}
                        loadingText="Saving..."
                    >
                        Save Variant
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}