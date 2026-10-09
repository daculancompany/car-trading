import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Icon,
    IconButton,
    Image,
    Input,
    InputGroup,
    InputRightElement,
    Link,
    Stack,
    Text,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import { login } from "../../api/UserManagement/authApi";
import Logo from "../../assets/logo/logo.jpg";
import { showErrorToast, showSuccessToast } from "../../utils/apiToast";
import { clearAuth, getHomePath, setAuth } from "../../utils/auth";
import { InstallAppButton } from "../../components/Shared/InstallApp";
import CustomerRegisterModal from "./CustomerRegister";
import { business } from "../../config/business";

// One login for customers, staff and admin; each lands on their own home page.
export default function LoginPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const register = useDisclosure();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Already logged in? Go straight to the right page.
    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem("user") ?? "null");
            const home = localStorage.getItem("token") ? getHomePath(user) : null;
            const next = new URLSearchParams(window.location.search).get("next");
            if (home) navigate(next && next.startsWith("/") ? next : home, { replace: true });
            else if (user) clearAuth();
        } catch {
            clearAuth();
        }
    }, [navigate]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Read from the form so browser autofill is picked up too.
        const form = new FormData(event.currentTarget);
        const loginValue = String(form.get("login") ?? "").trim();
        const password = String(form.get("password") ?? "");

        if (!loginValue || !password) {
            toast({ title: "Enter your username or email and password.", status: "warning", duration: 3000, position: "top" });
            return;
        }

        try {
            setLoading(true);
            const response = await login({ login: loginValue, password });
            setAuth(response.token, response.user);
            showSuccessToast(toast, "Welcome back", response.message || "Login successful.");
            const next = new URLSearchParams(window.location.search).get("next");
            navigate(next && next.startsWith("/") ? next : getHomePath(response.user) ?? "/browse-vehicles", { replace: true });
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) showErrorToast(toast, error, "Login failed.");
            else toast({ title: "Something went wrong.", status: "error", duration: 3000, position: "top" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex minH="100dvh" bg="white" direction={{ base: "column", lg: "row" }}>
            <Box
                position="relative"
                w={{ base: "full", lg: "55%" }}
                h={{ base: "220px", lg: "auto" }}
                minH={{ lg: "100dvh" }}
                bgImage="url('/images/login-car.jpg')"
                bgSize="cover"
                bgPosition="center"
                flexShrink={0}
            >
                <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(17,20,23,0.92) 0%, rgba(17,20,23,0.35) 55%, rgba(17,20,23,0.15) 100%)" />
                <Box position="absolute" top={0} left={0} right={0} h="160px" bgGradient="linear(to-b, rgba(17,20,23,0.7) 0%, rgba(17,20,23,0) 100%)" />
                <Flex position="relative" h="full" direction="column" justify="space-between" px={{ base: 5, lg: 12 }} pt={{ base: "calc(20px + env(safe-area-inset-top))", lg: 10 }} pb={{ base: 5, lg: 10 }} color="white">
                    <HStack spacing={3} cursor="pointer" onClick={() => navigate("/browse-vehicles")} w="fit-content">
                        <Image src={Logo} alt={business.shortName} h={{ base: "40px", lg: "48px" }} borderRadius="md" />
                        <Box display={{ base: "none", sm: "block" }}>
                            <Text fontWeight="800" color="white" lineHeight="1.2" letterSpacing="0.02em">
                                {business.name.toUpperCase()}
                            </Text>
                            <Text fontSize="xs" color="gray.300">
                                {business.area}
                            </Text>
                        </Box>
                    </HStack>

                    <Box display={{ base: "none", lg: "block" }} maxW="460px">
                        <Text fontSize="3xl" fontWeight="800" color="white" lineHeight="1.15">
                            Quality used cars and auto service in Cagayan de Oro.
                        </Text>
                        <Box mt={6} pt={5} borderTop="1px solid" borderColor="whiteAlpha.300" fontSize="sm" color="gray.200">
                            <Text>{business.address}</Text>
                            <Text mt={1}>
                                {business.phones.join(" | ")} · {business.hours}
                            </Text>
                        </Box>
                    </Box>
                </Flex>
            </Box>

            <Flex flex="1" align={{ base: "flex-start", lg: "center" }} justify="center" px={{ base: 5, sm: 8, lg: 14 }} py={{ base: 8, lg: 10 }} pb="calc(32px + env(safe-area-inset-bottom))">
                <Box w="full" maxW="380px">
                    <Heading as="h1" fontSize="2xl" fontWeight="800" color="gray.900">
                        Log in
                    </Heading>
                    <Text fontSize="sm" color="gray.600" mt={1.5}>
                        Customers and staff use the same login.
                    </Text>

                    <Box as="form" onSubmit={handleSubmit} mt={7}>
                        <Stack spacing={5}>
                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="600" color="gray.700" mb={1.5}>
                                    Username or email
                                </FormLabel>
                                <Input
                                    name="login"
                                    autoComplete="username"
                                    autoCapitalize="none"
                                    h="46px"
                                    borderRadius="md"
                                    borderColor="gray.300"
                                    focusBorderColor="brand.500"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="600" color="gray.700" mb={1.5}>
                                    Password
                                </FormLabel>
                                <InputGroup>
                                    <Input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        h="46px"
                                        borderRadius="md"
                                        borderColor="gray.300"
                                        focusBorderColor="brand.500"
                                    />
                                    <InputRightElement h="46px">
                                        <IconButton
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            icon={<Icon as={showPassword ? EyeSlashIcon : EyeIcon} boxSize={5} />}
                                            size="sm"
                                            variant="ghost"
                                            color="gray.500"
                                            onClick={() => setShowPassword((value) => !value)}
                                        />
                                    </InputRightElement>
                                </InputGroup>
                                <Text fontSize="xs" color="gray.500" mt={2}>
                                    Forgot your password? Call us at{" "}
                                    <Link href={business.phoneHref} color="brand.600" fontWeight="600">
                                        {business.phone}
                                    </Link>
                                    .
                                </Text>
                            </FormControl>

                            <Button type="submit" colorScheme="brand" h="46px" borderRadius="md" fontWeight="700" isLoading={loading} loadingText="Logging in">
                                Log in
                            </Button>
                        </Stack>
                    </Box>

                    <Box mt={8} pt={6} borderTop="1px solid" borderColor="gray.200">
                        <Text fontSize="sm" color="gray.700">
                            No account yet?{" "}
                            <Link color="brand.600" fontWeight="700" onClick={register.onOpen}>
                                Register as a customer
                            </Link>
                        </Text>
                        <HStack spacing={4} mt={3} fontSize="sm">
                            <Link color="gray.600" onClick={() => navigate("/browse-vehicles")}>
                                Browse cars for sale
                            </Link>
                            <Text color="gray.300">|</Text>
                            <Link color="gray.600" onClick={() => navigate("/contact")}>
                                Contact us
                            </Link>
                        </HStack>
                        <InstallAppButton mt={5} size="sm" variant="outline" />
                    </Box>
                </Box>
            </Flex>

            <CustomerRegisterModal isOpen={register.isOpen} onClose={register.onClose} />
        </Flex>
    );
}
