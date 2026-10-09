import { Badge, Icon, Input, InputGroup, InputLeftElement, InputRightElement, type InputProps } from "@chakra-ui/react";
import { ClockIcon } from "@heroicons/react/24/outline";

interface Props extends Omit<InputProps, "value" | "onChange"> {
    value: number | null;
    onChange: (value: number | null) => void;
}

export default function OdometerInput({ value, onChange, size = "md", ...props }: Props) {
    const small = size === "sm";

    return (
        <InputGroup size={size}>
            <InputLeftElement pointerEvents="none" color="gray.400">
                <Icon as={ClockIcon} boxSize={small ? 4 : 5} />
            </InputLeftElement>
            <Input
                inputMode="numeric"
                placeholder="e.g. 45,210"
                value={value == null ? "" : value.toLocaleString("en-PH")}
                onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "").slice(0, 7);
                    onChange(digits ? Number(digits) : null);
                }}
                fontWeight="600"
                letterSpacing="0.02em"
                pr={small ? "3rem" : "3.5rem"}
                {...props}
            />
            <InputRightElement pointerEvents="none" w={small ? "3rem" : "3.5rem"}>
                <Badge colorScheme="gray" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize={small ? "2xs" : "xs"} textTransform="none">
                    km
                </Badge>
            </InputRightElement>
        </InputGroup>
    );
}
