import { Box, Flex, HStack, Image } from "@chakra-ui/react";

export default function PhotoStrip({ urls, max = 4, size = "52px" }: { urls: string[]; max?: number; size?: string }) {
    if (urls.length === 0) return null;

    return (
        <HStack spacing={2}>
            {urls.slice(0, max).map((url, index) => (
                <Box key={url} position="relative" boxSize={size} borderRadius="md" overflow="hidden" border="1px" borderColor="gray.200" flexShrink={0}>
                    <Image src={url} alt="Photo" w="100%" h="100%" objectFit="cover" />
                    {index === max - 1 && urls.length > max && (
                        <Flex position="absolute" inset={0} bg="blackAlpha.600" color="white" align="center" justify="center" fontSize="xs" fontWeight="700">
                            +{urls.length - max}
                        </Flex>
                    )}
                </Box>
            ))}
        </HStack>
    );
}
