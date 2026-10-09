import {
    Box,
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
} from "@chakra-ui/react";

import {
    IdentificationIcon,
    Cog6ToothIcon,
} from "@heroicons/react/24/outline";

import type {
    CreateVehicleSpecData,
    FuelType,
    TransmissionType,
} from "../../../../api/VehicleManagement/specApi";

import {
    formatNumber,
    parseNumber,
} from "../../../../utils/numberFormatter";

type EditableVehicleSpec = Omit<
    CreateVehicleSpecData,
    "vehicle_id" | "fuel_type" | "transmission"
> & {
    fuel_type: FuelType | "";
    transmission: TransmissionType | "";
};

interface AddVehicleSpecProps {
    spec: EditableVehicleSpec;

    setSpec: React.Dispatch<
        React.SetStateAction<EditableVehicleSpec>
    >;
}

export default function AdminAddVehicleSpec({
    spec,
    setSpec,
}: AddVehicleSpecProps) {
    const inputFocusStyle = {
        borderColor: "brand.500",
        boxShadow:
            "0 0 0 1px var(--chakra-colors-brand-500)",
    };

    return (
        <Box>
            {/* VEHICLE IDENTIFICATION */}

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
                        required
                        placeholder="Enter plate number"
                        value={spec.plate_number}
                        onChange={(e) =>
                            setSpec((prev) => ({
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
                        required
                        placeholder="Enter engine number"
                        value={spec.engine_number}
                        onChange={(e) =>
                            setSpec((prev) => ({
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
                        required
                        placeholder="Enter chassis number"
                        value={spec.chassis_number}
                        onChange={(e) =>
                            setSpec((prev) => ({
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
                            required
                            type="text"
                            inputMode="numeric"
                            placeholder="Enter mileage"
                            value={formatNumber(
                                spec.mileage
                            )}
                            onChange={(e) =>
                                setSpec((prev) => ({
                                    ...prev,
                                    mileage: parseNumber(e.target.value) ?? 0,
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

            {/* ENGINE & TRANSMISSION */}

            <HStack
                spacing={2}
                mt={7}
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
                        required
                        placeholder="Select fuel type"
                        value={spec.fuel_type}
                        onChange={(e) =>
                            setSpec((prev) => ({
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
                        required
                        placeholder="Select transmission"
                        value={spec.transmission}
                        onChange={(e) =>
                            setSpec((prev) => ({
                                ...prev,
                                transmission:
                                    e.target
                                        .value as TransmissionType,
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
    );
}