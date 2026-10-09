import {
    Box,
    Button,
    FormControl,
    FormLabel,
    HStack,
    Image,
    Input,
    SimpleGrid,
    Text,
    VStack,
    Divider,
} from "@chakra-ui/react";

import {
    PhotoIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";

import { useEffect, useState } from "react";

interface AddVehicleImageProps {
    images: File[];

    setImages: React.Dispatch<
        React.SetStateAction<File[]>
    >;
}

export default function AdminAddVehicleImage({
    images,
    setImages,
}: AddVehicleImageProps) {
    const [previews, setPreviews] =
        useState<string[]>([]);

    // GENERATE IMAGE PREVIEWS

    useEffect(() => {
        const urls = images.map((image) =>
            URL.createObjectURL(image)
        );

        setPreviews(urls);

        return () => {
            urls.forEach((url) =>
                URL.revokeObjectURL(url)
            );
        };
    }, [images]);

    // HANDLE IMAGE SELECTION

    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!e.target.files) {
            return;
        }

        const selectedImages = Array.from(
            e.target.files
        );

        setImages(selectedImages);

        e.target.value = "";
    };

    // REMOVE IMAGE

    const removeImage = (index: number) => {
        setImages((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    return (
        <VStack
            align="stretch"
            spacing={5}
        >

            {/* SECTION HEADER */}

            <Box>

                <HStack
                    spacing={2}
                    mb={3}
                >
                    <PhotoIcon
                        width={19}
                        height={19}
                    />

                    <Text
                        fontSize="sm"
                        fontWeight="700"
                        color="dark.900"
                    >
                        Vehicle Images
                    </Text>
                </HStack>

                <Divider />

                <Text
                    mt={3}
                    fontSize="sm"
                    color="gray.500"
                >
                    Upload clear images of the vehicle.
                    You can select multiple images at once.
                </Text>

                <Text
                    mt={1}
                    fontSize="xs"
                    color="gray.400"
                >
                    Recommended: JPG, JPEG, or PNG
                </Text>

            </Box>

            {/* UPLOAD */}

            <Box
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                p={4}
            >

                <FormControl>

                    <FormLabel
                        fontSize="sm"
                        fontWeight="600"
                        mb={2}
                    >
                        Select Images
                    </FormLabel>

                    <Input
                        type="file"
                        accept="image/*"
                        multiple
                        size="sm"
                        p={1}
                        onChange={
                            handleImageChange
                        }
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

            </Box>

            {/* NO IMAGES */}

            {images.length === 0 ? (

                <Box
                    bg="white"
                    border="1px dashed"
                    borderColor="gray.300"
                    rounded="lg"
                    py={10}
                    px={5}
                    textAlign="center"
                >

                    <PhotoIcon
                        width={32}
                        height={32}
                        style={{
                            margin: "0 auto",
                            opacity: 0.45,
                        }}
                    />

                    <Text
                        mt={3}
                        fontSize="sm"
                        fontWeight="600"
                        color="gray.500"
                    >
                        No images selected
                    </Text>

                    <Text
                        mt={1}
                        fontSize="xs"
                        color="gray.400"
                    >
                        Select one or more vehicle
                        images above.
                    </Text>

                </Box>

            ) : (

                // IMAGE GRID

                <SimpleGrid
                    columns={{
                        base: 2,
                        sm: 3,
                        md: 4,
                    }}
                    spacing={4}
                >

                    {images.map(
                        (image, index) => (

                            <Box
                                key={`${image.name}-${index}`}
                                bg="white"
                                border="1px solid"
                                borderColor="gray.200"
                                rounded="lg"
                                overflow="hidden"
                                transition="all 0.2s ease"
                                _hover={{
                                    borderColor:
                                        "gray.300",
                                    shadow: "sm",
                                }}
                            >

                                {/* IMAGE */}

                                <Box
                                    position="relative"
                                    bg="gray.100"
                                >

                                    <Image
                                        src={
                                            previews[
                                            index
                                            ]
                                        }
                                        alt={
                                            image.name
                                        }
                                        h={{
                                            base: "120px",
                                            md: "145px",
                                        }}
                                        w="100%"
                                        objectFit="cover"
                                    />

                                    {/* Image Number */}

                                    <Box
                                        position="absolute"
                                        top={2}
                                        left={2}
                                        px={2}
                                        py={0.5}
                                        rounded="md"
                                        bg="blackAlpha.700"
                                        color="white"
                                    >
                                        <Text
                                            fontSize="xs"
                                            fontWeight="600"
                                        >
                                            {index + 1}
                                        </Text>
                                    </Box>

                                </Box>

                                {/* IMAGE DETAILS */}

                                <Box p={3}>

                                    <Text
                                        fontSize="xs"
                                        fontWeight="500"
                                        noOfLines={1}
                                        title={
                                            image.name
                                        }
                                    >
                                        {image.name}
                                    </Text>

                                    <Text
                                        mt={0.5}
                                        fontSize="xs"
                                        color="gray.400"
                                    >
                                        {(
                                            image.size /
                                            1024 /
                                            1024
                                        ).toFixed(
                                            2
                                        )}{" "}
                                        MB
                                    </Text>

                                    <Button
                                        mt={2}
                                        size="xs"
                                        width="100%"
                                        variant="ghost"
                                        colorScheme="red"
                                        leftIcon={
                                            <TrashIcon
                                                width={
                                                    15
                                                }
                                                height={
                                                    15
                                                }
                                            />
                                        }
                                        onClick={() =>
                                            removeImage(
                                                index
                                            )
                                        }
                                    >
                                        Remove
                                    </Button>

                                </Box>

                            </Box>

                        )
                    )}

                </SimpleGrid>

            )}

            {/* IMAGE COUNT */}

            {images.length > 0 && (

                <HStack
                    justify="flex-end"
                    px={1}
                >

                    <Text
                        fontSize="xs"
                        color="gray.500"
                    >
                        {images.length}{" "}
                        {images.length === 1
                            ? "image"
                            : "images"}{" "}
                        selected
                    </Text>

                </HStack>

            )}

        </VStack>
    );
}