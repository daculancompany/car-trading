import {
    Avatar,
    Badge,
    Box,
    HStack,
    Icon,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Text,
    useToast,
} from "@chakra-ui/react";
import { ArrowRightOnRectangleIcon, ChevronDownIcon, Squares2X2Icon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMe, logout, type AuthUser } from "../../api/UserManagement/authApi";
import { clearAuth, getHomePath, getUser } from "../../utils/auth";
import { displayName, roleColor } from "./userDisplay";

interface Props {
    profilePath: string;
}

export default function UserMenu({ profilePath }: Props) {
    const navigate = useNavigate();
    const toast = useToast();
    const [user, setUser] = useState<AuthUser | null>(() => getUser());

    useEffect(() => {
        getMe().then(setUser).catch(() => undefined);
        const refresh = () => setUser(getUser());
        window.addEventListener("auth-user-updated", refresh);
        return () => window.removeEventListener("auth-user-updated", refresh);
    }, []);

    const name = displayName(user);
    const role = user?.role?.name ?? "";
    const photo = user?.customer?.image_url ?? undefined;
    const home = getHomePath(user);

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
            toast({ title: "Signed out on this device.", status: "info", duration: 2000 });
        }
        clearAuth();
        navigate("/login", { replace: true });
    };

    return (
        <Menu placement="bottom-end" autoSelect={false}>
            <MenuButton
                ml={1}
                pl={1}
                pr={2}
                py={1}
                borderRadius="full"
                transition="background 0.15s"
                _hover={{ bg: "gray.100" }}
                _active={{ bg: "gray.100" }}
                aria-label="Account menu"
            >
                <HStack spacing={2.5}>
                    <Avatar size="sm" name={name} src={photo} bg="brand.500" color="white" />
                    <Box display={{ base: "none", md: "block" }} textAlign="left" lineHeight="1.2">
                        <Text fontSize="sm" fontWeight="700" color="dark.900" maxW="160px" noOfLines={1}>
                            {name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            {role}
                        </Text>
                    </Box>
                    <Icon as={ChevronDownIcon} boxSize={4} color="gray.500" display={{ base: "none", md: "block" }} />
                </HStack>
            </MenuButton>

            <MenuList minW="270px" p={0} overflow="hidden" borderRadius="xl" boxShadow="xl" zIndex={30}>
                <Box px={4} py={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                    <HStack spacing={3}>
                        <Avatar size="md" name={name} src={photo} bg="brand.500" color="white" />
                        <Box minW={0}>
                            <Text fontWeight="800" color="dark.900" noOfLines={1}>
                                {name}
                            </Text>
                            <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                {user?.email}
                            </Text>
                            {role && (
                                <Badge mt={1.5} colorScheme={roleColor(role)} borderRadius="full" px={2} fontSize="2xs">
                                    {role}
                                </Badge>
                            )}
                        </Box>
                    </HStack>
                </Box>
                <Box py={1.5}>
                    <MenuItem icon={<Icon as={UserCircleIcon} boxSize={5} />} fontSize="sm" py={2.5} onClick={() => navigate(profilePath)}>
                        My profile
                    </MenuItem>
                    {home && (
                        <MenuItem icon={<Icon as={Squares2X2Icon} boxSize={5} />} fontSize="sm" py={2.5} onClick={() => navigate(home)}>
                            Dashboard
                        </MenuItem>
                    )}
                    <MenuDivider my={1.5} />
                    <MenuItem icon={<Icon as={ArrowRightOnRectangleIcon} boxSize={5} />} fontSize="sm" py={2.5} color="red.600" onClick={handleLogout}>
                        Log out
                    </MenuItem>
                </Box>
            </MenuList>
        </Menu>
    );
}
