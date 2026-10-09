import { Text, type TextProps } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useDetails, type DetailsType } from "./detailsContext";
import HoverArrow from "./HoverArrow";

interface DetailsLinkProps extends Omit<TextProps, "id"> {
    type: DetailsType;
    id?: number | null;
    children: ReactNode;
}

const titles: Record<DetailsType, string> = {
    customer: "View customer details",
    vehicle: "View vehicle details",
    part: "View part details",
    jobOrder: "View job order details",
};

export default function DetailsLink({ type, id, children, ...textProps }: DetailsLinkProps) {
    const details = useDetails();

    if (!details || !id) {
        return (
            <Text as="span" {...textProps}>
                {children}
            </Text>
        );
    }

    return (
        <Text
            as="span"
            role="group"
            tabIndex={0}
            cursor="pointer"
            display="inline-flex"
            alignItems="center"
            title={titles[type]}
            aria-label={titles[type]}
            _hover={{ color: "brand.600", textDecoration: "underline", textUnderlineOffset: "3px" }}
            _focusVisible={{ outline: "2px solid", outlineColor: "brand.300", borderRadius: "sm" }}
            onClick={(event) => {
                event.stopPropagation();
                details.open(type, id);
            }}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    details.open(type, id);
                }
            }}
            {...textProps}
        >
            {children}
            <HoverArrow />
        </Text>
    );
}
