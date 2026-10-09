import { Avatar, Box, Flex, Text, type AvatarProps } from "@chakra-ui/react";
import { customerFullName, type CustomerLike } from "./customerName";
import { useDetails } from "../Details/detailsContext";
import HoverArrow from "../Details/HoverArrow";

interface CustomerAvatarProps {
    customer?: CustomerLike | null;
    size?: AvatarProps["size"];
    withName?: boolean;
    name?: string;
    subtitle?: string | null;
}

export default function CustomerAvatar({
    customer,
    size = "sm",
    withName = false,
    name,
    subtitle,
}: CustomerAvatarProps) {
    const details = useDetails();
    const displayName = name ?? (customerFullName(customer) || "Customer");
    const clickable = Boolean(details && customer?.id);

    const avatar = (
        <Avatar
            size={size}
            name={displayName}
            src={customer?.image_url ?? undefined}
            bg="brand.500"
            color="white"
            flexShrink={0}
        />
    );

    const open = (event: React.SyntheticEvent) => {
        event.stopPropagation();
        if (details && customer?.id) details.open("customer", customer.id);
    };

    return (
        <Flex
            align="center"
            gap={2.5}
            minW={0}
            role="group"
            {...(clickable && {
                cursor: "pointer",
                tabIndex: 0,
                _focusVisible: { outline: "2px solid", outlineColor: "brand.300", borderRadius: "md" },
                "aria-label": `View ${displayName}`,
                title: "View customer details",
                onClick: open,
                onKeyDown: (event: React.KeyboardEvent) => {
                    if (event.key === "Enter" || event.key === " ") open(event);
                },
            })}
        >
            {avatar}

            {withName && (
                <Box minW={0}>
                    <Flex align="center" minW={0}>
                        <Text
                            fontSize="sm"
                            fontWeight="600"
                            color="gray.800"
                            noOfLines={1}
                            _groupHover={
                                clickable
                                    ? { color: "brand.600", textDecoration: "underline", textUnderlineOffset: "3px" }
                                    : undefined
                            }
                        >
                            {displayName}
                        </Text>
                        {clickable && <HoverArrow />}
                    </Flex>
                    {subtitle && (
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                            {subtitle}
                        </Text>
                    )}
                </Box>
            )}
        </Flex>
    );
}
