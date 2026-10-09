import { useEffect, useState } from "react";
import axios from "axios";

import {
    Box,
    Button,
    Divider,
    FormControl,
    FormLabel,
    HStack,
    Input,
    InputGroup,
    InputRightAddon,
    Select,
    SimpleGrid,
    Text,
    VStack,
    useToast,
} from "@chakra-ui/react";

import {
    IdentificationIcon,
    Cog6ToothIcon,
} from "@heroicons/react/24/outline";

import type { Vehicle } from "../../../../api/VehicleManagement/vehicleApi";

import {
    updateVehicleSpec,
    type UpdateVehicleSpecData,
    type FuelType,
    type TransmissionType,
} from "../../../../api/VehicleManagement/specApi";

import {
    formatNumber,
    parseNumber,
} from "../../../../utils/numberFormatter";

interface UpdateVehicleSpecificationProps {
    vehicle: Vehicle;
    onReload: () => void;
    onClose: () => void;
}

export default function AdminUpdateVehicleSpecification({
    vehicle,
    onReload,
    onClose,
}: UpdateVehicleSpecificationProps) {

    const toast = useToast();

    const [isSaving, setIsSaving] = useState(false);

    // FORM STATE

    const [form, setForm] = useState<
        Omit<UpdateVehicleSpecData, "vehicle_id">
    >({
        plate_number: "",
        engine_number: "",
        chassis_number: "",
        mileage: 0,
        fuel_type: "gasoline",
        transmission: "manual",
    });

    // INPUT STYLE

    const inputFocusStyle = {
        borderColor: "brand.500",
        boxShadow:
            "0 0 0 1px var(--chakra-colors-brand-500)",
    };

    // LOAD EXISTING SPECIFICATION

    useEffect(() => {

        const spec = vehicle.specs;

        if (!spec) {

            setForm({
                plate_number: "",
                engine_number: "",
                chassis_number: "",
                mileage: 0,
                fuel_type: "gasoline",
                transmission: "manual",
            });

            return;
        }

        setForm({
            plate_number: spec.plate_number ?? "",
            engine_number: spec.engine_number ?? "",
            chassis_number: spec.chassis_number ?? "",
            mileage: spec.mileage ?? 0,
            fuel_type: spec.fuel_type as FuelType,
            transmission:
                spec.transmission as TransmissionType,
        });

    }, [vehicle]);

    // UPDATE SPECIFICATION

    const handleUpdate = async () => {

        const spec = vehicle.specs;

        if (!spec) {

            toast({
                title: "No Specification",
                description:
                    "This vehicle has no specification record.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            return;
        }

        // VALIDATION

        if (!form.plate_number?.trim()) {

            toast({
                title: "Plate Number Required",
                description:
                    "Please enter the plate number.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            return;
        }

        if (!form.engine_number?.trim()) {

            toast({
                title: "Engine Number Required",
                description:
                    "Please enter the engine number.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            return;
        }

        if (!form.chassis_number?.trim()) {

            toast({
                title: "Chassis Number Required",
                description:
                    "Please enter the chassis number.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            return;
        }

        if (
            form.mileage !== undefined &&
            form.mileage < 0
        ) {

            toast({
                title: "Invalid Mileage",
                description:
                    "Mileage cannot be negative.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            return;
        }

        if (!form.fuel_type) {

            toast({
                title: "Fuel Type Required",
                description:
                    "Please select a fuel type.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            return;
        }

        if (!form.transmission) {

            toast({
                title: "Transmission Required",
                description:
                    "Please select a transmission.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            return;
        }

        setIsSaving(true);

        try {

            await updateVehicleSpec(
                spec.id,
                form
            );

            toast({
                title: "Success",
                description:
                    "Vehicle specification updated successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });

            await onReload();

            onClose();

        } catch (error) {

            console.error(
                "Failed to update vehicle specification:",
                error
            );

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

    // UI

    return (

        <VStack
            align="stretch"
            spacing={6}
        >

            {/* VEHICLE IDENTIFICATION */}

            <Box>

                <HStack
                    spacing={2}
                    mb={4}
                >

                    <IdentificationIcon
                        width={19}
                        height={19}
                    />

                    <Text
                        fontSize="sm"
                        fontWeight="700"
                        color="dark.900"
                    >
                        Vehicle Identification
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

                    {/* Plate Number */}

                    <FormControl isRequired>

                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Plate Number
                        </FormLabel>

                        <Input
                            size="md"
                            placeholder="Enter plate number"
                            value={form.plate_number ?? ""}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    plate_number:
                                        e.target.value,
                                }))
                            }
                            _focus={inputFocusStyle}
                        />

                    </FormControl>

                    {/* Engine Number */}

                    <FormControl isRequired>

                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Engine Number
                        </FormLabel>

                        <Input
                            size="md"
                            placeholder="Enter engine number"
                            value={form.engine_number ?? ""}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    engine_number:
                                        e.target.value,
                                }))
                            }
                            _focus={inputFocusStyle}
                        />

                    </FormControl>

                    {/* Chassis Number */}

                    <FormControl isRequired>

                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Chassis Number
                        </FormLabel>

                        <Input
                            size="md"
                            placeholder="Enter chassis number"
                            value={form.chassis_number ?? ""}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    chassis_number:
                                        e.target.value,
                                }))
                            }
                            _focus={inputFocusStyle}
                        />

                    </FormControl>

                    {/* Mileage */}

                    <FormControl isRequired>

                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Mileage
                        </FormLabel>

                        <InputGroup size="md">

                            <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="Enter mileage"
                                value={formatNumber(
                                    form.mileage ?? 0
                                )}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        mileage:
                                            parseNumber(
                                                e.target.value
                                            ),
                                    }))
                                }
                                _focus={inputFocusStyle}
                            />

                            <InputRightAddon
                                bg="gray.50"
                                borderColor="gray.200"
                                fontSize="sm"
                                fontWeight="600"
                                color="gray.600"
                            >
                                km
                            </InputRightAddon>

                        </InputGroup>

                    </FormControl>

                </SimpleGrid>

            </Box>

            {/* ENGINE & TRANSMISSION */}

            <Box>

                <HStack
                    spacing={2}
                    mb={4}
                >

                    <Cog6ToothIcon
                        width={19}
                        height={19}
                    />

                    <Text
                        fontSize="sm"
                        fontWeight="700"
                        color="dark.900"
                    >
                        Engine & Transmission
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

                    {/* Fuel Type */}

                    <FormControl isRequired>

                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Fuel Type
                        </FormLabel>

                        <Select
                            size="md"
                            placeholder="Select fuel type"
                            value={form.fuel_type ?? ""}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    fuel_type:
                                        e.target.value as FuelType,
                                }))
                            }
                            _focus={inputFocusStyle}
                        >

                            <option value="gasoline">
                                Gasoline
                            </option>

                            <option value="diesel">
                                Diesel
                            </option>

                            <option value="electric">
                                Electric
                            </option>

                        </Select>

                    </FormControl>

                    {/* Transmission */}

                    <FormControl isRequired>

                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            Transmission
                        </FormLabel>

                        <Select
                            size="md"
                            placeholder="Select transmission"
                            value={form.transmission ?? ""}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    transmission:
                                        e.target.value as TransmissionType,
                                }))
                            }
                            _focus={inputFocusStyle}
                        >

                            <option value="automatic">
                                Automatic
                            </option>

                            <option value="manual">
                                Manual
                            </option>

                        </Select>

                    </FormControl>

                </SimpleGrid>

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
                    Save Specification
                </Button>

            </HStack>

        </VStack>

    );

}