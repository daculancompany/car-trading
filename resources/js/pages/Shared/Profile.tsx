import {
    Avatar,
    Badge,
    Box,
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    Grid,
    HStack,
    Icon,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    Progress,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    useToast,
} from "@chakra-ui/react";
import { CameraIcon, EyeIcon, EyeSlashIcon, IdentificationIcon, KeyIcon, ShieldCheckIcon, UserIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { changePassword, getMe, updateProfile, type AuthUser } from "../../api/UserManagement/authApi";
import { updateMyPhoto } from "../../api/UserManagement/customerApi";
import { LoadingState } from "../../components/Shared/ui";
import { displayName, roleColor } from "../../components/Shared/userDisplay";

const Card = ({ icon, title, subtitle, children }: { icon: ReactNode; title: string; subtitle?: string; children: ReactNode }) => (
    <Box layerStyle="panel" overflow="hidden">
        <HStack spacing={3} px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
            <Flex boxSize="34px" borderRadius="lg" bg="brand.50" color="brand.500" align="center" justify="center">
                {icon}
            </Flex>
            <Box>
                <Text fontWeight="800" color="dark.900">
                    {title}
                </Text>
                {subtitle && (
                    <Text fontSize="xs" color="gray.500">
                        {subtitle}
                    </Text>
                )}
            </Box>
        </HStack>
        <Box p={5}>{children}</Box>
    </Box>
);

const errorsOf = (error: unknown) => (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;

const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }) : "—";

const strength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
};

