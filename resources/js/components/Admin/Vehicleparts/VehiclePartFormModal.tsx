import {
    Box,
    Button,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    NumberInput,
    NumberInputField,
    Select,
    SimpleGrid,
    Text,
    useToast,
} from "@chakra-ui/react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import {
    createVehiclePart,
    updateVehiclePart,
    type VehiclePart,
} from "../../../api/PartManagement/vehiclePartsApi";

const PART_CATEGORIES = [
    "Engine",
    "Brake",
    "Suspension",
    "Electrical",
    "Transmission",
    "Body",
    "Tires",
    "Fluids",
    "Other",
];

interface VehiclePartFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    part?: VehiclePart | null;
}

const emptyForm = {
    part_name: "",
    category: "",
    quantity: 0,
    unit_price: 0,
    reference_no: "",
};

export default function VehiclePartFormModal({
    isOpen,
    onClose,
    onSuccess,
    part,
}: VehiclePartFormModalProps) {
    const toast = useToast();
    const fileInput = useRef<HTMLInputElement>(null);
    const isEdit = Boolean(part);

    const [form, setForm] = useState(emptyForm);
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setForm(
            part
                ? {
                    part_name: part.part_name,
                    category: part.category,
                    quantity: Number(part.quantity),
                    unit_price: Number(part.unit_price),
                    reference_no: "",
                }
                : emptyForm
        );
        setImage(null);
        setPreview(part?.image_url ?? null);
        setRemoveImage(false);
    }, [isOpen, part]);

    useEffect(() => {
        return () => {
            if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleChange = (field: keyof typeof emptyForm, value: string | number) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleImage = (file?: File) => {
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "Image must be 5MB or smaller.", status: "warning", duration: 3000 });
            return;
        }

        setImage(file);
        setPreview(URL.createObjectURL(file));
        setRemoveImage(false);
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreview(null);
        setRemoveImage(Boolean(part?.image_url));
        if (fileInput.current) fileInput.current.value = "";
    };

    const handleClose = () => {
        if (!isSubmitting) onClose();
    };

    const handleSubmit = async () => {
        if (!form.part_name.trim()) {
            toast({ title: "Part name is required.", status: "warning", duration: 3000 });
            return;
        }

        if (!form.category) {
            toast({ title: "Category is required.", status: "warning", duration: 3000 });
            return;
        }

        if (form.quantity < 0 || form.unit_price < 0) {
            toast({ title: "Quantity and price cannot be negative.", status: "warning", duration: 3000 });
            return;
        }

        try {
            setIsSubmitting(true);

            const data = {
                part_name: form.part_name.trim(),
                category: form.category,
                unit_price: Number(form.unit_price),
                image,
            };

            if (part) {
                await updateVehiclePart(part.id, { ...data, remove_image: removeImage });
            } else {
                await createVehiclePart({
                    ...data,
                    quantity: Number(form.quantity),
                    reference_no: form.reference_no.trim(),
                });
            }

            toast({
                title: part ? "Vehicle part updated." : "Vehicle part added.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            onClose();
            onSuccess();
        } catch (error: any) {
            console.error("Failed to save vehicle part:", error);

            toast({
                title: "Failed to save vehicle part.",
                description:
                    error?.response?.data?.message ||
                    "Something went wrong. Please try again.",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg" scrollBehavior="inside">
            <ModalOverlay />

            <ModalContent>
                <ModalHeader>{isEdit ? "Edit Vehicle Part" : "Add Vehicle Part"}</ModalHeader>

                <ModalCloseButton isDisabled={isSubmitting} />

                <ModalBody>

                    <FormControl mb={4}>
                        <FormLabel>Image</FormLabel>

                        <Flex gap={4} align="center">
                            <Box
                                w="96px"
                                h="96px"
                                flexShrink={0}
                                borderRadius="md"
                                border="1px dashed"
                                borderColor="gray.300"
                                bg="gray.50"
                                overflow="hidden"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                cursor="pointer"
                                onClick={() => fileInput.current?.click()}
                            >
                                {preview ? (
                                    <Image src={preview} alt="Part" w="100%" h="100%" objectFit="cover" />
                                ) : (
                                    <PhotoIcon width={32} height={32} color="#A0AEC0" />
                                )}
                            </Box>

                            <Box>
                                <Flex gap={2} wrap="wrap">
                                    <Button size="sm" variant="outline" onClick={() => fileInput.current?.click()}>
                                        {preview ? "Change Image" : "Upload Image"}
                                    </Button>

                                    {preview && (
                                        <Button size="sm" variant="ghost" colorScheme="red" onClick={handleRemoveImage}>
                                            Remove
                                        </Button>
                                    )}
                                </Flex>

                                <Text fontSize="xs" color="gray.500" mt={2}>
                                    JPG, PNG or WEBP, up to 5MB.
                                </Text>
                            </Box>

                            <input
                                ref={fileInput}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                hidden
                                onChange={(e) => handleImage(e.target.files?.[0])}
                            />
                        </Flex>
                    </FormControl>

                    <FormControl mb={4} isRequired>
                        <FormLabel>Part Name</FormLabel>

                        <Input
                            placeholder="Enter part name"
                            value={form.part_name}
                            onChange={(e) => handleChange("part_name", e.target.value)}
                        />
                    </FormControl>

                    <FormControl mb={4} isRequired>
                        <FormLabel>Category</FormLabel>

                        <Select
                            placeholder="Select category"
                            value={form.category}
                            onChange={(e) => handleChange("category", e.target.value)}
                        >
                            {PART_CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}

                            {form.category && !PART_CATEGORIES.includes(form.category) && (
                                <option value={form.category}>{form.category}</option>
                            )}
                        </Select>
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Unit Price</FormLabel>

                            <NumberInput
                                min={0}
                                precision={2}
                                value={form.unit_price}
                                onChange={(_, value) =>
                                    handleChange("unit_price", Number.isNaN(value) ? 0 : value)
                                }
                            >
                                <NumberInputField placeholder="Enter unit price" />
                            </NumberInput>
                        </FormControl>

                        {isEdit ? (
                            <FormControl>
                                <FormLabel>Quantity on Hand</FormLabel>
                                <Input value={form.quantity} isReadOnly bg="gray.50" />
                                <FormHelperText fontSize="xs">
                                    Use Stock In / Out to change the quantity.
                                </FormHelperText>
                            </FormControl>
                        ) : (
                            <FormControl>
                                <FormLabel>Opening Stock</FormLabel>

                                <NumberInput
                                    min={0}
                                    value={form.quantity}
                                    onChange={(_, value) =>
                                        handleChange("quantity", Number.isNaN(value) ? 0 : value)
                                    }
                                >
                                    <NumberInputField placeholder="0" />
                                </NumberInput>

                                <FormHelperText fontSize="xs">
                                    Recorded as Receiving in the ledger.
                                </FormHelperText>
                            </FormControl>
                        )}
                    </SimpleGrid>

                    {!isEdit && form.quantity > 0 && (
                        <FormControl mt={4}>
                            <FormLabel>Reference No.</FormLabel>
                            <Input
                                placeholder="e.g. DR-0001 or supplier invoice no."
                                value={form.reference_no}
                                onChange={(e) => handleChange("reference_no", e.target.value)}
                            />
                        </FormControl>
                    )}
                </ModalBody>

                <ModalFooter gap={3}>
                    <Button variant="ghost" onClick={handleClose} isDisabled={isSubmitting}>
                        Cancel
                    </Button>

                    <Button
                        colorScheme="brand"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        loadingText="Saving..."
                    >
                        {isEdit ? "Save Changes" : "Add Part"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
