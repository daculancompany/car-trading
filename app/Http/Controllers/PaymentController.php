<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Payment;
use App\Models\FinancingInfo;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Concerns\ChecksCustomerOwnership;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use App\Enums\PaymentStatus;
use App\Services\TransactionStatusService;

class PaymentController extends Controller
{
    use ChecksCustomerOwnership;

    private function relations(): array
    {
        return [
            'reservation.customer.user',
            'reservation.vehicle.brand',
            'reservation.vehicle.model',
            'reservation.vehicle.variant',
            'sale',
            'financingInfo',
            'paymentAccount',
            'verifiedBy',
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Payment::with($this->relations())->where('archived', false);

        if ($user->customer) {
            $query->whereHas('reservation', fn($q) => $q->where('customer_id', $user->customer->id));
        }

        return response()->json([
            'message' => 'Payments retrieved successfully.',
            'data' => $query->latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reservation_id' => ['required', 'integer', 'exists:reservations,id'],
            'sale_id' => ['required', 'integer', 'exists:sales,id'],
            'financing_info_id' => ['nullable', 'integer', 'exists:financing_infos,id'],
            'payer_type' => ['required', Rule::in(['customer', 'financing_company'])],
            'payment_account_id' => ['nullable', 'integer', 'exists:payment_accounts,id'],
            'payment_type' => ['required', Rule::in(['reservation_fee', 'partial_payment', 'full_payment', 'financing_release'])],
            'payment_method' => ['required', Rule::in(['cash', 'gcash', 'bank_transfer', 'check'])],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reference_number' => ['nullable', 'string', 'max:255', 'unique:payments,reference_number'],
            'payment_proof' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remarks' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $reservation = Reservation::find($validated['reservation_id']);
        $sale = Sale::find($validated['sale_id']);

        if (!$reservation) {
            return response()->json(['message' => 'Reservation not found.'], 404);
        }

        if (!$sale) {
            return response()->json(['message' => 'Sale not found.'], 404);
        }

        if ((int) $sale->reservation_id !== (int) $reservation->id) {
            return response()->json(['message' => 'The sale does not belong to this reservation.'], 422);
        }

        if ($user->customer && $reservation->customer_id !== $user->customer->id) {
            return response()->json(['message' => 'You are not authorized to make a payment for this reservation.'], 403);
        }

        $financingInfoId = $validated['financing_info_id'] ?? null;
        $payerType = $validated['payer_type'];
        $paymentType = $validated['payment_type'];

        if ($payerType === 'financing_company' && !$financingInfoId) {
            return response()->json(['message' => 'A financing company payment must be linked to a financing record.'], 422);
        }

        if ($paymentType === 'financing_release' && !$financingInfoId) {
            return response()->json(['message' => 'A financing release payment must be linked to a financing record.'], 422);
        }

        if ($payerType === 'customer' && $paymentType === 'financing_release') {
            return response()->json(['message' => 'A financing release payment must be made by a financing company.'], 422);
        }

        if ($financingInfoId) {
            $financingInfo = FinancingInfo::find($financingInfoId);

            if (!$financingInfo) {
                return response()->json(['message' => 'Financing record not found.'], 404);
            }

            if ((int) $financingInfo->reservation_id !== (int) $reservation->id) {
                return response()->json(['message' => 'The financing record does not belong to this reservation.'], 422);
            }
        }

        if ($request->hasFile('payment_proof')) {
            $validated['payment_proof'] = $request->file('payment_proof')->store('payments/proofs', 'public');
        }

        $validated['payment_date'] = now();
        $validated['payment_status'] = PaymentStatus::PENDING;
        $validated['verified_by'] = null;
        $validated['verified_at'] = null;
        $validated['archived'] = false;

        if ($validated['payment_method'] === 'cash') {
            $validated['payment_account_id'] = null;
        }

        $payment = Payment::create($validated);
        $payment->load($this->relations());

        return response()->json([
            'message' => 'Payment created successfully.',
            'data' => $payment,
        ], 201);
    }

    public function show(Request $request, Payment $payment): JsonResponse
    {
        $user = $request->user();

        if ($user->customer && $payment->reservation->customer_id !== $user->customer->id) {
            return response()->json(['message' => 'You are not authorized to view this payment.'], 403);
        }

        $payment->load($this->relations());

        return response()->json([
            'message' => 'Payment retrieved successfully.',
            'data' => $payment,
        ]);
    }

    public function update(Request $request, Payment $payment): JsonResponse
    {
        if ($request->user()->customer) {
            return response()->json(['message' => 'Customers are not authorized to update payments directly.'], 403);
        }

        $validated = $request->validate([
            'reservation_id' => ['sometimes', 'required', 'integer', 'exists:reservations,id'],
            'sale_id' => ['sometimes', 'required', 'integer', 'exists:sales,id'],
            'financing_info_id' => ['nullable', 'integer', 'exists:financing_infos,id'],
            'payer_type' => ['sometimes', 'required', Rule::in(['customer', 'financing_company'])],
            'payment_account_id' => ['nullable', 'integer', 'exists:payment_accounts,id'],
            'payment_type' => ['sometimes', 'required', Rule::in(['reservation_fee', 'partial_payment', 'full_payment', 'financing_release'])],
            'payment_method' => ['sometimes', 'required', Rule::in(['cash', 'gcash', 'bank_transfer', 'check'])],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'reference_number' => ['nullable', 'string', 'max:255', Rule::unique('payments', 'reference_number')->ignore($payment->id)],
            'payment_proof' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remarks' => ['nullable', 'string'],
        ]);

        $reservationId = $validated['reservation_id'] ?? $payment->reservation_id;
        $saleId = $validated['sale_id'] ?? $payment->sale_id;

        $reservation = Reservation::find($reservationId);
        $sale = Sale::find($saleId);

        if (!$reservation) {
            return response()->json(['message' => 'Reservation not found.'], 404);
        }

        if (!$sale) {
            return response()->json(['message' => 'Sale not found.'], 404);
        }

        if ((int) $sale->reservation_id !== (int) $reservationId) {
            return response()->json(['message' => 'The sale does not belong to this reservation.'], 422);
        }

        if ($request->hasFile('payment_proof')) {
            if ($payment->payment_proof) {
                Storage::disk('public')->delete($payment->payment_proof);
            }

            $validated['payment_proof'] = $request->file('payment_proof')->store('payments/proofs', 'public');
        }

        if (($validated['payment_method'] ?? $payment->payment_method) === 'cash') {
            $validated['payment_account_id'] = null;
        }

        $paymentType = $validated['payment_type'] ?? $payment->payment_type;
        $payerType = $validated['payer_type'] ?? $payment->payer_type;
        $financingInfoId = array_key_exists('financing_info_id', $validated) ? $validated['financing_info_id'] : $payment->financing_info_id;

        if ($payerType === 'financing_company' && !$financingInfoId) {
            return response()->json(['message' => 'A financing company payment must be linked to a financing record.'], 422);
        }

        if ($paymentType === 'financing_release' && !$financingInfoId) {
            return response()->json(['message' => 'A financing release payment must be linked to a financing record.'], 422);
        }

        if ($payerType === 'customer' && $paymentType === 'financing_release') {
            return response()->json(['message' => 'A financing release payment must be made by a financing company.'], 422);
        }

        if ($financingInfoId) {
            $financingInfo = FinancingInfo::find($financingInfoId);

            if (!$financingInfo) {
                return response()->json(['message' => 'Financing record not found.'], 404);
            }

            if ((int) $financingInfo->reservation_id !== (int) $reservationId) {
                return response()->json(['message' => 'The financing record does not belong to this reservation.'], 422);
            }
        }

        if ($payerType === 'customer') {
            $validated['financing_info_id'] = null;
        }

        $payment->update($validated);

        return response()->json([
            'message' => 'Payment updated successfully.',
            'data' => $payment->fresh($this->relations()),
        ]);
    }

    public function verify(Request $request, Payment $payment, TransactionStatusService $statusService): JsonResponse
    {
        if ($request->user()->customer) {
            return response()->json(['message' => 'Customers are not authorized to verify payments.'], 403);
        }

        if ($payment->payment_status === PaymentStatus::VERIFIED) {
            return response()->json(['message' => 'This payment has already been verified.'], 409);
        }

        if ($payment->payer_type === 'financing_company') {
            if (!$payment->financing_info_id) {
                return response()->json(['message' => 'A financing company payment must be linked to a financing record.'], 422);
            }

            $financingInfo = FinancingInfo::find($payment->financing_info_id);

            if (!$financingInfo || (int) $financingInfo->reservation_id !== (int) $payment->reservation_id) {
                return response()->json(['message' => 'The financing record does not belong to this reservation.'], 422);
            }
        }

        $validated = $request->validate(['remarks' => ['nullable', 'string', 'max:1000']]);

        $payment->update([
            'payment_status' => PaymentStatus::VERIFIED,
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
            'remarks' => $validated['remarks'] ?? $payment->remarks,
        ]);

        $statusService->syncReservationFromPayment($payment->fresh('reservation'));

        return response()->json([
            'message' => 'Payment verified successfully.',
            'data' => $payment->fresh($this->relations()),
        ]);
    }

    public function reject(Request $request, Payment $payment): JsonResponse
    {
        if ($request->user()->customer) {
            return response()->json(['message' => 'Customers are not authorized to reject payments.'], 403);
        }

        if ($payment->payment_status === PaymentStatus::VERIFIED) {
            return response()->json(['message' => 'A verified payment cannot be rejected.'], 409);
        }

        $validated = $request->validate(['remarks' => ['required', 'string', 'max:1000']]);

        $payment->update([
            'payment_status' => PaymentStatus::REJECTED,
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
            'remarks' => $validated['remarks'],
        ]);

        return response()->json([
            'message' => 'Payment rejected successfully.',
            'data' => $payment->fresh($this->relations()),
        ]);
    }

    public function resubmitProof(Request $request, Payment $payment): JsonResponse
    {
        $this->ensureCustomerOwns($payment->reservation?->customer_id);

        $user = $request->user();

        if (!$user->customer || $payment->reservation->customer_id !== $user->customer->id) {
            return response()->json(['message' => 'You are not authorized to resubmit this payment proof.'], 403);
        }

        if ($payment->payment_status === PaymentStatus::VERIFIED) {
            return response()->json(['message' => 'A verified payment proof cannot be resubmitted.'], 409);
        }

        if ($payment->payment_status !== PaymentStatus::REJECTED) {
            return response()->json(['message' => 'Only rejected payment proofs can be resubmitted.'], 409);
        }

        $validated = $request->validate([
            'payment_proof' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'reference_number' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('payments', 'reference_number')->ignore($payment->id)],
        ]);

        if ($payment->payment_proof) {
            Storage::disk('public')->delete($payment->payment_proof);
        }

        $updates = [
            'payment_proof' => $request->file('payment_proof')->store('payments/proofs', 'public'),
            'payment_status' => PaymentStatus::PENDING,
            'verified_by' => null,
            'verified_at' => null,
            'remarks' => null,
        ];

        if (array_key_exists('reference_number', $validated)) {
            $updates['reference_number'] = $validated['reference_number'];
        }

        $payment->update($updates);

        return response()->json([
            'message' => 'Payment proof resubmitted successfully.',
            'data' => $payment->fresh($this->relations()),
        ]);
    }

    public function destroy(Request $request, Payment $payment): JsonResponse
    {
        if ($request->user()->customer) {
            return response()->json(['message' => 'Customers are not authorized to archive payments.'], 403);
        }

        if ($payment->payment_status === PaymentStatus::VERIFIED) {
            return response()->json(['message' => 'A verified payment cannot be archived.'], 409);
        }

        $payment->update(['archived' => true]);

        return response()->json([
            'message' => 'Payment archived successfully.',
        ]);
    }
}
