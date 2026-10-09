import { Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getToken, getUser } from "../../utils/auth";

const roleOf = (user: unknown) => String((user as { role?: { name?: string } } | null)?.role?.name ?? "").toLowerCase();

export default function Scan() {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    useEffect(() => {
        const type = params.get("type");
        const id = params.get("id");
        const user = getToken() ? getUser() : null;
        const role = roleOf(user);

        if (type === "vehicle" && (!user || role === "customer")) {
            navigate(`/browse-vehicles?vehicle=${id}`, { replace: true });
            return;
        }

        if (!user) {
            navigate(`/login?next=${encodeURIComponent(`/scan?${params.toString()}`)}`, { replace: true });
            return;
        }

        if (role === "admin" || role === "secretary") {
            const page = type === "vehicle" ? "vehicles" : "job-orders";
            navigate(`/${role}-${page}?view=${type === "vehicle" ? "vehicle" : "jobOrder"}&id=${id}`, { replace: true });
        } else if (role === "mechanic" || role === "washer") {
            navigate(`/my-jobs?open=${id}`, { replace: true });
        } else if (role === "customer") {
            navigate("/customer-request-services", { replace: true });
        } else {
            navigate("/browse-vehicles", { replace: true });
        }
    }, [navigate, params]);

    return (
        <Center minH="100dvh">
            <VStack spacing={3}>
                <Spinner color="brand.500" />
                <Text fontSize="sm" color="gray.500">
                    Opening…
                </Text>
            </VStack>
        </Center>
    );
}
