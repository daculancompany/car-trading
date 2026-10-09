import { useEffect, useState } from "react";

import {
    Box,
    Flex,
    Grid,
    Icon,
    IconButton,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
} from "@chakra-ui/react";

import {
    CameraIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PhotoIcon,
} from "@heroicons/react/24/outline";

import type { Vehicle } from "../../../api/VehicleManagement/vehicleApi";

interface VehicleGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: Vehicle | null;
}

export default function CustomerVehicleGalleryModal({
    isOpen,
    onClose,
    vehicle,
}: VehicleGalleryModalProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        setSelectedIndex(0);
    }, [vehicle]);

    if (!vehicle) return null;

    const images = vehicle.images ?? [];

    const currentImage =
        images.length > 0
            ? `/storage/${images[selectedIndex].image_path}`
            : "https://via.placeholder.com/900x600?text=No+Image";

    const previousImage = () => {
        if (!images.length) return;

        setSelectedIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const nextImage = () => {
        if (!images.length) return;

        setSelectedIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="4xl"
            isCentered
            motionPreset="scale"
        >
            <ModalOverlay
                bg="blackAlpha.700"
            />

            <ModalContent
                borderRadius="xl"
                overflow="hidden"
                mx={{
                    base: 2,
                    sm: 4,
                }}
                boxShadow="2xl"
            >
                {/* Header */}

                <ModalHeader
                    bg="dark.700"
                    color="white"
                    py={{
                        base: 2,
                        sm: 3,
                    }}
                    px={{
                        base: 3,
                        sm: 4,
                    }}
                    pr={12}
                >
                    <Flex
                        align="center"
                        gap={{
                            base: 2,
                            sm: 3,
                        }}
                    >
                        <Flex
                            w={{
                                base: "30px",
                                sm: "34px",
                            }}
                            h={{
                                base: "30px",
                                sm: "34px",
                            }}
                            align="center"
                            justify="center"
                            bg="brand.600"
                            borderRadius="lg"
                            flexShrink={0}
                        >
                            <Icon
                                as={CameraIcon}
                                boxSize={{
                                    base: 4,
                                    sm: 5,
                                }}
                                color="white"
                            />
                        </Flex>

                        <Box minW={0}>
                            <Text
                                fontSize={{
                                    base: "xs",
                                    sm: "sm",
                                }}
                                fontWeight="800"
                                lineHeight="1.2"
                                noOfLines={1}
                            >
                                Vehicle Gallery
                            </Text>

                            <Text
                                fontSize="xs"
                                fontWeight="400"
                                color="gray.300"
                                mt={0.5}
                                noOfLines={1}
                            >
                                {vehicle.brand?.brand ?? ""}{" "}
                                {vehicle.model?.model ?? ""}{" "}
                                {vehicle.variant?.variant ?? ""}
                            </Text>
                        </Box>
                    </Flex>
                </ModalHeader>

                <ModalCloseButton
                    color="white"
                    top={{
                        base: 1,
                        sm: 2,
                    }}
                    right={{
                        base: 1,
                        sm: 2,
                    }}
                    borderRadius="lg"
                    size="sm"
                    _hover={{
                        bg: "dark.600",
                    }}
                    _active={{
                        bg: "dark.700",
                    }}
                />

                {/* Body */}

                <ModalBody
                    bg="gray.50"
                    p={{
                        base: 2,
                        sm: 3,
                        md: 4,
                    }}
                >
                    {/* Main Image */}

                    <Box
                        position="relative"
                        bg="dark.300"
                        borderRadius="lg"
                        overflow="hidden"
                    >
                        <Flex
                            h={{
                                base: "180px",
                                sm: "300px",
                                md: "380px",
                            }}
                            align="center"
                            justify="center"
                            position="relative"
                        >
                            <Image
                                src={currentImage}
                                alt={`${vehicle.brand?.brand ?? ""} ${vehicle.model?.model ?? ""
                                    }`}
                                w="100%"
                                h="100%"
                                objectFit="contain"
                                userSelect="none"
                            />

                            {/* Previous Button */}

                            {images.length > 1 && (
                                <IconButton
                                    aria-label="Previous image"
                                    icon={
                                        <Icon
                                            as={ChevronLeftIcon}
                                            boxSize={{
                                                base: 5,
                                                sm: 6,
                                            }}
                                        />
                                    }
                                    position="absolute"
                                    left={{
                                        base: 1,
                                        sm: 2,
                                        md: 3,
                                    }}
                                    top="50%"
                                    transform="translateY(-50%)"
                                    size={{
                                        base: "xs",
                                        sm: "sm",
                                    }}
                                    borderRadius="lg"
                                    bg="blackAlpha.600"
                                    color="white"
                                    border="1px solid"
                                    borderColor="whiteAlpha.300"
                                    _hover={{
                                        bg: "brand.600",
                                        borderColor: "brand.500",
                                    }}
                                    _active={{
                                        bg: "brand.700",
                                    }}
                                    onClick={previousImage}
                                />
                            )}

                            {/* Next Button */}

                            {images.length > 1 && (
                                <IconButton
                                    aria-label="Next image"
                                    icon={
                                        <Icon
                                            as={ChevronRightIcon}
                                            boxSize={{
                                                base: 5,
                                                sm: 6,
                                            }}
                                        />
                                    }
                                    position="absolute"
                                    right={{
                                        base: 1,
                                        sm: 2,
                                        md: 3,
                                    }}
                                    top="50%"
                                    transform="translateY(-50%)"
                                    size={{
                                        base: "xs",
                                        sm: "sm",
                                    }}
                                    borderRadius="lg"
                                    bg="blackAlpha.600"
                                    color="white"
                                    border="1px solid"
                                    borderColor="whiteAlpha.300"
                                    _hover={{
                                        bg: "brand.600",
                                        borderColor: "brand.500",
                                    }}
                                    _active={{
                                        bg: "brand.700",
                                    }}
                                    onClick={nextImage}
                                />
                            )}

                            {/* Image Counter */}

                            <Box
                                position="absolute"
                                bottom={{
                                    base: 1,
                                    sm: 2,
                                }}
                                left="50%"
                                transform="translateX(-50%)"
                                bg="blackAlpha.700"
                                color="white"
                                px={{
                                    base: 1.5,
                                    sm: 2.5,
                                }}
                                py={{
                                    base: 0.5,
                                    sm: 1,
                                }}
                                borderRadius="full"
                                border="1px solid"
                                borderColor="whiteAlpha.300"
                            >
                                <Flex align="center" gap={1}>
                                    <Icon
                                        as={PhotoIcon}
                                        boxSize={{
                                            base: 3.5,
                                            sm: 5,
                                        }}
                                        color="brand.200"
                                    />

                                    <Text
                                        fontSize={{
                                            base: "10px",
                                            sm: "xs",
                                        }}
                                        fontWeight="700"
                                    >
                                        {images.length
                                            ? `${selectedIndex + 1} / ${images.length}`
                                            : "No Images"}
                                    </Text>
                                </Flex>
                            </Box>
                        </Flex>
                    </Box>

                    {/* Gallery Information */}

                    <Flex
                        align="center"
                        justify="space-between"
                        mt={{
                            base: 2,
                            sm: 3,
                        }}
                        mb={2}
                        gap={2}
                    >
                        <Flex
                            align="center"
                            gap={{
                                base: 1,
                                sm: 1.5,
                            }}
                            minW={0}
                        >
                            <Icon
                                as={PhotoIcon}
                                boxSize={{
                                    base: 3.5,
                                    sm: 4,
                                }}
                                color="brand.500"
                                flexShrink={0}
                            />

                            <Text
                                fontSize={{
                                    base: "xs",
                                    sm: "sm",
                                }}
                                fontWeight="700"
                                color="dark.800"
                                noOfLines={1}
                            >
                                Vehicle Photos
                            </Text>
                        </Flex>

                        <Text
                            fontSize="xs"
                            color="gray.500"
                            fontWeight="600"
                            flexShrink={0}
                        >
                            {images.length
                                ? `${images.length} ${images.length === 1
                                    ? "photo"
                                    : "photos"
                                }`
                                : "No photos available"}
                        </Text>
                    </Flex>

                    {/* Thumbnails */}

                    {images.length > 0 && (
                        <Grid
                            templateColumns={{
                                base: "repeat(3, 1fr)",
                                sm: "repeat(5, 1fr)",
                                md: "repeat(6, 1fr)",
                            }}
                            gap={{
                                base: 1,
                                sm: 2,
                                md: 2.5,
                            }}
                        >
                            {images.map((image, index) => {
                                const isSelected =
                                    selectedIndex === index;

                                return (
                                    <Box
                                        key={image.id}
                                        position="relative"
                                        borderRadius={{
                                            base: "md",
                                            sm: "lg",
                                        }}
                                        overflow="hidden"
                                        border="2px solid"
                                        borderColor={
                                            isSelected
                                                ? "brand.500"
                                                : "gray.200"
                                        }
                                        bg="white"
                                        cursor="pointer"
                                        transition="all 0.2s ease"
                                        boxShadow={
                                            isSelected
                                                ? "sm"
                                                : "none"
                                        }
                                        _hover={{
                                            borderColor: "brand.400",
                                            transform:
                                                "translateY(-1px)",
                                            boxShadow: "sm",
                                        }}
                                        onClick={() =>
                                            setSelectedIndex(index)
                                        }
                                    >
                                        <Image
                                            src={`/storage/${image.image_path}`}
                                            alt={`Vehicle photo ${index + 1
                                                }`}
                                            w="100%"
                                            h={{
                                                base: "48px",
                                                sm: "70px",
                                                md: "75px",
                                            }}
                                            objectFit="cover"
                                        />

                                        {/* Selected Indicator */}
                                        {isSelected && (
                                            <Box
                                                position="absolute"
                                                top={{
                                                    base: 0.5,
                                                    sm: 1,
                                                }}
                                                right={{
                                                    base: 0.5,
                                                    sm: 1,
                                                }}
                                                w={{
                                                    base: "14px",
                                                    sm: "18px",
                                                }}
                                                h={{
                                                    base: "14px",
                                                    sm: "18px",
                                                }}
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                bg="brand.500"
                                                borderRadius="full"
                                                border="2px solid"
                                                borderColor="white"
                                            >
                                                <Box
                                                    w={{
                                                        base: "3px",
                                                        sm: "4px",
                                                    }}
                                                    h={{
                                                        base: "3px",
                                                        sm: "4px",
                                                    }}
                                                    bg="white"
                                                    borderRadius="full"
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}
                        </Grid>
                    )}

                    {/* No Images */}

                    {images.length === 0 && (
                        <Flex
                            direction="column"
                            align="center"
                            justify="center"
                            py={{
                                base: 5,
                                sm: 6,
                            }}
                            color="gray.500"
                        >
                            <Flex
                                w="40px"
                                h="40px"
                                align="center"
                                justify="center"
                                bg="gray.100"
                                borderRadius="lg"
                                mb={2}
                            >
                                <Icon
                                    as={PhotoIcon}
                                    boxSize={5}
                                    color="gray.400"
                                />
                            </Flex>

                            <Text
                                fontSize="sm"
                                fontWeight="600"
                                textAlign="center"
                            >
                                No vehicle photos available
                            </Text>
                        </Flex>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
