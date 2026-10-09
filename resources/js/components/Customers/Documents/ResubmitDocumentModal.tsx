import { useEffect, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";

import {
  getFinancingDocument,
  resubmitFinancingDocument,
  type FinancingDocument,
} from "../../../api/FinancingManagement/documentApi";

interface ResubmitDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: FinancingDocument | null;
  onResubmitted?: () => void;
}

export default function ResubmitDocumentModal({
  isOpen,
  onClose,
  document,
  onResubmitted,
}: ResubmitDocumentModalProps) {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentDocument, setCurrentDocument] =
    useState<FinancingDocument | null>(document);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setRemarks("");
      setCurrentDocument(document);
    }
  }, [isOpen, document]);

  useEffect(() => {
    if (!isOpen || !document) return;

    const refreshDocument = async () => {
      try {
        const latestDocument = await getFinancingDocument(document.id);
        setCurrentDocument(latestDocument);
      } catch (error) {
        console.error("Failed to refresh document status:", error);
      }
    };

    refreshDocument();
  }, [isOpen, document]);

  const handleSubmit = async () => {
    if (!currentDocument || !file) {
      toast({
        title: "Document required",
        description: "Choose the replacement document before submitting.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (currentDocument.verification_status !== "rejected") {
      toast({
        title: "Document is no longer rejected",
        description:
          "Refresh the Documents page and select the rejected document again.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      await resubmitFinancingDocument(currentDocument.id, {
        file,
        remarks: remarks.trim() || null,
      });

      toast({
        title: "Document resubmitted",
        description: "The replacement document was submitted for review.",
        status: "success",
        duration: 3500,
        isClosable: true,
      });

      onResubmitted?.();
      onClose();
    } catch (error: any) {
      toast({
        title: "Resubmission failed",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.errors?.file?.[0] ||
          "Unable to resubmit the document.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Resubmit Financing Document</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {document && (
            <Box>
              <Alert status="error" mb={4} borderRadius="md" alignItems="flex-start">
                <AlertIcon mt={1} />
                <Box>
                  <AlertTitle fontSize="sm">Document rejected</AlertTitle>
                  <AlertDescription fontSize="sm">
                    {document.remarks || "Please upload a corrected document."}
                  </AlertDescription>
                </Box>
              </Alert>

              <Text fontWeight="700" mb={4}>
                {document.financing_requirement?.requirement_name || document.file_name}
              </Text>

              <FormControl isRequired mb={4}>
                <FormLabel>Replacement document</FormLabel>
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  p={1}
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Accepted formats: JPG, PNG, PDF. Maximum size: 10 MB.
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>Remarks</FormLabel>
                <Textarea
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Add notes about the replacement document."
                  rows={3}
                />
              </FormControl>
            </Box>
          )}
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading} loadingText="Submitting...">
            Submit Replacement
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
