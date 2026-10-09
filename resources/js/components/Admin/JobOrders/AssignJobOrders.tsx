import type { RequestService, Staff } from "../../../api/JobOrderManagement/requestServiceApi";
import JobOrderFormModal from "./JobOrderFormModal";

interface AssignRequestServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    requestService: RequestService | null;
    staffs?: Staff[];
    onSuccess: () => void;
}

export default function AssignRequestServiceModal({ isOpen, onClose, requestService, onSuccess }: AssignRequestServiceModalProps) {
    return <JobOrderFormModal isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} requestService={requestService} />;
}
