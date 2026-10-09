import {
  Button,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { business } from "../../../config/business";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({
  isOpen,
  onClose,
}: ContactModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent mx={4}>
        <ModalHeader color="dark.800">Contact Us</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Stack spacing={4}>
            <Text color="gray.600" fontSize="sm" lineHeight="1.7">
              Questions about a unit, a reservation or financing? Call or
              message us. We usually reply within the day.
            </Text>

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
              <ContactDetail label="Phone" value={business.phones.join(" | ")} />
              <ContactDetail label="Facebook" value={business.facebookName} />
              <ContactDetail label="Address" value={business.address} />
              <ContactDetail label="Hours" value={business.hours} />
            </SimpleGrid>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="brand" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

interface ContactDetailProps {
  label: string;
  value: string;
}

function ContactDetail({ label, value }: ContactDetailProps) {
  return (
    <Stack
      spacing={1}
      p={3}
      bg="gray.50"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
    >
      <Heading size="xs" color="dark.700">
        {label}
      </Heading>
      <Text color="gray.600" fontSize="xs" lineHeight="1.5">
        {value}
      </Text>
    </Stack>
  );
}
