import {
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import {
  archiveStaff,
  type Staff,
} from "../../../api/UserManagement/staffApi";

interface ArchiveStaffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onArchived?: () => void;
}

export default function AdminArchiveStaffDialog({
  isOpen,
  onClose,
  staff,
  onArchived,
}: ArchiveStaffDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleArchive = async () => {
    if (!staff) return;

    try {
      setLoading(true);

      await archiveStaff(staff.id);

      toast({
        title: "Success",
        description: "Staff archived successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onArchived?.();
      onClose();
    } catch (error: any) {
      console.error(error);

      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Unable to archive staff.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader>
          Archive Staff
        </AlertDialogHeader>

        <AlertDialogBody>
          Are you sure you want to archive{" "}
          <strong>
            {staff?.first_name} {staff?.last_name}
          </strong>
          ?

          <br />

          This staff account will be archived and retained
          in the system. You can restore or manage it later.
        </AlertDialogBody>

        <AlertDialogFooter>
          <Button
            ref={cancelRef}
            onClick={onClose}
            isDisabled={loading}
          >
            Cancel
          </Button>

          <Button
            colorScheme="orange"
            ml={3}
            onClick={handleArchive}
            isLoading={loading}
            loadingText="Archiving"
          >
            Archive
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}