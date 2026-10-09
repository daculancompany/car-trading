import { useEffect, useState } from "react";
import axios from "axios";

import {
    Box,
    Button,
    HStack,
    Image,
    Input,
    SimpleGrid,
    Text,
    VStack,
    useToast,
} from "@chakra-ui/react";

import {
    getVehicle,
    type Vehicle,
} from "../../../../api/VehicleManagement/vehicleApi";

import {
    deleteVehicleImage,
    updateVehicleImage,
    uploadVehicleImages,
    type VehicleImage,
} from "../../../../api/VehicleManagement/imageApi";

interface UpdateVehicleImagesProps {
    vehicle: Vehicle;
    onReload: () => Promise<void> | void;
    onClose: () => void;
}

const STORAGE_URL = "/storage";

export default function UpdateVehicleImages({
    vehicle,
    onReload,
}: UpdateVehicleImagesProps) {
    const toast = useToast();

    const [images, setImages] = useState<VehicleImage[]>(
        vehicle.images ?? []
    );

    const [replaceFiles, setReplaceFiles] = useState<
        Record<number, File>
    >({});

    const [newFiles, setNewFiles] = useState<File[]>([]);

    const [loadingImageId, setLoadingImageId] = useState<number | null>(
        null
    );

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setImages(vehicle.images ?? []);
        setReplaceFiles({});
        setNewFiles([]);
    }, [vehicle]);

    // Refresh images

    const refreshImages = async () => {
        try {
            const response = await getVehicle(vehicle.id);

            // getVehicle() already returns Vehicle
            setImages(response.images ?? []);
        } catch (error) {
            console.error(error);
        }
    };

    // Replace image

    const handleReplace = async (imageId: number) => {
        const file = replaceFiles[imageId];

        if (!file) {
            return;
        }

        setLoadingImageId(imageId);

        try {
            await updateVehicleImage(imageId, {
                image: file,
            });

            await refreshImages();
            await onReload();

            setReplaceFiles((prev) => {
                const copy = { ...prev };

                delete copy[imageId];

                return copy;
            });

            toast({
                title: "Success",
                description: "Image replaced successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
        } catch (error) {
            console.error(error);

            if (axios.isAxiosError(error)) {
                toast({
                    title: "Replace Failed",
                    description:
                        error.response?.data?.message ??
                        "Unable to replace image.",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                    position: "top-right",
                });
            } else {
                toast({
                    title: "Replace Failed",
                    description: "An unexpected error occurred.",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                    position: "top-right",
                });
            }
        } finally {
            setLoadingImageId(null);
        }
    };

    // Add new images

    const handleSelectNewFiles = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = e.target.files;

        if (!files || files.length === 0) {
            return;
        }

        // snapshot before clearing, since FileList is a live reference
        const selectedFiles = Array.from(files);

        setNewFiles((prev) => [...prev, ...selectedFiles]);

        e.target.value = "";
    };

    const handleRemoveNewFile = (index: number) => {
        setNewFiles((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    const handleUploadNewFiles = async () => {
        if (newFiles.length === 0) {
            return;
        }

        setUploading(true);

        try {
            await uploadVehicleImages({
                vehicle_id: vehicle.id,
                images: newFiles,
            });

            await refreshImages();
            await onReload();

            setNewFiles([]);

            toast({
                title: "Success",
                description: "Image(s) added successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
        } catch (error) {
            console.error(error);

            if (axios.isAxiosError(error)) {
                toast({
                    title: "Upload Failed",
                    description:
                        error.response?.data?.message ??
                        "Unable to add image(s).",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                    position: "top-right",
                });
            } else {
                toast({
                    title: "Upload Failed",
                    description: "An unexpected error occurred.",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                    position: "top-right",
                });
            }
        } finally {
            setUploading(false);
        }
    };

    // Delete image

    const handleDelete = async (imageId: number) => {
        if (!window.confirm("Delete this image?")) {
            return;
        }

        try {
            await deleteVehicleImage(imageId);

            await refreshImages();
            await onReload();

            toast({
                title: "Deleted",
                description: "Image deleted successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            });
        } catch (error) {
            console.error(error);

            if (axios.isAxiosError(error)) {
                toast({
                    title: "Delete Failed",
                    description:
                        error.response?.data?.message ??
                        "Unable to delete image.",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                    position: "top-right",
                });
            } else {
                toast({
                    title: "Delete Failed",
                    description: "An unexpected error occurred.",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                    position: "top-right",
                });
            }
        }
    };

    // UI

    return (
        <VStack spacing={6} align="stretch">
            <Box
                borderWidth="1px"
                rounded="md"
                p={4}
            >
                <Text mb={4} fontWeight="bold">
                    Add Images
                </Text>

                <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSelectNewFiles}
                />

                {newFiles.length > 0 && (
                    <SimpleGrid
                        columns={{ base: 2, md: 4 }}
                        spacing={4}
                        mt={4}
                    >
                        {newFiles.map((file, index) => (
                            <Box
                                key={`${file.name}-${index}`}
                                borderWidth="1px"
                                rounded="md"
                                p={2}
                            >
                                <Image
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    h="100px"
                                    w="100%"
                                    objectFit="cover"
                                    rounded="md"
                                    mb={2}
                                />

                                <Button
                                    w="100%"
                                    size="xs"
                                    colorScheme="red"
                                    variant="outline"
                                    onClick={() =>
                                        handleRemoveNewFile(index)
                                    }
                                >
                                    Remove
                                </Button>
                            </Box>
                        ))}
                    </SimpleGrid>
                )}

                <Button
                    mt={4}
                    colorScheme="brand"
                    size="sm"
                    isDisabled={newFiles.length === 0}
                    isLoading={uploading}
                    onClick={handleUploadNewFiles}
                >
                    Save
                </Button>
            </Box>

            <Box>
                <Text mb={4} fontWeight="bold">
                    Vehicle Images
                </Text>

                {images.length > 0 ? (
                    <SimpleGrid
                        columns={{ base: 1, md: 3 }}
                        spacing={5}
                    >
                        {images.map((image) => (
                            <Box
                                key={image.id}
                                borderWidth="1px"
                                rounded="md"
                                p={3}
                            >
                                <Image
                                    src={`${STORAGE_URL}/${image.image_path}`}
                                    alt="Vehicle"
                                    h="180px"
                                    w="100%"
                                    objectFit="cover"
                                    rounded="md"
                                    mb={3}
                                />

                                {replaceFiles[image.id] && (
                                    <Box mb={3}>
                                        <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            mb={1}
                                        >
                                            New photo selected:
                                        </Text>

                                        <Image
                                            src={URL.createObjectURL(
                                                replaceFiles[image.id]
                                            )}
                                            alt="Selected replacement"
                                            h="120px"
                                            w="100%"
                                            objectFit="cover"
                                            rounded="md"
                                            borderWidth="2px"
                                            borderColor="blue.300"
                                        />
                                    </Box>
                                )}

                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file =
                                            e.target.files?.[0];

                                        if (!file) {
                                            return;
                                        }

                                        setReplaceFiles((prev) => ({
                                            ...prev,
                                            [image.id]: file,
                                        }));
                                    }}
                                />

                                <HStack mt={3}>
                                    <Button
                                        flex={1}
                                        size="sm"
                                        colorScheme="blue"
                                        isDisabled={
                                            !replaceFiles[image.id]
                                        }
                                        isLoading={
                                            loadingImageId === image.id
                                        }
                                        onClick={() =>
                                            handleReplace(image.id)
                                        }
                                    >
                                        Replace
                                    </Button>

                                    <Button
                                        flex={1}
                                        size="sm"
                                        colorScheme="red"
                                        onClick={() =>
                                            handleDelete(image.id)
                                        }
                                    >
                                        Delete
                                    </Button>
                                </HStack>
                            </Box>
                        ))}
                    </SimpleGrid>
                ) : (
                    <Box
                        borderWidth="1px"
                        borderStyle="dashed"
                        rounded="md"
                        p={6}
                        textAlign="center"
                    >
                        <Text color="gray.500">
                            No vehicle images available.
                        </Text>
                    </Box>
                )}
            </Box>
        </VStack>
    );
}