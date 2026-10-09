import { Icon } from "@chakra-ui/react";
import { ArrowUpRightIcon } from "@heroicons/react/20/solid";

export default function HoverArrow() {
    return (
        <Icon
            as={ArrowUpRightIcon}
            boxSize={3.5}
            ml={0.5}
            flexShrink={0}
            color="brand.500"
            opacity={0}
            transform="translate(-2px, 2px)"
            transition="opacity 0.15s, transform 0.15s"
            _groupHover={{ opacity: 1, transform: "translate(0, 0)" }}
            _groupFocus={{ opacity: 1, transform: "translate(0, 0)" }}
            aria-hidden
        />
    );
}
