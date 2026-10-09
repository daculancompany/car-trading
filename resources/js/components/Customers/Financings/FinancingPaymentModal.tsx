import { useEffect, useState } from "react";
import PaymentModal from "../Payments/PaymentModal";
import { getFinancings, type Financing } from "../../../api/FinancingManagement/financingInfoApi";
import type { Reservation } from "../../../api/ReservationManagement/reservationApi";

interface FinancingPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onPaid: () => void;
}

export default function FinancingPaymentModal({
  isOpen,
  onClose,
  reservation,
  onPaid,
}: FinancingPaymentModalProps) {
  const [financing, setFinancing] = useState<Financing | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !reservation) {
      setFinancing(null);
      return;
    }

    const reservationFinancing = reservation.financing as
      | { id?: number }
      | null
      | undefined;

    if (reservationFinancing?.id) {
      setFinancing({ id: reservationFinancing.id } as Financing);
      return;
    }

    setLoading(true);
    getFinancings()
      .then((records) => {
        setFinancing(
          records.find((record) => record.reservation_id === reservation.id) ?? null,
        );
      })
      .finally(() => setLoading(false));
  }, [isOpen, reservation]);

  return (
    <PaymentModal
      isOpen={isOpen && !loading && financing !== null}
      onClose={onClose}
      reservation={reservation}
      onPaid={onPaid}
      financingPayment
      financingId={financing?.id}
    />
  );
}