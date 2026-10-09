import { useEffect, useState } from "react";
import {
  Box,
  Button,
  type ButtonProps,
  CloseButton,
  Flex,
  HStack,
  Image,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

// Chrome/Edge/Android fire this before showing their own install UI.
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as InstallPromptEvent;
    listeners.forEach((notify) => notify());
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    listeners.forEach((notify) => notify());
  });
}

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

export function usePwaInstall() {
  const [, force] = useState(0);

  useEffect(() => {
    const notify = () => force((n) => n + 1);
    listeners.add(notify);
    return () => {
      listeners.delete(notify);
    };
  }, []);

  const installed = isStandalone();

  return {
    installed,
    // Native prompt available (Android / desktop Chrome / Edge).
    canPrompt: !installed && deferredPrompt !== null,
    // iPhone/iPad never prompt; show the Share → Add to Home Screen steps.
    needsManualSteps: !installed && deferredPrompt === null,
    ios: isIos(),
    prompt: async () => {
      if (!deferredPrompt) return false;
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      listeners.forEach((notify) => notify());
      return outcome === "accepted";
    },
  };
}

function InstallSteps({ isOpen, onClose, ios }: { isOpen: boolean; onClose: () => void; ios: boolean }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent mx={4}>
        <ModalHeader>
          <HStack spacing={3}>
            <Image src="/icons/pwa/icon-192.png" alt="" w="40px" h="40px" borderRadius="lg" />
            <Box>
              <Text fontSize="md" fontWeight="800" color="dark.900">Install AUTO CDO</Text>
              <Text fontSize="xs" color="gray.500" fontWeight="normal">Opens like an app from your home screen</Text>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {ios ? (
            <List spacing={3} fontSize="sm" color="gray.700">
              <ListItem>1. Open this page in <b>Safari</b>.</ListItem>
              <ListItem>2. Tap the <b>Share</b> button (square with an arrow pointing up).</ListItem>
              <ListItem>3. Scroll down and tap <b>Add to Home Screen</b>.</ListItem>
              <ListItem>4. Tap <b>Add</b>. The AUTO CDO icon appears on your home screen.</ListItem>
            </List>
          ) : (
            <List spacing={3} fontSize="sm" color="gray.700">
              <ListItem>1. Open this page in <b>Chrome</b>.</ListItem>
              <ListItem>2. Tap the <b>⋮</b> menu at the top right.</ListItem>
              <ListItem>3. Tap <b>Install app</b> or <b>Add to Home screen</b>.</ListItem>
              <ListItem>4. Confirm. The AUTO CDO icon appears with your other apps.</ListItem>
            </List>
          )}
          <Text fontSize="xs" color="gray.500" mt={4}>
            The app needs a secure (https) address to install. It still works in the browser either way.
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// "Install app" button: native prompt when the browser offers one, otherwise step-by-step help.
export function InstallAppButton(props: ButtonProps) {
  const pwa = usePwaInstall();
  const steps = useDisclosure();

  if (pwa.installed) return null;

  return (
    <>
      <Button
        leftIcon={<ArrowDownTrayIcon width={16} />}
        size="sm"
        colorScheme="brand"
        onClick={async () => {
          if (pwa.canPrompt) await pwa.prompt();
          else steps.onOpen();
        }}
        {...props}
      >
        {props.children ?? "Install app"}
      </Button>
      <InstallSteps isOpen={steps.isOpen} onClose={steps.onClose} ios={pwa.ios} />
    </>
  );
}

const DISMISS_KEY = "autocdo-install-banner-dismissed";

// Slim banner for phones; hidden once installed or dismissed.
export function InstallBanner() {
  const pwa = usePwaInstall();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (pwa.installed || dismissed) return null;

  return (
    <Flex
      align="center"
      gap={3}
      bg="dark.800"
      color="white"
      px={3}
      py={2.5}
      borderRadius="lg"
      mb={3}
      display={{ base: "flex", lg: "none" }}
    >
      <Image src="/icons/pwa/icon-192.png" alt="" w="36px" h="36px" borderRadius="md" />
      <Box flex="1" minW={0}>
        <Text fontSize="sm" fontWeight="700" color="white">Get the AUTO CDO app</Text>
        <Text fontSize="xs" color="gray.300">Faster access, right from your home screen.</Text>
      </Box>
      <InstallAppButton size="xs">Install</InstallAppButton>
      <CloseButton
        size="sm"
        aria-label="Dismiss"
        onClick={() => {
          setDismissed(true);
          try {
            localStorage.setItem(DISMISS_KEY, "1");
          } catch {
            // Private mode: just hide for this visit.
          }
        }}
      />
    </Flex>
  );
}
