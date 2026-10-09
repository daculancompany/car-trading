import { useEffect, useState } from "react";
import axios from "axios";

import {
    Box,
    Button,
    Divider,
    FormControl,
    FormHelperText,
    FormLabel,
    HStack,
    Input,
    InputGroup,
    InputLeftAddon,
    Select,
    SimpleGrid,
    Text,
    Textarea,
    VStack,
    useToast,
} from "@chakra-ui/react";

import {
    InformationCircleIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
} from "@heroicons/react/24/outline";

import {
    getVehicleBrands,
    type VehicleBrand,
} from "../../../../api/VehicleManagement/brandApi";

import {
    getVehicleModels,
    type VehicleModel,
} from "../../../../api/VehicleManagement/modelApi";

import {
    getVehicleVariants,
    type VehicleVariant,
} from "../../../../api/VehicleManagement/variantApi";

import {
    updateVehicle,
    type Vehicle,
    type UpdateVehicleData,
} from "../../../../api/VehicleManagement/vehicleApi";

import {
    formatNumber,
    parseNumber,
} from "../../../../utils/numberFormatter";

interface UpdateVehicleInformationProps {
    vehicle: Vehicle;
    onReload: () => void;
    onClose: () => void;
}

export default function UpdateVehicleInformation({
    vehicle,
    onReload,
    onClose,
}: UpdateVehicleInformationProps) {
    const toast = useToast();

    const [isSaving, setIsSaving] = useState(false);

    const [brands, setBrands] = useState<VehicleBrand[]>([]);
    const [models, setModels] = useState<VehicleModel[]>([]);
    const [variants, setVariants] = useState<VehicleVariant[]>([]);

    // FORM STATE

    const [form, setForm] = useState<UpdateVehicleData>({
        brand_id: vehicle.brand_id,
        model_id: vehicle.model_id,
        variant_id: vehicle.variant_id,

        year_model: vehicle.year_model,
        color: vehicle.color,

        description: vehicle.description ?? "",
        features: vehicle.features ?? "",

        selling_price: vehicle.selling_price,
        reservation_price: vehicle.reservation_price,

        status: vehicle.status,
    });

    // LOAD MASTER DATA

    useEffect(() => {
        const loadData = async () => {
            try {
                const [
                    brandsData,
                    modelsData,
                    variantsData,
                ] = await Promise.all([
                    getVehicleBrands(),
                    getVehicleModels(),
                    getVehicleVariants(),
                ]);

                setBrands(brandsData);
                setModels(modelsData);
                setVariants(variantsData);
            } catch (error) {
                console.error(
                    "Failed to load vehicle master data:",
                    error
                );

                toast({
                    title: "Error",
                    description:
                        "Failed to load vehicle master data.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right",
                });
            }
        };

        loadData();
    }, [toast]);

    // UPDATE FORM WHEN VEHICLE CHANGES

    useEffect(() => {
        setForm({
            brand_id: vehicle.brand_id,
            model_id: vehicle.model_id,
            variant_id: vehicle.variant_id,

            year_model: vehicle.year_model,
            color: vehicle.color,

            description: vehicle.description ?? "",
            features: vehicle.features ?? "",

            selling_price: vehicle.selling_price,
            reservation_price: vehicle.reservation_price,

            status: vehicle.status,
        });
    }, [vehicle]);

    // FILTER MASTER DATA

    const filteredModels = models.filter(
        (model) =>
            model.brand_id === form.brand_id &&
            model.is_active
    );

    const filteredVariants = variants.filter(
        (variant) =>
            variant.model_id === form.model_id &&
            variant.is_active
    );

    // COMMON INPUT STYLE

    const inputFocusStyle = {
        borderColor: "brand.500",
        boxShadow:
            "0 0 0 1px var(--chakra-colors-brand-500)",
    };

    // UPDATE VEHICLE

    const handleUpdate = async () => {
        if (isSaving) return;

        setIsSaving(true);

        try {
            await updateVehicle(vehicle.id, form);

            toast({
                title: "Success",
                description:
                    "Vehicle information updated successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            await onReload();

            onClose();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                let message = "Something went wrong.";

                if (error.response?.status === 422) {
                    if (error.response.data?.errors) {
                        message = Object.values(
                            error.response.data.errors
                        )
                            .flat()
                            .join("\n");
                    } else {
                        message =
                            error.response.data?.message ??
                            message;
                    }
                } else {
                    message =
                        error.response?.data?.message ??
                        message;
                }

                toast({
                    title: "Update Failed",
                    description: message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right",
                });
            } else {
                toast({
                    title: "Unexpected Error",
                    description:
                        "An unexpected error occurred.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right",
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    // VEHICLE STOCK NUMBER

    const stockNumber = (
        vehicle as Vehicle & {
            stock_number?: string | null;
        }
    ).stock_number;

    // UI

    return (
        <VStack align="stretch" spacing={6}>
            {/* VEHICLE INFORMATION */}

            <Box>
                <HStack spacing={2} mb={4}>
                    <InformationCircleIcon
                        width={19}
                        height={19}
                    />

                    <Text
                        fontSize="sm"
                        fontWeight="700"
                        color="dark.900"
                    >
                        Vehicle Information
                    </Text>
                </HStack>

                <Divider mb={5} />

                <SimpleGrid
                    columns={{
                        base: 1,
                        md: 2,
                    }}
                    spacingX={5}
                    spacingY={4}
                >
                    {/* Stock Number */}

                    <FormControl>
                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Stock No.
                        </FormLabel>

                        <Input
                            size="md"
                            value={stockNumber ?? ""}
                            placeholder="Stock number"
                            isReadOnly
                            bg="gray.50"
                            color="gray.500"
                            borderColor="gray.200"
                        />
                    </FormControl>

                    {/* Brand */}

                    <FormControl isRequired>
                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Brand
                        </FormLabel>

                        <Select
                            size="md"
                            placeholder="Select Brand"
                            value={form.brand_id || ""}
                            onChange={(e) =>
                                setForm(
                                    (
                                        prev: UpdateVehicleData
                                    ) => ({
                                        ...prev,
                                        brand_id: Number(
                                            e.target.value
                                        ),
                                        model_id: 0,
                                        variant_id: 0,
                                    })
                                )
                            }
                            _focus={inputFocusStyle}
                        >
                            {brands
                                .filter(
                                    (brand) =>
                                        brand.is_active
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

                    {/* Model */}

                    <FormControl
                        isRequired
                        isDisabled={!form.brand_id}
                    >
                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Model
                        </FormLabel>

                        <Select
                            size="md"
                            placeholder={
                                form.brand_id
                                    ? "Select Model"
                                    : "Select Brand First"
                            }
                            value={form.model_id || ""}
                            onChange={(e) =>
                                setForm(
                                    (
                                        prev: UpdateVehicleData
                                    ) => ({
                                        ...prev,
                                        model_id: Number(
                                            e.target.value
                                        ),
                                        variant_id: 0,
                                    })
                                )
                            }
                            _focus={inputFocusStyle}
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

                    {/* Variant */}

                    <FormControl
                        isRequired
                        isDisabled={!form.model_id}
                    >
                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Variant
                        </FormLabel>

                        <Select
                            size="md"
                            placeholder={
                                form.model_id
                                    ? "Select Variant"
                                    : "Select Model First"
                            }
                            value={form.variant_id || ""}
                            onChange={(e) =>
                                setForm(
                                    (
                                        prev: UpdateVehicleData
                                    ) => ({
                                        ...prev,
                                        variant_id: Number(
                                            e.target.value
                                        ),
                                    })
                                )
                            }
                            _focus={inputFocusStyle}
                        >
                            {filteredVariants.map(
                                (variant) => (
                                    <option
                                        key={variant.id}
                                        value={variant.id}
                                    >
                                        {variant.variant}
                                    </option>
                                )
                            )}
                        </Select>
                    </FormControl>

                    {/* Year Model */}

                    <FormControl isRequired>
                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Year Model
                        </FormLabel>

                        <Input
                            size="md"
                            type="text"
                            inputMode="numeric"
                            placeholder="Enter year model"
                            value={form.year_model ?? ""}
                            onChange={(e) => {
                                const value =
                                    e.target.value.replace(
                                        /\D/g,
                                        ""
                                    );

                                setForm(
                                    (
                                        prev: UpdateVehicleData
                                    ) => ({
                                        ...prev,
                                        year_model:
                                            value === ""
                                                ? undefined
                                                : Number(value),
                                    })
                                );
                            }}
                            _focus={inputFocusStyle}
                        />
                    </FormControl>

                    {/* Color */}

                    <FormControl isRequired>
                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Color
                        </FormLabel>

                        <Input
                            size="md"
                            placeholder="Enter vehicle color"
                            value={form.color ?? ""}
                            onChange={(e) =>
                                setForm(
                                    (
                                        prev: UpdateVehicleData
                                    ) => ({
                                        ...prev,
                                        color: e.target.value,
                                    })
                                )
                            }
                            _focus={inputFocusStyle}
                        />
                    </FormControl>

                    {/* Status */}

                    <FormControl isRequired>
                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Status
                        </FormLabel>

                        <Select
                            size="md"
                            value={form.status ?? ""}
                            onChange={(e) =>
                                setForm(
                                    (
                                        prev: UpdateVehicleData
                                    ) => ({
                                        ...prev,
                                        status:
                                            e.target.value as
                                            | "available"
                                            | "reserved"
                                            | "sold"
                                            | "maintenance",
                                    })
                                )
                            }
                            _focus={inputFocusStyle}
                        >
                            <option value="available">
                                Available
                            </option>

                            <option value="reserved">
                                Reserved
                            </option>

                            <option value="sold">
                                Sold
                            </option>

                            <option value="maintenance">
                                Maintenance
                            </option>
                        </Select>
                    </FormControl>
                </SimpleGrid>
            </Box>

            {/* VEHICLE PRICING */}

            <Box>
                <HStack spacing={2} mb={4}>
                    <CurrencyDollarIcon
                        width={19}
                        height={19}
                    />

                    <Text
                        fontSize="sm"
                        fontWeight="700"
                        color="dark.900"
                    >
                        Vehicle Pricing
                    </Text>
                </HStack>

                <Divider mb={5} />

                <SimpleGrid
                    columns={{
                        base: 1,
                        md: 2,
                    }}
                    spacingX={5}
                    spacingY={4}
                >
                    {/* Selling Price */}

                    <FormControl isRequired>
                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Selling Price
                        </FormLabel>

                        <InputGroup size="md">
                            <InputLeftAddon
                                bg="gray.50"
                                borderColor="gray.200"
                                fontWeight="600"
                            >
                                ₱
                            </InputLeftAddon>

                            <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="Enter selling price"
                                value={formatNumber(
                                    form.selling_price
                                )}
                                onChange={(e) =>
                                    setForm(
                                        (
                                            prev: UpdateVehicleData
                                        ) => ({
                                            ...prev,
                                            selling_price:
                                                parseNumber(
                                                    e.target.value
                                                ) ?? 0,
                                        })
                                    )
                                }
                                _focus={inputFocusStyle}
                            />
                        </InputGroup>
                    </FormControl>

                    {/* Reservation Price */}

                    <FormControl isRequired>
                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Reservation Price
                        </FormLabel>

                        <InputGroup size="md">
                            <InputLeftAddon
                                bg="gray.50"
                                borderColor="gray.200"
                                fontWeight="600"
                            >
                                ₱
                            </InputLeftAddon>

                            <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="Enter reservation price"
                                value={formatNumber(
                                    form.reservation_price
                                )}
                                onChange={(e) =>
                                    setForm(
                                        (
                                            prev: UpdateVehicleData
                                        ) => ({
                                            ...prev,
                                            reservation_price:
                                                parseNumber(
                                                    e.target.value
                                                ) ?? 0,
                                        })
                                    )
                                }
                                _focus={inputFocusStyle}
                            />
                        </InputGroup>
                    </FormControl>
                </SimpleGrid>
            </Box>

            {/* ADDITIONAL INFORMATION */}

            <Box>
                <HStack spacing={2} mb={4}>
                    <DocumentTextIcon
                        width={19}
                        height={19}
                    />

                    <Text
                        fontSize="sm"
                        fontWeight="700"
                        color="dark.900"
                    >
                        Additional Information
                    </Text>
                </HStack>

                <Divider mb={5} />

                <VStack align="stretch" spacing={4}>
                    {/* Description */}

                    <FormControl>
                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Description
                        </FormLabel>

                        <Textarea
                            placeholder="Enter vehicle description"
                            rows={3}
                            resize="vertical"
                            value={form.description ?? ""}
                            onChange={(e) =>
                                setForm(
                                    (
                                        prev: UpdateVehicleData
                                    ) => ({
                                        ...prev,
                                        description:
                                            e.target.value,
                                    })
                                )
                            }
                            _focus={inputFocusStyle}
                        />
                    </FormControl>

                    {/* Features */}

                    <FormControl>
                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Features
                        </FormLabel>

                        <Textarea
                            rows={5}
                            resize="vertical"
                            placeholder={`Example:
Air Conditioning
Power Steering
ABS
Reverse Camera
Leather Seats`}
                            value={form.features ?? ""}
                            onChange={(e) =>
                                setForm(
                                    (
                                        prev: UpdateVehicleData
                                    ) => ({
                                        ...prev,
                                        features:
                                            e.target.value,
                                    })
                                )
                            }
                            _focus={inputFocusStyle}
                        />

                        <FormHelperText fontSize="xs">
                            Enter one feature per line.
                        </FormHelperText>
                    </FormControl>
                </VStack>
            </Box>

            {/* ACTION BUTTONS */}

            <HStack
                justify="flex-end"
                spacing={3}
                pt={2}
            >
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    isDisabled={isSaving}
                >
                    Cancel
                </Button>

                <Button
                    size="sm"
                    bg="brand.500"
                    color="white"
                    px={6}
                    _hover={{
                        bg: "brand.600",
                    }}
                    _active={{
                        bg: "brand.700",
                    }}
                    onClick={handleUpdate}
                    isLoading={isSaving}
                    loadingText="Updating..."
                    isDisabled={isSaving}
                >
                    Save Information
                </Button>
            </HStack>
        </VStack>
    );
}