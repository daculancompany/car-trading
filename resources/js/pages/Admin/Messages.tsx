import { useEffect, useMemo, useState } from "react";

import {
    Avatar,
    Badge,
    Box,
    Button,
    Flex,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Text,
    VStack,
} from "@chakra-ui/react";

import {
    ArrowLeftIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";

import {
    getMessages,
    getConversation,
    type Message,
} from "../../api/Messages/messageApi";
import { getAuthenticatedUserId } from "../../utils/auth";
import DetailsLink from "../../components/Shared/Details/DetailsLink";

// Temporary Admin User ID
//
// Replace this with your authenticated user's ID once your
// existing authentication context/auth API is connected.
//

// Conversation Interface

interface Conversation {
    userId: number;
    name: string;
    imageUrl?: string | null;
    customerId?: number | null;
    lastMessage: string;
    time: string;
    unread: number;
}

// Admin Message Page

export default function AdminMessagePage() {
    const currentUserId = getAuthenticatedUserId();
    // State

    const [messages, setMessages] = useState<Message[]>([]);

    const [selectedUserId, setSelectedUserId] =
        useState<number | null>(null);

    const [conversationMessages, setConversationMessages] =
        useState<Message[]>([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    const [conversationLoading, setConversationLoading] =
        useState(false);

    // Load All Messages

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            setLoading(true);

            const data = await getMessages();

            setMessages(data);
        } catch (error) {
            console.error(
                "Failed to load messages:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    // Auto Refresh Selected Conversation

    useEffect(() => {
        if (!selectedUserId) {
            return;
        }

        const loadConversation = async () => {
            try {
                const data =
                    await getConversation(selectedUserId);

                setConversationMessages(data);

                setMessages((prev) => {
                    const map = new Map(
                        prev.map((item) => [
                            item.id,
                            item,
                        ])
                    );

                    data.forEach((item) => {
                        map.set(item.id, item);
                    });

                    return Array.from(map.values());
                });
            } catch (error) {
                console.error(
                    "Failed to refresh conversation:",
                    error
                );
            }
        };

        const interval = setInterval(
            loadConversation,
            3000
        );

        return () => {
            clearInterval(interval);
        };
    }, [selectedUserId]);

    // Build Conversation List

    const conversations = useMemo<Conversation[]>(() => {
        const grouped = new Map<number, Message[]>();

        messages.forEach((item) => {
            const otherUserId =
                item.sender_user_id === currentUserId
                    ? item.receiver_user_id
                    : item.sender_user_id;

            if (!grouped.has(otherUserId)) {
                grouped.set(otherUserId, []);
            }

            grouped.get(otherUserId)!.push(item);
        });

        return Array.from(grouped.entries())
            .map(([userId, userMessages]) => {
                const sorted = [...userMessages].sort(
                    (a, b) =>
                        new Date(a.sent_at).getTime() -
                        new Date(b.sent_at).getTime()
                );

                const lastMessage =
                    sorted[sorted.length - 1];

                const otherUser =
                    lastMessage.sender_user_id === userId
                        ? lastMessage.sender
                        : lastMessage.receiver;

                const unread = userMessages.filter(
                    (item) =>
                        item.receiver_user_id ===
                        currentUserId &&
                        !item.is_read
                ).length;

                return {
                    userId,

                    name:
                        otherUser?.username ??
                        otherUser?.email ??
                        `User #${userId}`,

                    imageUrl:
                        otherUser?.customer?.image_url ?? null,

                    customerId:
                        otherUser?.customer?.id ?? null,

                    lastMessage:
                        lastMessage?.message ?? "",

                    time:
                        lastMessage?.sent_at ?? "",

                    unread,
                };
            })
            .sort(
                (a, b) =>
                    new Date(b.time).getTime() -
                    new Date(a.time).getTime()
            );
    }, [messages]);

    // Search

    const filteredConversations =
        conversations.filter((conversation) =>
            conversation.name
                .toLowerCase()
                .includes(search.toLowerCase().trim())
        );

    // Selected Conversation

    const selectedConversation =
        conversations.find(
            (conversation) =>
                conversation.userId === selectedUserId
        ) ?? null;

    // Select Conversation

    const handleSelectConversation = async (
        userId: number
    ) => {
        try {
            setSelectedUserId(userId);

            setConversationLoading(true);

            const data =
                await getConversation(userId);

            setConversationMessages(data);

        } catch (error) {
            console.error(
                "Failed to load conversation:",
                error
            );
        } finally {
            setConversationLoading(false);
        }
    };

    // Format Time

    const formatTime = (value: string) => {
        if (!value) {
            return "";
        }

        return new Date(value).toLocaleTimeString(
            [],
            {
                hour: "numeric",
                minute: "2-digit",
            }
        );
    };

    // Format Conversation Time

    const formatConversationTime = (
        value: string
    ) => {
        if (!value) {
            return "";
        }

        const date = new Date(value);

        const today = new Date();

        const isToday =
            date.toDateString() ===
            today.toDateString();

        if (isToday) {
            return formatTime(value);
        }

        return date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
        });
    };

    // Render

    return (
        <Flex
            h="calc(100vh - 80px)"
            bg="gray.50"
            gap={4}
            p={{ base: 3, md: 5 }}
            overflow="hidden"
        >
            {/* LEFT - CONVERSATIONS */}

            <Box
                w={{ base: "100%", md: "350px" }}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                boxShadow="sm"
                overflow="hidden"
                display={{
                    base:
                        selectedConversation
                            ? "none"
                            : "flex",
                    md: "flex",
                }}
                flexDirection="column"
            >
                {/* Header */}

                <Box
                    px={{ base: 4, md: 5 }}
                    py={4}
                    borderBottom="1px solid"
                    borderColor="gray.200"
                >
                    <Flex
                        justify="space-between"
                        align="center"
                        mb={4}
                    >
                        <Box>
                            <Text
                                fontSize="lg"
                                fontWeight="700"
                                color="gray.800"
                            >
                                Messages
                            </Text>

                            <Text
                                fontSize="xs"
                                color="gray.500"
                                mt={0.5}
                            >
                                Customer conversations
                            </Text>
                        </Box>

                        <Badge
                            colorScheme="blue"
                            borderRadius="md"
                            px={2}
                            py={1}
                            fontSize="xs"
                            fontWeight="600"
                        >
                            {conversations.length}
                        </Badge>
                    </Flex>

                    {/* Search */}

                    <InputGroup size="sm">
                        <InputLeftElement pointerEvents="none">
                            <MagnifyingGlassIcon
                                width={16}
                                height={16}
                                color="currentColor"
                            />
                        </InputLeftElement>

                        <Input
                            placeholder="Search conversations..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            pl={9}
                            bg="white"
                            borderColor="gray.300"
                            borderRadius="md"
                            _hover={{
                                borderColor: "gray.400",
                            }}
                            _focus={{
                                borderColor: "brand.500",
                                boxShadow:
                                    "0 0 0 1px var(--chakra-colors-brand-500)",
                            }}
                        />
                    </InputGroup>
                </Box>

                {/* Conversation List */}

                <Box
                    flex="1"
                    overflowY="auto"
                >
                    {/* Loading */}

                    {loading && (
                        <Text
                            px={5}
                            py={8}
                            textAlign="center"
                            color="gray.500"
                            fontSize="sm"
                        >
                            Loading conversations...
                        </Text>
                    )}

                    {/* Empty */}

                    {!loading &&
                        filteredConversations.length ===
                        0 && (
                            <Text
                                px={5}
                                py={8}
                                textAlign="center"
                                color="gray.500"
                                fontSize="sm"
                            >
                                No conversations found.
                            </Text>
                        )}

                    {/* Conversations */}

                    {!loading &&
                        filteredConversations.map(
                            (conversation) => {
                                const isSelected =
                                    selectedUserId ===
                                    conversation.userId;

                                return (
                                    <Box
                                        key={
                                            conversation.userId
                                        }
                                        px={4}
                                        py={3}
                                        cursor="pointer"
                                        bg={
                                            isSelected
                                                ? "brand.50"
                                                : "transparent"
                                        }
                                        borderLeft="3px solid"
                                        borderColor={
                                            isSelected
                                                ? "brand.500"
                                                : "transparent"
                                        }
                                        _hover={{
                                            bg: isSelected
                                                ? "brand.50"
                                                : "gray.50",
                                        }}
                                        transition="background 0.15s ease"
                                        onClick={() =>
                                            handleSelectConversation(
                                                conversation.userId
                                            )
                                        }
                                    >
                                        <Flex
                                            gap={3}
                                            align="center"
                                        >
                                            {/* Avatar */}

                                            <Avatar
                                                size="sm"
                                                name={
                                                    conversation.name
                                                }
                                                src={conversation.imageUrl ?? undefined}
                                            />

                                            {/* Information */}

                                            <Box
                                                flex="1"
                                                minW={0}
                                            >
                                                <Flex
                                                    justify="space-between"
                                                    align="center"
                                                    gap={2}
                                                >
                                                    <Text
                                                        fontSize="sm"
                                                        fontWeight="600"
                                                        color="gray.800"
                                                        noOfLines={1}
                                                    >
                                                        {
                                                            conversation.name
                                                        }
                                                    </Text>

                                                    <Text
                                                        fontSize="10px"
                                                        color="gray.500"
                                                        whiteSpace="nowrap"
                                                    >
                                                        {formatConversationTime(
                                                            conversation.time
                                                        )}
                                                    </Text>
                                                </Flex>

                                                <Flex
                                                    justify="space-between"
                                                    align="center"
                                                    gap={2}
                                                    mt={1}
                                                >
                                                    <Text
                                                        fontSize="xs"
                                                        color="gray.500"
                                                        noOfLines={1}
                                                    >
                                                        {
                                                            conversation.lastMessage
                                                        }
                                                    </Text>

                                                    {conversation.unread >
                                                        0 && (
                                                            <Badge
                                                                colorScheme="blue"
                                                                borderRadius="md"
                                                                fontSize="10px"
                                                                minW="20px"
                                                                px={1}
                                                                textAlign="center"
                                                            >
                                                                {
                                                                    conversation.unread
                                                                }
                                                            </Badge>
                                                        )}
                                                </Flex>
                                            </Box>
                                        </Flex>
                                    </Box>
                                );
                            }
                        )}
                </Box>
            </Box>

            {/* RIGHT - CHAT */}

            <Box
                flex="1"
                minW={0}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                boxShadow="sm"
                overflow="hidden"
                display={{
                    base:
                        selectedConversation
                            ? "flex"
                            : "none",
                    md: "flex",
                }}
                flexDirection="column"
            >
                {/* NO CONVERSATION SELECTED */}

                {!selectedConversation && (
                    <Flex
                        flex="1"
                        align="center"
                        justify="center"
                        direction="column"
                        px={5}
                    >
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            w="52px"
                            h="52px"
                            borderRadius="lg"
                            bg="gray.100"
                            mb={4}
                        >
                            <MagnifyingGlassIcon
                                width={24}
                                height={24}
                                color="currentColor"
                            />
                        </Box>

                        <Text
                            fontSize="md"
                            fontWeight="600"
                            color="gray.800"
                        >
                            Select a conversation
                        </Text>

                        <Text
                            fontSize="sm"
                            color="gray.500"
                            mt={1}
                            textAlign="center"
                        >
                            Choose a customer to view
                            their messages.
                        </Text>
                    </Flex>
                )}

                {/* SELECTED CONVERSATION */}

                {selectedConversation && (
                    <>
                        {/* Chat Header */}

                        <Box
                            px={{ base: 4, md: 5 }}
                            py={4}
                            borderBottom="1px solid"
                            borderColor="gray.200"
                        >
                            <Flex
                                justify="space-between"
                                align="center"
                                gap={3}
                            >
                                <Flex
                                    gap={3}
                                    align="center"
                                    minW={0}
                                >
                                    {/* Mobile Back */}

                                    <IconButton
                                        aria-label="Back to conversations"
                                        icon={
                                            <ArrowLeftIcon
                                                width={16}
                                                height={16}
                                            />
                                        }
                                        size="sm"
                                        variant="ghost"
                                        borderRadius="md"
                                        display={{
                                            base: "flex",
                                            md: "none",
                                        }}
                                        onClick={() =>
                                            setSelectedUserId(
                                                null
                                            )
                                        }
                                    />

                                    <Avatar
                                        size="sm"
                                        name={
                                            selectedConversation.name
                                        }
                                        src={selectedConversation.imageUrl ?? undefined}
                                    />

                                    <Box minW={0}>
                                        <DetailsLink
                                            type="customer"
                                            id={selectedConversation.customerId}
                                            fontSize="sm"
                                            fontWeight="700"
                                            color="gray.800"
                                            noOfLines={1}
                                        >
                                            {
                                                selectedConversation.name
                                            }
                                        </DetailsLink>

                                        <Text
                                            fontSize="xs"
                                            color="gray.500"
                                            mt={0.5}
                                        >
                                            Customer
                                        </Text>
                                    </Box>
                                </Flex>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    borderColor="gray.300"
                                    borderRadius="md"
                                    display={{
                                        base: "none",
                                        sm: "inline-flex",
                                    }}
                                    _hover={{
                                        bg: "gray.50",
                                        borderColor: "gray.400",
                                    }}
                                >
                                    View Customer
                                </Button>
                            </Flex>
                        </Box>

                        {/* MESSAGES */}

                        <VStack
                            flex="1"
                            align="stretch"
                            spacing={4}
                            px={{ base: 4, md: 5 }}
                            py={5}
                            overflowY="auto"
                            bg="gray.50"
                        >
                            {conversationLoading && (
                                <Text
                                    textAlign="center"
                                    color="gray.500"
                                    fontSize="sm"
                                >
                                    Loading messages...
                                </Text>
                            )}

                            {!conversationLoading &&
                                conversationMessages.length ===
                                0 && (
                                    <Flex
                                        flex="1"
                                        align="center"
                                        justify="center"
                                    >
                                        <Text
                                            color="gray.500"
                                            fontSize="sm"
                                        >
                                            No messages yet.
                                        </Text>
                                    </Flex>
                                )}

                            {!conversationLoading &&
                                conversationMessages.map(
                                    (item) => {
                                        const isAdmin =
                                            item.sender_user_id ===
                                            currentUserId;

                                        return (
                                            <Flex
                                                key={item.id}
                                                justify={
                                                    isAdmin
                                                        ? "flex-end"
                                                        : "flex-start"
                                                }
                                            >
                                                <Box
                                                    maxW={{
                                                        base: "85%",
                                                        md: "65%",
                                                    }}
                                                >
                                                    <Box
                                                        px={4}
                                                        py={3}
                                                        borderRadius="lg"
                                                        bg={
                                                            isAdmin
                                                                ? "brand.500"
                                                                : "white"
                                                        }
                                                        color={
                                                            isAdmin
                                                                ? "white"
                                                                : "gray.800"
                                                        }
                                                        border={
                                                            isAdmin
                                                                ? "none"
                                                                : "1px solid"
                                                        }
                                                        borderColor="gray.200"
                                                        boxShadow={
                                                            isAdmin
                                                                ? "none"
                                                                : "sm"
                                                        }
                                                    >
                                                        <Text
                                                            fontSize="sm"
                                                            lineHeight="1.5"
                                                        >
                                                            {item.message}
                                                        </Text>
                                                    </Box>

                                                    <Text
                                                        fontSize="10px"
                                                        color="gray.500"
                                                        mt={1}
                                                        textAlign={
                                                            isAdmin
                                                                ? "right"
                                                                : "left"
                                                        }
                                                    >
                                                        {formatTime(
                                                            item.sent_at
                                                        )}
                                                    </Text>
                                                </Box>
                                            </Flex>
                                        );
                                    }
                                )}
                        </VStack>

                        {/* MESSAGE INPUT */}

                        <Box px={{ base: 3, md: 4 }} py={3} bg="gray.50" borderTop="1px solid" borderColor="gray.200">
                            <Text fontSize="sm" color="gray.500" textAlign="center">
                                Admin is in read-only viewer mode.
                            </Text>
                        </Box>
                    </>
                )}
            </Box>
        </Flex>
    );
}

