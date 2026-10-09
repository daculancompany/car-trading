import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import {
    Box,
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
    type CreateVehicleData,
} from "../../../../api/VehicleManagement/vehicleApi";

import {
    formatNumber,
    parseNumber,
} from "../../../../utils/numberFormatter";

interface AdminAddVehicleInfoProps {
    vehicle: CreateVehicleData;
    setVehicle: Dispatch<SetStateAction<CreateVehicleData>>;
}

export default function AdminAddVehicleInfo({
    vehicle,
    setVehicle,
}: AdminAddVehicleInfoProps) {
    const [brands, setBrands] = useState<VehicleBrand[]>([]);
    const [models, setModels] = useState<VehicleModel[]>([]);
    const [variants, setVariants] = useState<VehicleVariant[]>([]);

    // LOAD MASTER DATA

    useEffect(() => {
        const loadData = async () => {
            try {
                const [brandsData, modelsData, variantsData] =
                    await Promise.all([
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
            }
        };

        loadData();
    }, []);

    // FILTER MASTER DATA

    const filteredModels = models.filter(
        (model) =>
            model.brand_id === vehicle.brand_id &&
            model.is_active
    );

    const filteredVariants = variants.filter(
        (variant) =>
            variant.model_id === vehicle.model_id &&
            variant.is_active
    );

    // COMMON INPUT STYLE

    const inputFocusStyle = {
        borderColor: "brand.500",
        boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
    };

    return (
        <VStack
            align="stretch"
            spacing={6}
        >
            {/* VEHICLE INFORMATION */}

            <Box>
                <HStack
                    spacing={2}
                    mb={4}
                >
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
                            placeholder="Auto-generated after saving"
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
                            value={vehicle.brand_id || ""}
                            onChange={(e) =>
                                setVehicle((prev) => ({
                                    ...prev,
                                    brand_id: Number(e.target.value),
                                    model_id: 0,
                                    variant_id: 0,
                                }))
                            }
                            _focus={inputFocusStyle}
                        >
                            {brands
                                .filter((brand) => brand.is_active)
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
                        isDisabled={!vehicle.brand_id}
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
                                vehicle.brand_id
                                    ? "Select Model"
                                    : "Select Brand First"
                            }
                            value={vehicle.model_id || ""}
                            onChange={(e) =>
                                setVehicle((prev) => ({
                                    ...prev,
                                    model_id: Number(e.target.value),
                                    variant_id: 0,
                                }))
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
                        isDisabled={!vehicle.model_id}
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
                                vehicle.model_id
                                    ? "Select Variant"
                                    : "Select Model First"
                            }
                            value={vehicle.variant_id || ""}
                            onChange={(e) =>
                                setVehicle((prev) => ({
                                    ...prev,
                                    variant_id: Number(e.target.value),
                                }))
                            }
                            _focus={inputFocusStyle}
                        >
                            {filteredVariants.map((variant) => (
                                <option
                                    key={variant.id}
                                    value={variant.id}
                                >
                                    {variant.variant}
                                </option>
                            ))}
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
                            value={vehicle.year_model || ""}
                            onChange={(e) => {
                                const value =
                                    e.target.value.replace(/\D/g, "");

                                setVehicle((prev) => ({
                                    ...prev,
                                    year_model:
                                        value === ""
                                            ? 0
                                            : Number(value),
                                }));
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
                            value={vehicle.color}
                            onChange={(e) =>
                                setVehicle((prev) => ({
                                    ...prev,
                                    color: e.target.value,
                                }))
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
                            value={vehicle.status ?? "available"}
                            onChange={(e) =>
                                setVehicle((prev) => ({
                                    ...prev,
                                    status: e.target.value,
                                }))
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
                <HStack
                    spacing={2}
                    mb={4}
                >
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
                                    vehicle.selling_price
                                )}
                                onChange={(e) =>
                                    setVehicle((prev) => ({
                                        ...prev,
                                        selling_price: parseNumber(e.target.value) ?? 0,
                                    }))
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
                                    vehicle.reservation_price
                                )}
                                onChange={(e) =>
                                    setVehicle((prev) => ({
                                        ...prev,
                                        reservation_price:
                                            parseNumber(
                                                e.target.value
                                            ) ?? 0,
                                    }))
                                }
                                _focus={inputFocusStyle}
                            />
                        </InputGroup>
                    </FormControl>
                </SimpleGrid>
            </Box>

            {/* DESCRIPTION & FEATURES */}

            <Box>
                <HStack
                    spacing={2}
                    mb={4}
                >
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

                <VStack
                    align="stretch"
                    spacing={4}
                >
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
                            value={vehicle.description ?? ""}
                            onChange={(e) =>
                                setVehicle((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
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
                            value={vehicle.features ?? ""}
                            onChange={(e) =>
                                setVehicle((prev) => ({
                                    ...prev,
                                    features: e.target.value,
                                }))
                            }
                            _focus={inputFocusStyle}
                        />

                        <FormHelperText fontSize="xs">
                            Enter one feature per line.
                        </FormHelperText>
                    </FormControl>
                </VStack>
            </Box>
        </VStack>
    );
}