import {
    Box,
    Button,
    Divider,
    FormControl,
    FormLabel,
    HStack,
    Input,
    SimpleGrid,
    Text,
    VStack,
} from "@chakra-ui/react";

import {
    DocumentTextIcon,
    DocumentCheckIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";

import { useEffect, useState } from "react";

interface AddVehicleDocumentProps {
    documents: {
        vehicle_cr?: File;
        vehicle_or?: File;
    };

    setDocuments: React.Dispatch<
        React.SetStateAction<{
            vehicle_cr?: File;
            vehicle_or?: File;
        }>
    >;
}

export default function AdminAddVehicleDocument({
    documents,
    setDocuments,
}: AddVehicleDocumentProps) {
    const [crPreview, setCrPreview] =
        useState<string | null>(null);

    const [orPreview, setOrPreview] =
        useState<string | null>(null);

    // CR PREVIEW

    useEffect(() => {
        if (!documents.vehicle_cr) {
            setCrPreview(null);
            return;
        }

        const url = URL.createObjectURL(
            documents.vehicle_cr
        );

        setCrPreview(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [documents.vehicle_cr]);

    // OR PREVIEW

    useEffect(() => {
        if (!documents.vehicle_or) {
            setOrPreview(null);
            return;
        }

        const url = URL.createObjectURL(
            documents.vehicle_or
        );

        setOrPreview(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [documents.vehicle_or]);

    // SELECT CR

    const handleCrChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) return;

        setDocuments((prev) => ({
            ...prev,
            vehicle_cr: file,
        }));

        event.target.value = "";
    };

    // SELECT OR

    const handleOrChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) return;

        setDocuments((prev) => ({
            ...prev,
            vehicle_or: file,
        }));

        event.target.value = "";
    };

    // REMOVE CR

    const removeCr = () => {
        setDocuments((prev) => ({
            ...prev,
            vehicle_cr: undefined,
        }));
    };

    // REMOVE OR

    const removeOr = () => {
        setDocuments((prev) => ({
            ...prev,
            vehicle_or: undefined,
        }));
    };

    // PREVIEW

    const renderPreview = (
        file: File | undefined,
        preview: string | null
    ) => {
        if (!file) return null;

        const isPdf =
            file.type === "application/pdf";

        return (
            <Box
                mt={3}
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                overflow="hidden"
                bg="white"
            >
                {/* File Information */}
                <Box
                    px={3}
                    py={2.5}
                    bg="gray.50"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                >
                    <Text
                        fontSize="sm"
                        fontWeight="600"
                        noOfLines={1}
                        title={file.name}
                    >
                        {file.name}
                    </Text>

                    <Text
                        mt={0.5}
                        fontSize="xs"
                        color="gray.500"
                    >
                        {(file.size / 1024 / 1024).toFixed(
                            2
                        )}{" "}
                        MB
                    </Text>
                </Box>

                {/* Preview */}
                {isPdf ? (
                    <Box
                        bg="gray.100"
                        p={2}
                    >
                        <iframe
                            src={preview ?? ""}
                            title={file.name}
                            width="100%"
                            height="260px"
                            style={{
                                border: "none",
                                borderRadius: "6px",
                            }}
                        />
                    </Box>
                ) : (
                    <Box
                        bg="gray.100"
                        p={2}
                        display="flex"
                        justifyContent="center"
                    >
                        <img
                            src={preview ?? ""}
                            alt={file.name}
                            style={{
                                width: "100%",
                                maxHeight: "260px",
                                objectFit: "contain",
                                borderRadius: "6px",
                            }}
                        />
                    </Box>
                )}
            </Box>
        );
    };

    // STATUS

    const Status = ({
        selected,
    }: {
        selected: boolean;
    }) => (
        <HStack
            justify="space-between"
            mt={3}
            px={3}
            py={2}
            rounded="md"
            bg={
                selected
                    ? "green.50"
                    : "orange.50"
            }
        >
            <Text
                fontSize="xs"
                color="gray.600"
            >
                Document status
            </Text>

            <Text
                fontSize="xs"
                fontWeight="600"
                color={
                    selected
                        ? "green.600"
                        : "orange.600"
                }
            >
                {selected
                    ? "Selected"
                    : "Not selected"}
            </Text>
        </HStack>
    );

    return (
        <VStack
            align="stretch"
            spacing={6}
        >
            {/* DOCUMENT INFORMATION */}

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
                        Vehicle Documents
                    </Text>
                </HStack>

                <Divider mb={4} />

                <Text
                    fontSize="sm"
                    color="gray.500"
                >
                    Upload the vehicle's official
                    Certificate of Registration (CR)
                    and Official Receipt (OR).
                </Text>

                <Text
                    mt={1}
                    fontSize="xs"
                    color="gray.400"
                >
                    Accepted: PDF, JPG, JPEG, PNG
                    · Maximum 10 MB per file
                </Text>
            </Box>

            {/* DOCUMENT UPLOADS */}

            <SimpleGrid
                columns={{
                    base: 1,
                    lg: 2,
                }}
                spacing={5}
            >
                {/* CR */}

                <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    rounded="lg"
                    bg="white"
                >
                    <HStack
                        spacing={2}
                        mb={4}
                    >
                        <DocumentCheckIcon
                            width={18}
                            height={18}
                        />

                        <Text
                            fontSize="sm"
                            fontWeight="700"
                        >
                            Certificate of Registration
                        </Text>
                    </HStack>

                    <FormControl>
                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            CR Document
                        </FormLabel>

                        <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            size="sm"
                            p={1}
                            onChange={handleCrChange}
                            borderColor="gray.200"
                            _hover={{
                                borderColor:
                                    "gray.300",
                            }}
                            _focus={{
                                borderColor:
                                    "brand.500",
                                boxShadow:
                                    "0 0 0 1px var(--chakra-colors-brand-500)",
                            }}
                        />
                    </FormControl>

                    {documents.vehicle_cr &&
                        renderPreview(
                            documents.vehicle_cr,
                            crPreview
                        )}

                    <Status
                        selected={
                            !!documents.vehicle_cr
                        }
                    />

                    {documents.vehicle_cr && (
                        <Button
                            mt={3}
                            size="sm"
                            width="100%"
                            variant="ghost"
                            colorScheme="red"
                            leftIcon={
                                <TrashIcon
                                    width={16}
                                    height={16}
                                />
                            }
                            onClick={removeCr}
                        >
                            Remove CR
                        </Button>
                    )}
                </Box>

                {/* OR */}

                <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    rounded="lg"
                    bg="white"
                >
                    <HStack
                        spacing={2}
                        mb={4}
                    >
                        <DocumentCheckIcon
                            width={18}
                            height={18}
                        />

                        <Text
                            fontSize="sm"
                            fontWeight="700"
                        >
                            Official Receipt
                        </Text>
                    </HStack>

                    <FormControl>
                        <FormLabel
                            fontSize="sm"
                            fontWeight="600"
                        >
                            OR Document
                        </FormLabel>

                        <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            size="sm"
                            p={1}
                            onChange={handleOrChange}
                            borderColor="gray.200"
                            _hover={{
                                borderColor:
                                    "gray.300",
                            }}
                            _focus={{
                                borderColor:
                                    "brand.500",
                                boxShadow:
                                    "0 0 0 1px var(--chakra-colors-brand-500)",
                            }}
                        />
                    </FormControl>

                    {documents.vehicle_or &&
                        renderPreview(
                            documents.vehicle_or,
                            orPreview
                        )}

                    <Status
                        selected={
                            !!documents.vehicle_or
                        }
                    />

                    {documents.vehicle_or && (
                        <Button
                            mt={3}
                            size="sm"
                            width="100%"
                            variant="ghost"
                            colorScheme="red"
                            leftIcon={
                                <TrashIcon
                                    width={16}
                                    height={16}
                                />
                            }
                            onClick={removeOr}
                        >
                            Remove OR
                        </Button>
                    )}
                </Box>
            </SimpleGrid>
        </VStack>
    );
}