export default function Profile() {
    const toast = useToast();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [form, setForm] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [passwords, setPasswords] = useState({ current_password: "", password: "", password_confirmation: "" });
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [savingPassword, setSavingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);
    const [savingPhoto, setSavingPhoto] = useState(false);
    const photoInput = useRef<HTMLInputElement>(null);

    const person = user?.customer ?? user?.staff ?? null;
    const isCustomer = Boolean(user?.customer);

    const fill = (current: AuthUser) => {
        const details = current.customer ?? current.staff;
        setForm({
            username: current.username ?? "",
            email: current.email ?? "",
            first_name: details?.first_name ?? "",
            middle_name: details?.middle_name ?? "",
            last_name: details?.last_name ?? "",
            mobile_number: details?.mobile_number ?? "",
            address: details?.address ?? "",
            facebook: current.customer?.facebook ?? "",
        });
    };

    useEffect(() => {
        getMe()
            .then((current) => {
                setUser(current);
                fill(current);
            })
            .catch(() => toast({ title: "Could not load your profile.", status: "error", duration: 3000 }));
    }, [toast]);

    if (!user) {
        return <LoadingState label="Loading your profile…" />;
    }

    const set = (key: string) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [key]: event.target.value }));

    const handleSave = async (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setErrors({});
        try {
            const payload: Record<string, string | null> = { username: form.username.trim(), email: form.email.trim() };
            if (person) {
                payload.first_name = form.first_name.trim();
                payload.middle_name = form.middle_name.trim() || null;
                payload.last_name = form.last_name.trim();
                payload.mobile_number = form.mobile_number.trim() || null;
                payload.address = form.address.trim() || null;
            }
            if (isCustomer) payload.facebook = form.facebook.trim() || null;
            const updated = await updateProfile(payload);
            setUser(updated);
            fill(updated);
            toast({ title: "Profile saved.", status: "success", duration: 2500 });
        } catch (error) {
            const data = errorsOf(error);
            setErrors(Object.fromEntries(Object.entries(data?.errors ?? {}).map(([key, value]) => [key, value[0]])));
            toast({ title: data?.message ?? "Could not save your profile.", status: "error", duration: 3500 });
        } finally {
            setSaving(false);
        }
    };

    const handlePassword = async (event: FormEvent) => {
        event.preventDefault();
        setPasswordErrors({});
        if (passwords.password !== passwords.password_confirmation) {
            setPasswordErrors({ password_confirmation: "The new passwords do not match." });
            return;
        }
        setSavingPassword(true);
        try {
            const message = await changePassword(passwords);
            setPasswords({ current_password: "", password: "", password_confirmation: "" });
            toast({ title: message, status: "success", duration: 3000 });
        } catch (error) {
            const data = errorsOf(error);
            setPasswordErrors(Object.fromEntries(Object.entries(data?.errors ?? {}).map(([key, value]) => [key, value[0]])));
            toast({ title: data?.message ?? "Could not change your password.", status: "error", duration: 3500 });
        } finally {
            setSavingPassword(false);
        }
    };

    const handlePhoto = async (file: File | null) => {
        if (photoInput.current) photoInput.current.value = "";
        if (file && file.size > 5 * 1024 * 1024) {
            toast({ title: "Photo must be 5MB or smaller.", status: "warning", duration: 3000 });
            return;
        }
        setSavingPhoto(true);
        try {
            await updateMyPhoto(file);
            const fresh = await getMe();
            setUser(fresh);
            window.dispatchEvent(new Event("auth-user-updated"));
            toast({ title: file ? "Photo updated." : "Photo removed.", status: "success", duration: 2500 });
        } catch {
            toast({ title: "Could not update your photo.", status: "error", duration: 3000 });
        } finally {
            setSavingPhoto(false);
        }
    };

    const name = displayName(user);
    const role = user.role?.name ?? "";
    const score = strength(passwords.password);
    const dirty =
        form.username !== (user.username ?? "") ||
        form.email !== (user.email ?? "") ||
        form.first_name !== (person?.first_name ?? "") ||
        form.middle_name !== (person?.middle_name ?? "") ||
        form.last_name !== (person?.last_name ?? "") ||
        form.mobile_number !== (person?.mobile_number ?? "") ||
        form.address !== (person?.address ?? "") ||
        form.facebook !== (user.customer?.facebook ?? "");

    return (
        <Stack spacing={4}>
            <Box layerStyle="panel" overflow="hidden">
                <Box h={{ base: "70px", md: "96px" }} bg="dark.800" bgGradient="linear(to-r, dark.900, dark.700)" />
                <Flex px={{ base: 4, md: 6 }} pb={5} pt={3} gap={4} align={{ base: "flex-start", md: "flex-start" }} direction={{ base: "column", md: "row" }}>
                    <Box position="relative" mt={{ base: "-48px", md: "-60px" }} flexShrink={0}>
                        <Avatar size="xl" name={name} src={user.customer?.image_url ?? undefined} bg="brand.500" color="white" border="4px solid white" opacity={savingPhoto ? 0.6 : 1} />
                        {isCustomer && (
                            <IconButton
                                aria-label="Change photo"
                                icon={<Icon as={CameraIcon} boxSize={4} />}
                                size="sm"
                                borderRadius="full"
                                position="absolute"
                                bottom={1}
                                right={1}
                                colorScheme="brand"
                                border="2px solid white"
                                isLoading={savingPhoto}
                                onClick={() => photoInput.current?.click()}
                            />
                        )}
                        <input
                            ref={photoInput}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            hidden
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) handlePhoto(file);
                            }}
                        />
                    </Box>
                    <Box flex="1" minW={0} pb={1}>
                        <HStack spacing={2} wrap="wrap">
                            <Text fontSize="xl" fontWeight="800" color="dark.900">
                                {name}
                            </Text>
                            {role && (
                                <Badge colorScheme={roleColor(role)} borderRadius="full" px={2.5}>
                                    {role}
                                </Badge>
                            )}
                            <Badge colorScheme={user.is_active ? "green" : "gray"} variant="subtle" borderRadius="full" px={2.5}>
                                {user.is_active ? "Active" : "Inactive"}
                            </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                            @{user.username} · {user.email}
                        </Text>
                    </Box>
                    <Box textAlign={{ md: "right" }} pb={1}>
                        <Text fontSize="xs" color="gray.500">
                            Member since
                        </Text>
                        <Text fontSize="sm" fontWeight="700">
                            {formatDate(user.customer?.date_registered ?? user.staff?.hire_date ?? user.created_at)}
                        </Text>
                        {isCustomer && user.customer?.image_url && (
                            <Button size="xs" variant="link" colorScheme="red" mt={1} onClick={() => handlePhoto(null)} isDisabled={savingPhoto}>
                                Remove photo
                            </Button>
                        )}
                    </Box>
                </Flex>
            </Box>

            <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 380px" }} gap={4} alignItems="start">
                <Box as="form" onSubmit={handleSave}>
                    <Stack spacing={4}>
                        <Card icon={<Icon as={UserIcon} boxSize={5} />} title="Account" subtitle="What you use to log in.">
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <FormControl isInvalid={Boolean(errors.username)}>
                                    <FormLabel fontSize="sm">Username</FormLabel>
                                    <Input value={form.username ?? ""} onChange={set("username")} autoComplete="username" />
                                    <FormErrorMessage>{errors.username}</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={Boolean(errors.email)}>
                                    <FormLabel fontSize="sm">Email</FormLabel>
                                    <Input type="email" value={form.email ?? ""} onChange={set("email")} autoComplete="email" />
                                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                                </FormControl>
                            </SimpleGrid>
                        </Card>

                        {person && (
                            <Card icon={<Icon as={IdentificationIcon} boxSize={5} />} title="Personal information" subtitle={isCustomer ? "Used on your reservations, receipts and deed of sale." : "Shown to the office and on job orders."}>
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                    <FormControl isInvalid={Boolean(errors.first_name)}>
                                        <FormLabel fontSize="sm">First name</FormLabel>
                                        <Input value={form.first_name ?? ""} onChange={set("first_name")} />
                                        <FormErrorMessage>{errors.first_name}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="sm">Middle name</FormLabel>
                                        <Input value={form.middle_name ?? ""} onChange={set("middle_name")} />
                                    </FormControl>
                                    <FormControl isInvalid={Boolean(errors.last_name)}>
                                        <FormLabel fontSize="sm">Last name</FormLabel>
                                        <Input value={form.last_name ?? ""} onChange={set("last_name")} />
                                        <FormErrorMessage>{errors.last_name}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={Boolean(errors.mobile_number)}>
                                        <FormLabel fontSize="sm">Mobile number</FormLabel>
                                        <Input value={form.mobile_number ?? ""} onChange={set("mobile_number")} placeholder="09xx xxx xxxx" inputMode="tel" />
                                        <FormErrorMessage>{errors.mobile_number}</FormErrorMessage>
                                    </FormControl>
                                    {isCustomer && (
                                        <FormControl gridColumn={{ md: "span 2" }}>
                                            <FormLabel fontSize="sm">Facebook</FormLabel>
                                            <Input value={form.facebook ?? ""} onChange={set("facebook")} placeholder="Name or profile link" />
                                        </FormControl>
                                    )}
                                    <FormControl gridColumn={{ md: "1 / -1" }}>
                                        <FormLabel fontSize="sm">Address</FormLabel>
                                        <Textarea rows={2} value={form.address ?? ""} onChange={set("address")} />
                                    </FormControl>
                                </SimpleGrid>
                            </Card>
                        )}

                        <Flex justify="flex-end" gap={2}>
                            <Button variant="ghost" isDisabled={!dirty || saving} onClick={() => fill(user)}>
                                Discard
                            </Button>
                            <Button type="submit" colorScheme="brand" isLoading={saving} isDisabled={!dirty}>
                                Save changes
                            </Button>
                        </Flex>
                    </Stack>
                </Box>

                <Stack spacing={4}>
                    <Card icon={<Icon as={KeyIcon} boxSize={5} />} title="Change password" subtitle="Other devices will be logged out.">
                        <Box as="form" onSubmit={handlePassword}>
                            <Stack spacing={3}>
                                <FormControl isInvalid={Boolean(passwordErrors.current_password)}>
                                    <FormLabel fontSize="sm">Current password</FormLabel>
                                    <InputGroup>
                                        <Input
                                            type={showPasswords ? "text" : "password"}
                                            autoComplete="current-password"
                                            value={passwords.current_password}
                                            onChange={(event) => setPasswords((current) => ({ ...current, current_password: event.target.value }))}
                                        />
                                        <InputRightElement>
                                            <IconButton
                                                aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
                                                size="sm"
                                                variant="ghost"
                                                icon={<Icon as={showPasswords ? EyeSlashIcon : EyeIcon} boxSize={4} />}
                                                onClick={() => setShowPasswords((value) => !value)}
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                    <FormErrorMessage>{passwordErrors.current_password}</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={Boolean(passwordErrors.password)}>
                                    <FormLabel fontSize="sm">New password</FormLabel>
                                    <Input
                                        type={showPasswords ? "text" : "password"}
                                        autoComplete="new-password"
                                        value={passwords.password}
                                        onChange={(event) => setPasswords((current) => ({ ...current, password: event.target.value }))}
                                    />
                                    {passwords.password && (
                                        <Progress mt={2} value={(score / 5) * 100} size="xs" borderRadius="full" colorScheme={score >= 4 ? "green" : score >= 3 ? "yellow" : "red"} />
                                    )}
                                    {passwordErrors.password ? (
                                        <FormErrorMessage>{passwordErrors.password}</FormErrorMessage>
                                    ) : (
                                        <FormHelperText fontSize="xs">At least 8 characters. Mix letters, numbers and symbols.</FormHelperText>
                                    )}
                                </FormControl>
                                <FormControl isInvalid={Boolean(passwordErrors.password_confirmation)}>
                                    <FormLabel fontSize="sm">Confirm new password</FormLabel>
                                    <Input
                                        type={showPasswords ? "text" : "password"}
                                        autoComplete="new-password"
                                        value={passwords.password_confirmation}
                                        onChange={(event) => setPasswords((current) => ({ ...current, password_confirmation: event.target.value }))}
                                    />
                                    <FormErrorMessage>{passwordErrors.password_confirmation}</FormErrorMessage>
                                </FormControl>
                                <Button
                                    type="submit"
                                    colorScheme="brand"
                                    variant="outline"
                                    isLoading={savingPassword}
                                    isDisabled={!passwords.current_password || passwords.password.length < 8 || !passwords.password_confirmation}
                                >
                                    Update password
                                </Button>
                            </Stack>
                        </Box>
                    </Card>

                    <Card icon={<Icon as={ShieldCheckIcon} boxSize={5} />} title="Account details">
                        <Stack spacing={2.5} fontSize="sm">
                            {[
                                ["Role", role || "—"],
                                ["Status", user.is_active ? "Active" : "Inactive"],
                                ["Account created", formatDate(user.created_at)],
                                ...(user.staff
                                    ? [
                                          ["Hired", formatDate(user.staff.hire_date)],
                                          ["Work hours", user.staff.work_start_hour ? `${user.staff.work_start_hour.slice(0, 5)} – ${user.staff.work_end_hour?.slice(0, 5) ?? ""}` : "—"],
                                      ]
                                    : []),
                            ].map(([label, value]) => (
                                <Flex key={label} justify="space-between" gap={3}>
                                    <Text color="gray.500">{label}</Text>
                                    <Text fontWeight="600" textAlign="right">
                                        {value}
                                    </Text>
                                </Flex>
                            ))}
                        </Stack>
                    </Card>
                </Stack>
            </Grid>
        </Stack>
    );
}
