import JobOrderFormModal from "./JobOrderFormModal";

interface AddJobOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddJobOrderModal(props: AddJobOrderModalProps) {
    return <JobOrderFormModal {...props} />;
}
