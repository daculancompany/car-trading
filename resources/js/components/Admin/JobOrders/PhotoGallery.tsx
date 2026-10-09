import {
    Box,
    Flex,
    IconButton,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalOverlay,
    SimpleGrid,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export interface GalleryPhoto {
    url: string;
    caption?: string | null;
    tag?: string | null;
}

interface PhotoGalleryProps {
    photos: GalleryPhoto[];
    columns?: { base?: number; md?: number; lg?: number };
    size?: string;
}

export default function PhotoGallery({ photos, columns = { base: 3, md: 4, lg: 6 }, size = "90px" }: PhotoGalleryProps) {
    const viewer = useDisclosure();
    const [index, setIndex] = useState(0);

    if (photos.length === 0) return null;

    const current = photos[index];
    const go = (step: number) => setIndex((value) => (value + step + photos.length) % photos.length);

    return (
        <>
            <SimpleGrid columns={columns} spacing={2}>
                {photos.map((photo, photoIndex) => (
                    <Box
                        key={photo.url}
                        position="relative"
                        h={size}
                        borderRadius="md"
                        overflow="hidden"
                        border="1px"
                        borderColor="gray.200"
                        cursor="zoom-in"
                        role="group"
                        onClick={() => {
                            setIndex(photoIndex);
                            viewer.onOpen();
                        }}
                    >
                        <Image
                            src={photo.url}
                            alt={photo.caption ?? "Photo"}
                            w="100%"
                            h="100%"
                            objectFit="cover"
                            transition="transform 0.2s"
                            _groupHover={{ transform: "scale(1.05)" }}
                        />
                        {photo.tag && (
                            <Text
                                position="absolute"
                                top={1}
                                left={1}
                                fontSize="2xs"
                                fontWeight="700"
                                bg="blackAlpha.700"
                                color="white"
                                px={1.5}
                                py={0.5}
                                borderRadius="sm"
                                noOfLines={1}
                                maxW="90%"
                            >
                                {photo.tag}
                            </Text>
                        )}
                    </Box>
                ))}
            </SimpleGrid>

            <Modal isOpen={viewer.isOpen} onClose={viewer.onClose} size="4xl" isCentered>
                <ModalOverlay bg="blackAlpha.800" />
                <ModalContent bg="transparent" shadow="none">
                    <ModalCloseButton color="white" top={-10} right={0} />
                    <ModalBody p={0}>
                        <Flex align="center" gap={2}>
                            {photos.length > 1 && (
                                <IconButton
                                    aria-label="Previous photo"
                                    icon={<ChevronLeftIcon width={22} />}
                                    onClick={() => go(-1)}
                                    variant="ghost"
                                    color="white"
                                    _hover={{ bg: "whiteAlpha.200" }}
                                />
                            )}
                            <Box flex="1" textAlign="center">
                                <Image src={current?.url} alt={current?.caption ?? "Photo"} maxH="75vh" mx="auto" borderRadius="md" />
                                {(current?.tag || current?.caption) && (
                                    <Text color="white" mt={3} fontSize="sm">
                                        {current?.tag && <b>{current.tag}</b>}
                                        {current?.tag && current?.caption ? " · " : ""}
                                        {current?.caption}
                                    </Text>
                                )}
                                <Text color="whiteAlpha.700" fontSize="xs" mt={1}>
                                    {index + 1} / {photos.length}
                                </Text>
                            </Box>
                            {photos.length > 1 && (
                                <IconButton
                                    aria-label="Next photo"
                                    icon={<ChevronRightIcon width={22} />}
                                    onClick={() => go(1)}
                                    variant="ghost"
                                    color="white"
                                    _hover={{ bg: "whiteAlpha.200" }}
                                />
                            )}
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}
