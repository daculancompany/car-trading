import {
    useEffect,
    useState,
} from "react";

import {
    Avatar,
    Box,
    Button,
    Flex,
    IconButton,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
    VStack,
    useToast,
} from "@chakra-ui/react";

import {
    AttachmentIcon,
} from "@chakra-ui/icons";

import {
    getMessages,
    createMessage,
    markMessageAsRead,
    type Message,
} from "../../../api/Messages/messageApi";

import { getAuthenticatedUserId } from "../../../utils/auth";

interface CustomerMessageWidgetProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CustomerMessageWidget({
    isOpen,
    onClose,
}: CustomerMessageWidgetProps) {
    const currentUserId = getAuthenticatedUserId();

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [sending, setSending] = useState(false);

    const toast = useToast();

    const loadConversation = async () => {
        try {
            const visibleMessages = await getMessages();

            setMessages(visibleMessages);

            const unreadMessages = visibleMessages.filter(
                (item) =>
                    item.receiver_user_id === currentUserId &&
                    !item.is_read,
            );

            if (unreadMessages.length > 0) {
                await Promise.all(
                    unreadMessages.map((item) =>
                        markMessageAsRead(item.id),
                    ),
                );

                setMessages((prev) =>
                    prev.map((item) =>
                        unreadMessages.some(
                            (unread) =>
                                unread.id === item.id,
                        )
                            ? {
                                ...item,
                                is_read: true,
                            }
                            : item,
                    ),
                );
            }
        } catch (error) {
            console.error(
                "Failed to load conversation:",
                error,
            );

            toast({
                title: "Unable to load messages.",
                description: "Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        void loadConversation();

        const interval = setInterval(
            () => void loadConversation(),
            3000,
        );

        return () => {
            clearInterval(interval);
        };
    }, [isOpen]);

    const handleSendMessage = async () => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage || sending) {
            return;
        }

        try {
            setSending(true);

            // Customer does NOT provide receiver_user_id.
            // Laravel automatically determines the Secretary.
            const newMessage = await createMessage({
                message: trimmedMessage,
            });

            setMessages((prev) => [
                ...prev,
                newMessage,
            ]);

            setMessage("");
        } catch (error) {
            console.error(
                "Failed to send message:",
                error,
            );

            toast({
                title: "Message could not be sent.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {
            e.preventDefault();
            void handleSendMessage();
        }
    };

    const formatMessageTime = (value: string) => {
        if (!value) {
            return "";
        }

        const date = new Date(value);
        const now = new Date();

        const isToday =
            date.toDateString() ===
            now.toDateString();

        const yesterday = new Date();

        yesterday.setDate(
            now.getDate() - 1,
        );

        const isYesterday =
            date.toDateString() ===
            yesterday.toDateString();

        const time =
            date.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
            });

        if (isToday) {
            return time;
        }

        if (isYesterday) {
            return `Yesterday ${time}`;
        }

        return `${date.toLocaleDateString(
            [],
            {
                month: "short",
                day: "numeric",
            },
        )}, ${time}`;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            isCentered
            size="md"
        >
            <ModalOverlay />

            <ModalContent
                display="flex"
                flexDirection="column"
                h={{
                    base: "calc(100dvh - 32px)",
                    sm: "560px",
                }}
                maxH="calc(100dvh - 32px)"
                mx={4}
                overflow="hidden"
            >
<ModalHeader px={4} py={3} bg="dark.800" color="white" fontSize="sm" borderBottom="3px solid" borderColor="brand.600">
                    <Flex
                        align="center"
                        gap={3}
                    >
<Avatar size="sm" name="CDO Car Trading" bg="brand.600" color="white" />

                        <Box>
<Text fontSize="sm" fontWeight="700" color="white">
                                CDO Car Trading
                            </Text>
                            <Flex align="center" gap={1.5}>
                                <Box w="7px" h="7px" borderRadius="full" bg="green.400" />
                                <Text fontSize="xs" color="gray.300">
                                    Usually replies within the day
                                </Text>
                            </Flex>
                        </Box>
                    </Flex>
                </ModalHeader>

                <ModalCloseButton
                    color="white"
                    top={2}
                    right={2}
                    _hover={{
                        bg: "whiteAlpha.200",
                    }}
                />

                <ModalBody
                    p={0}
                    display="flex"
                    flexDirection="column"
                    flex="1"
                    minH={0}
                    bg="gray.50"
                >
                    <VStack
                        flex="1"
                        minH={0}
                        align="stretch"
                        spacing={3}
                        p={4}
                        overflowY="auto"
                        bg="gray.50"
                    >
                        {messages.length === 0 && (
                            <Flex
                                flex="1"
                                align="center"
                                justify="center"
                                direction="column"
                                textAlign="center"
                                px={5}
                            >
                                <Avatar
                                    size="md"
                                    name="CDO Car Trading"
                                    mb={3}
                                />

                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                >
                                    CDO Car Trading
                                </Text>

                                <Text
                                    fontSize="xs"
                                    color="gray.500"
                                    mt={1}
                                >
                                    Hello! How can we
                                    help you today?
                                </Text>
                            </Flex>
                        )}

                        {messages.map((item) => {
                            const isCustomer =
                                item.sender_user_id ===
                                currentUserId;

                            return (
                                <Flex
                                    key={item.id}
                                    justify={
                                        isCustomer
                                            ? "flex-end"
                                            : "flex-start"
                                    }
                                >
                                    <Box maxW="80%">
                                        <Box
bg={isCustomer ? "brand.600" : "white"}
                                            px={3}
                                            py={2}
                                            borderRadius="xl"
                                            borderBottomRightRadius={isCustomer ? "sm" : "xl"}
                                            borderBottomLeftRadius={isCustomer ? "xl" : "sm"}
                                            boxShadow={
                                                isCustomer
                                                    ? "none"
                                                    : "sm"
                                            }
                                            border={
                                                isCustomer
                                                    ? "none"
                                                    : "1px solid"
                                            }
                                            borderColor="gray.200"
                                        >
<Text fontSize="sm" color={isCustomer ? "white" : "dark.800"} whiteSpace="pre-wrap">
                                                {item.message}
                                            </Text>
                                        </Box>

                                        <Text
                                            fontSize="10px"
                                            color="gray.500"
                                            mt={1}
                                            textAlign={
                                                isCustomer
                                                    ? "right"
                                                    : "left"
                                            }
                                        >
                                            {formatMessageTime(
                                                item.sent_at,
                                            )}
                                        </Text>
                                    </Box>
                                </Flex>
                            );
                        })}
                    </VStack>

                    <Box
                        p={3}
                        borderTop="1px solid"
                        borderColor="gray.200"
                    >
                        <Flex
                            gap={2}
                            align="end"
                        >
                            <IconButton
                                aria-label="Attach"
                                icon={
                                    <AttachmentIcon />
                                }
                                size="sm"
                                variant="ghost"
                                isDisabled
                            />

                            <Textarea
                                value={message}
                                onChange={(e) =>
                                    setMessage(
                                        e.target.value,
                                    )
                                }
                                onKeyDown={
                                    handleKeyDown
                                }
                                placeholder="Type a message..."
                                resize="none"
                                rows={1}
fontSize="sm"
                                borderRadius="lg"
                                focusBorderColor="brand.500"
                            />

<Button colorScheme="brand" size="sm" borderRadius="lg"
                                onClick={
                                    handleSendMessage
                                }
                                isLoading={sending}
                                isDisabled={
                                    !message.trim()
                                }
                            >
                                Send
                            </Button>
                        </Flex>

                        <Text
                            fontSize="10px"
                            color="gray.500"
                            mt={2}
                        >
                            Press Enter to send • Shift
                            + Enter for new line
                        </Text>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}