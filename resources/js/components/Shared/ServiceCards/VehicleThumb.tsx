import { Flex, Icon, Image } from "@chakra-ui/react";
import { TruckIcon } from "@heroicons/react/24/outline";

interface Props {
    images?: { image_path?: string | null }[] | null;
    alt?: string;
    size?: string;
}

export default function VehicleThumb({ images, alt, size = "56px" }: Props) {
    const path = images?.find((image) => image?.image_path)?.image_path;

    return (
        <Flex boxSize={size} borderRadius="lg" overflow="hidden" bg="gray.100" color="gray.400" align="center" justify="center" flexShrink={0} border="1px solid" borderColor="gray.200">
            {path ? (
                <Image src={`/storage/${path}`} alt={alt || "Vehicle"} w="full" h="full" objectFit="cover" fallback={<Icon as={TruckIcon} boxSize={6} />} />
            ) : (
                <Icon as={TruckIcon} boxSize={6} />
            )}
        </Flex>
    );
}
