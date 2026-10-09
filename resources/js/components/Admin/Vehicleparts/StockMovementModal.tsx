import {
    Badge,
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
    Radio,
    RadioGroup,
    Select,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    useToast,
} from "@chakra-ui/react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    createStockMovement,
    stockMovementType,
    type StockMovementType,
} from "../../../api/PartManagement/stockMovementApi";
import type { VehiclePart } from "../../../api/PartManagement/vehiclePartsApi";
import { getJobOrders, type JobOrder } from "../../../api/JobOrderManagement/jobOrderApi";

interface StockMovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    parts: VehiclePart[];
    part?: VehiclePart | null;
    defaultType?: StockMovementType;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const today = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
};

export default function StockMovementModal({
    isOpen,
    onClose,
    onSuccess,
    parts,
    part,
    defaultType = "receiving",
}: StockMovementModalProps) {
    const toast = useToast();

    const [partId, setPartId] = useState("");
    const [type, setType] = useState<StockMovementType>(defaultType);
    const [quantity, setQuantity] = useState(1);
    const [unitCost, setUnitCost] = useState(0);
    const [referenceKind, setReferenceKind] = useState<"manual" | "job_order">("manual");
    const [jobOrderId, setJobOrderId] = useState("");
    const [referenceNo, setReferenceNo] = useState("");
    const [remarks, setRemarks] = useState("");
    const [movedAt, setMovedAt] = useState(today());
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setPartId(part ? String(part.id) : "");
        setType(stockMovementType(defaultType).incoming ? "receiving" : "damage");
        setQuantity(1);
        setUnitCost(Number(part?.unit_price ?? 0));
        setReferenceKind("manual");
        setJobOrderId("");
        setReferenceNo("");
        setRemarks("");
        setMovedAt(today());
        setImage(null);
        setPreview(null);

        getJobOrders()
            .then((data) => setJobOrders(data.filter((jobOrder) => !jobOrder.archived)))
            .catch(() => setJobOrders([]));
    }, [isOpen, part, defaultType]);

    const selectedPart = useMemo(
        () => parts.find((item) => String(item.id) === partId) ?? part ?? null,
        [parts, part, partId]
    );

    const typeInfo = stockMovementType(type);
    const current = selectedPart?.quantity ?? 0;
    const newQuantity = typeInfo.incoming ? current + quantity : current - quantity;
    const amount = quantity * unitCost;

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleImage = (file?: File) => {
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "Photo must be 5MB or smaller.", status: "warning", duration: 3000 });
            return;
        }

        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const clearImage = () => {
        setImage(null);
        setPreview(null);
        if (fileInput.current) fileInput.current.value = "";
    };

    const handlePartChange = (value: string) => {
        setPartId(value);
        const next = parts.find((item) => String(item.id) === value);
        if (next) setUnitCost(Number(next.unit_price));
    };

    const handleClose = () => {
        if (!isSubmitting) onClose();
    };

    const handleSubmit = async () => {
        if (!selectedPart) {
            toast({ title: "Select a part.", status: "warning", duration: 3000 });
            return;
        }

        if (quantity < 1) {
            toast({ title: "Quantity must be at least 1.", status: "warning", duration: 3000 });
            return;
        }

        if (newQuantity < 0) {
            toast({
                title: "Not enough stock.",
                description: `Only ${current} on hand.`,
                status: "warning",
                duration: 3000,
            });
            return;
        }

        if (!typeInfo.incoming && !remarks.trim()) {
            toast({ title: "Describe the damage.", status: "warning", duration: 3000 });
            return;
        }

        if (referenceKind === "job_order" && !jobOrderId) {
            toast({ title: "Select a job order.", status: "warning", duration: 3000 });
            return;
        }

        try {
            setIsSubmitting(true);

            await createStockMovement({
                vehicle_part_id: selectedPart.id,
                type,
                quantity,
                unit_cost: unitCost,
                job_order_id: referenceKind === "job_order" ? Number(jobOrderId) : null,
                reference_no: referenceKind === "manual" ? referenceNo.trim() : undefined,
                remarks: remarks.trim() || undefined,
                moved_at: movedAt,
                image: typeInfo.incoming ? null : image,
            });

            toast({
                title: `${typeInfo.incoming ? "Stock in" : "Stock out"} recorded.`,
                description: `${selectedPart.part_name}: ${current} → ${newQuantity}`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            onClose();
            onSuccess();
        } catch (error: any) {
            console.error("Failed to record stock movement:", error);

            toast({
                title: "Failed to record stock movement.",
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
                <ModalHeader>Stock Movement</ModalHeader>

                <ModalCloseButton isDisabled={isSubmitting} />

                <ModalBody>

                    <FormControl mb={4} isRequired>
                        <FormLabel>Type</FormLabel>

                        <SimpleGrid columns={2} spacing={2}>
                            <Button
                                colorScheme="green"
                                variant={typeInfo.incoming ? "solid" : "outline"}
                                onClick={() => setType("receiving")}
                            >
                                Stock In
                            </Button>

                            <Button
                                colorScheme="red"
                                variant={typeInfo.incoming ? "outline" : "solid"}
                                onClick={() => setType("damage")}
                            >
                                Stock Out
                            </Button>
                        </SimpleGrid>

                        <Text fontSize="xs" color="gray.500" mt={2}>
                            {typeInfo.incoming
                                ? "Receiving: new stock from a supplier or delivery. Adds to the quantity on hand."
                                : "Damaged or lost parts. Deducts from the quantity on hand."}
                        </Text>

                        {!typeInfo.incoming && (
                            <Text fontSize="xs" color="purple.600" mt={1}>
                                Parts used in a job order are deducted automatically when you add them in the job order details.
                            </Text>
                        )}
                    </FormControl>

                    <FormControl mb={4} isRequired>
                        <FormLabel>Part</FormLabel>

                        <Select
                            placeholder="Select part"
                            value={partId}
                            onChange={(e) => handlePartChange(e.target.value)}
                        >
                            {parts.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.part_name} ({item.quantity} on hand)
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={4}>
                        <FormControl isRequired>
                            <FormLabel>Quantity</FormLabel>

                            <NumberInput
                                min={1}
                                value={quantity}
                                onChange={(_, value) => setQuantity(Number.isNaN(value) ? 0 : value)}
                            >
                                <NumberInputField />
                            </NumberInput>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Unit Cost</FormLabel>

                            <NumberInput
                                min={0}
                                precision={2}
                                value={unitCost}
                                onChange={(_, value) => setUnitCost(Number.isNaN(value) ? 0 : value)}
                            >
                                <NumberInputField />
                            </NumberInput>
                        </FormControl>
                    </SimpleGrid>

                    <Box bg="gray.50" border="1px" borderColor="gray.100" borderRadius="md" px={4} py={3} mb={4}>
                        <Flex justify="space-between" fontSize="sm">
                            <Text color="gray.600">Amount</Text>
                            <Text fontWeight="semibold">{formatCurrency(amount)}</Text>
                        </Flex>

                        <Flex justify="space-between" fontSize="sm" mt={1} align="center">
                            <Text color="gray.600">Quantity on hand</Text>
                            <Flex gap={2} align="center">
                                <Text>{current}</Text>
                                <Text color="gray.400">→</Text>
                                <Badge colorScheme={newQuantity < 0 ? "red" : typeInfo.color}>
                                    {newQuantity}
                                </Badge>
                            </Flex>
                        </Flex>
                    </Box>

                    <FormControl mb={4}>
                        <FormLabel>Reference</FormLabel>

                        <RadioGroup
                            value={referenceKind}
                            onChange={(value) => setReferenceKind(value as "manual" | "job_order")}
                            mb={2}
                        >
                            <Stack direction="row" spacing={5}>
                                <Radio value="manual">Reference No.</Radio>
                                <Radio value="job_order">Job Order</Radio>
                            </Stack>
                        </RadioGroup>

                        {referenceKind === "job_order" ? (
                            <Select
                                placeholder="Select job order"
                                value={jobOrderId}
                                onChange={(e) => setJobOrderId(e.target.value)}
                            >
                                {jobOrders.map((jobOrder) => (
                                    <option key={jobOrder.id} value={jobOrder.id}>
                                        {jobOrder.job_order_no}
                                    </option>
                                ))}
                            </Select>
                        ) : (
                            <Input
                                placeholder="e.g. DR-0001, supplier invoice no."
                                value={referenceNo}
                                onChange={(e) => setReferenceNo(e.target.value)}
                            />
                        )}
                    </FormControl>

                    <FormControl mb={4}>
                        <FormLabel>Date</FormLabel>
                        <Input type="datetime-local" value={movedAt} onChange={(e) => setMovedAt(e.target.value)} />
                    </FormControl>

                    <FormControl isRequired={!typeInfo.incoming}>
                        <FormLabel>{typeInfo.incoming ? "Remarks" : "Damage Description"}</FormLabel>
                        <Textarea
                            rows={typeInfo.incoming ? 2 : 3}
                            placeholder={
                                typeInfo.incoming
                                    ? "Optional"
                                    : "What happened to the part? e.g. cracked during installation"
                            }
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </FormControl>

                    {!typeInfo.incoming && (
                        <FormControl mt={4}>
                            <FormLabel>Damage Photo</FormLabel>

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
                                        <Image src={preview} alt="Damage" w="100%" h="100%" objectFit="cover" />
                                    ) : (
                                        <PhotoIcon width={32} height={32} color="#A0AEC0" />
                                    )}
                                </Box>

                                <Flex gap={2} wrap="wrap">
                                    <Button size="sm" variant="outline" onClick={() => fileInput.current?.click()}>
                                        {preview ? "Change Photo" : "Upload Photo"}
                                    </Button>

                                    {preview && (
                                        <Button size="sm" variant="ghost" colorScheme="red" onClick={clearImage}>
                                            Remove
                                        </Button>
                                    )}
                                </Flex>

                                <input
                                    ref={fileInput}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    hidden
                                    onChange={(e) => handleImage(e.target.files?.[0])}
                                />
                            </Flex>

                            <FormHelperText fontSize="xs">JPG, PNG or WEBP, up to 5MB.</FormHelperText>
                        </FormControl>
                    )}
                </ModalBody>

                <ModalFooter gap={3}>
                    <Button variant="ghost" onClick={handleClose} isDisabled={isSubmitting}>
                        Cancel
                    </Button>

                    <Button
                        colorScheme={typeInfo.color}
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        loadingText="Saving..."
                    >
                        {typeInfo.incoming ? "Record Stock In" : "Record Stock Out"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
