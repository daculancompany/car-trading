<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Enums\ReservationStatus;
use App\Services\TransactionStatusService;
use App\Helpers\NotificationHelper;
use App\Models\User;

class ReservationController extends Controller
{
    /**
     * GET ALL RESERVATIONS
     *
     * Kuhaon ang reservation records.
     * Ang Admin/Staff makakita sa tanan reservations,
     * samtang ang Customer kay iyang kaugalingon ra nga reservations.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Reservation::with([
            'customer.user',
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
            'vehicle.images',
            'vehicle.specs',
            'reservedBy',
            'statusHistories.user:id,username,role_id',
            'statusHistories.user.role',
        ]);

        // Customer Ownership

        if ($user->customer) {
            $query->where(
                'customer_id',
                $user->customer->id
            );
        }

        $reservations = $query
            ->latest()
            ->get();

        return response()->json([
            'message' =>
            'Reservations retrieved successfully.',
            'data' => $reservations,
        ], 200);
    }

    // CREATE RESERVATION
    // Mao ni ang main function para mag-create ug bag-ong vehicle reservation.
    // Ang customer automatic mailhan pinaagi sa authenticated user.
    public function store(
        Request $request,
        TransactionStatusService $statusService
    ): JsonResponse {
        // Get authenticated user
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }
        // Get customer profile
        $customer = $user->customer;
        if (!$customer) {
            return response()->json([
                'message' => 'Customer profile not found.',
            ], 404);
        }
        // Validate reservation data
        $validated = $request->validate([
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'reservation_source' => ['required', Rule::in(['online', 'walk_in',])],
            // ID files are optional when the customer already has an ID on file.
            'valid_id_type' => ['nullable', 'required_with:valid_id_front,valid_id_back', 'string',  'max:255'],
            'valid_id_front' => ['nullable', 'required_with:valid_id_back', 'file', 'image',  'mimes:jpg,jpeg,png', 'max:5120'],
            'valid_id_back' => ['nullable', 'required_with:valid_id_front', 'file', 'image', 'mimes:jpg,jpeg,png',  'max:5120'],
            'purchase_option' => ['required',  Rule::in(['cash',  'financing'])],
            'remarks' => ['nullable', 'string'],
        ]);
        // I-check kung ang vehicle naa na bay active reservation.
        // Kung naa, dili na pwede himoon ug laing reservation sa lahi nga customer.
        $hasActiveReservation = Reservation::where(
            'vehicle_id',
            $validated['vehicle_id']
        )
            ->whereIn('reservation_status', [
                ReservationStatus::PENDING_RESERVATION,
                ReservationStatus::PENDING_DOCUMENTS,
                ReservationStatus::PENDING_FINANCING,
                ReservationStatus::PENDING_PAYMENT,
                ReservationStatus::RESERVED,
            ])
            ->exists();
        if ($hasActiveReservation) {
            return response()->json([
                'message' =>
                'This vehicle already has an active reservation.',
            ], 409);
        }
        $idOnFile = null;

        if ($request->hasFile('valid_id_front')) {
            $frontPath = $request->file('valid_id_front')->store('reservation_ids', 'public');
            $backPath = $request->file('valid_id_back')->store('reservation_ids', 'public');
        } else {
            $idOnFile = $this->idOnFile($customer->id);

            if (!$idOnFile) {
                return response()->json([
                    'message' => 'Please upload the front and back of a valid ID.',
                ], 422);
            }

            $validated['valid_id_type'] = $idOnFile->valid_id_type;
            $frontPath = $idOnFile->valid_id_front;
            $backPath = $idOnFile->valid_id_back;
        }
        $reservedAt = now();
        // Ang reservation valid sulod sa 7 days.
        $expiresAt = $reservedAt->copy()->addDays(7);
        // I-link ang reservation sa authenticated customer.
        $validated['customer_id'] = $customer->id;
        $validated['reserved_by_id'] = null;
        $validated['reserved_at'] = $reservedAt;
        $validated['expires_at'] = $expiresAt;
        // Ang bag-ong reservation magsugod sa pending status.
        $validated['reservation_status'] = ReservationStatus::PENDING_RESERVATION->value;
        // Replace UploadedFile Objects With Stored Paths
        $validated['valid_id_front'] = $frontPath;
        $validated['valid_id_back'] = $backPath;
        // An already-approved ID carries its approval over, so staff don't review it twice.
        if ($idOnFile) {
            $validated['valid_id_front_status'] = $idOnFile->valid_id_front_status;
            $validated['valid_id_back_status'] = $idOnFile->valid_id_back_status;
        }
        $reservation = Reservation::create($validated);
        // I-notify ang customer nga successful ang submission.
        NotificationHelper::send(
            senderUserId: $user->id,
            receiverUserId: $user->id,
            title: 'Reservation Submitted',
            message: 'Your vehicle reservation has been submitted successfully.',
            notificationType: 'reservation'
        );
        // Pangitaon ang Admin ug Secretary users.
        $staffUsers = User::whereHas('role', function ($query) {
            $query->whereIn(
                'name',
                ['Admin', 'Secretary']
            );
        })->get();
        // I-notify ang Admin ug Secretary nga naay bag-ong reservation.
        foreach ($staffUsers as $staffUser) {
            NotificationHelper::send(
                senderUserId: $user->id,
                receiverUserId: $staffUser->id,
                title: 'New Vehicle Reservation',
                message: 'A customer submitted a new vehicle reservation.',
                notificationType: 'reservation'
            );
        }
        // I-update ang vehicle status base sa bag-ong reservation.
        $reservation->load('vehicle');
        $statusService->syncVehicleFromReservation($reservation);
        $reservation->load([
            'customer.user',
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
            'reservedBy',
        ]);
        return response()->json([
            'message' =>
            'Reservation created successfully.',
            'data' => $reservation,
        ], 201);
    }

    /**
     * GET SINGLE RESERVATION
     *
     * Kuhaon ang complete details sa usa ka reservation.
     * I-check usab kung ang customer authorized ba
     * nga makakita niini.
     */
    public function show(
        Request $request,
        Reservation $reservation
    ): JsonResponse {

        $user = $request->user();

        // Customer dapat iya mismo nga reservation ang iyang makita.
        if (
            $user->customer &&
            $reservation->customer_id !==
            $user->customer->id
        ) {
            return response()->json([
                'message' =>
                'You are not authorized to view this reservation.',
            ], 403);
        }

        $reservation->load([
            'customer.user',
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
            'vehicle.images',
            'reservedBy',
            'payments',
            'financing',
            'sale',
            'statusHistories.user:id,username,role_id',
            'statusHistories.user.role',
        ]);

        return response()->json([
            'message' =>
            'Reservation retrieved successfully.',
            'data' => $reservation,
        ], 200);
    }

    // Para ni sa Admin/Staff.
    // I-review kung approved ba ang front ug back side sa customer's valid ID.
    public function reviewId(
        Request $request,
        Reservation $reservation
    ): JsonResponse {
        // Customer dili pwede mo-review sa iyang kaugalingong ID.
        if ($request->user()->customer) {
            return response()->json([
                'message' =>
                'Customers are not authorized to review IDs.',
            ], 403);
        }
        $validated = $request->validate([
            'front_status' => ['sometimes', Rule::in(['approved', 'resubmit',])],
            'front_remarks' => ['nullable', 'string', 'max:1000'],
            'back_status' => ['sometimes', Rule::in(['approved', 'resubmit',])],
            'back_remarks' => ['nullable',  'string',  'max:1000',],
        ]);
        if (
            !isset($validated['front_status']) &&
            !isset($validated['back_status'])
        ) {
            return response()->json([
                'message' =>
                'At least one ID side must be reviewed.',
            ], 422);
        }
        // Kung resubmit, kinahanglan naa gyud remarks.
        foreach (['front', 'back'] as $side) {
            $statusKey = "{$side}_status";
            $remarksKey = "{$side}_remarks";
            if (
                ($validated[$statusKey] ?? null) === 'resubmit'
                && blank($validated[$remarksKey] ?? null)
            ) {
                return response()->json([
                    'message' =>
                    "A reason is required when the {$side} ID needs resubmission.",
                ], 422);
            }
        }
        $updates = [];
        foreach (['front', 'back'] as $side) {
            $statusKey = "{$side}_status";
            $remarksKey = "{$side}_remarks";
            if (isset($validated[$statusKey])) {
                $updates["valid_id_{$side}_status"] = $validated[$statusKey];
                $updates["valid_id_{$side}_remarks"] = $validated[$remarksKey] ?? null;
            }
        }
        // I-set ang reservation balik sa pending Reservations
        // para ma-process balik ang ID review.
        $updates['reservation_status'] = ReservationStatus::PENDING_RESERVATION->value;
        $statusBefore = $reservation->reservation_status;
        $reviewNote = collect(['front', 'back'])
            ->filter(fn ($side) => isset($validated["{$side}_status"]))
            ->map(fn ($side) => ucfirst($side) . ' ID ' . ($validated["{$side}_status"] === 'approved' ? 'approved' : 'needs resubmission') . (filled($validated["{$side}_remarks"] ?? null) ? ': ' . $validated["{$side}_remarks"] : ''))
            ->implode(' · ');
        $reservation->historyAction = 'id_reviewed';
        $reservation->historyNote = $reviewNote;
        $reservation->update($updates);
        if ($statusBefore === ReservationStatus::PENDING_RESERVATION) {
            $reservation->logStatus($statusBefore->value, 'id_reviewed', $reviewNote);
        }
        return response()->json([
            'message' =>
            'Reservation ID review saved successfully.',
            'data' => $reservation->fresh(),
        ], 200);
    }

    // Para ni sa Customer.
    // Kung gi-mark sa Staff nga resubmit ang ID, pwede ang customer mag-upload ug replacement.
    public function resubmitId(
        Request $request,
        Reservation $reservation
    ): JsonResponse {
        $user = $request->user();
        // I-check kung ang reservation iya gyud sa customer.
        if (
            !$user->customer ||
            $reservation->customer_id !==
            $user->customer->id
        ) {
            return response()->json([
                'message' =>
                'You are not authorized to resubmit IDs for this reservation.',
            ], 403);
        }
        $validated = $request->validate([
            'valid_id_front' => ['sometimes', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
            'valid_id_back' => ['sometimes',  'file', 'image', 'mimes:jpg,jpeg,png', 'max:5120',],
        ]);
        if (
            !$request->hasFile('valid_id_front') &&
            !$request->hasFile('valid_id_back')
        ) {
            return response()->json([
                'message' =>
                'At least one replacement ID image is required.',
            ], 422);
        }
        $updates = [
            'reservation_status' =>
            ReservationStatus::PENDING_RESERVATION->value,
        ];
        foreach (['front', 'back'] as $side) {
            $field = "valid_id_{$side}";
            if ($request->hasFile($field)) {
                // Dapat marked as resubmit ang ID before siya ilisan.
                if (
                    $reservation->{"valid_id_{$side}_status"}
                    !== 'resubmit'
                ) {
                    return response()->json([
                        'message' =>
                        "The {$side} ID is not marked for resubmission.",
                    ], 422);
                }
                $updates[$field] =
                    $request->file($field)
                    ->store('reservation_ids', 'public');
                $updates["{$field}_status"] = 'pending';
                $updates["{$field}_remarks"] = null;
            }
        }
        $reservation->update($updates);
        return response()->json([
            'message' =>
            'Replacement ID image(s) submitted successfully.',
            'data' => $reservation->fresh(),
        ], 200);
    }

    /**
     * UPDATE RESERVATION
     *
     * Mao ni ang main update function para sa Admin/Staff.
     * Pwede nila i-update ang reservation information
     * ug reservation status.
     */
    public function update(
        Request $request,
        Reservation $reservation,
        TransactionStatusService $statusService
    ): JsonResponse {

        $user = $request->user();

        // Customer dili pwede mo-update directly sa reservation.
        if ($user->customer) {
            return response()->json([
                'message' =>
                'Customers are not authorized to update reservations here.',
            ], 403);
        }

        $validated = $request->validate([
            'customer_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:customers,id',
            ],

            'vehicle_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:vehicles,id',
            ],

            'reserved_by_id' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'reservation_source' => [
                'sometimes',
                'required',
                Rule::in([
                    'online',
                    'walk_in',
                ]),
            ],

            'valid_id_type' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'valid_id_front' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'valid_id_back' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'purchase_option' => [
                'sometimes',
                'required',
                Rule::in([
                    'cash',
                    'financing',
                ]),
            ],

            'reservation_status' => [
                'sometimes',
                Rule::enum(
                    ReservationStatus::class
                ),
            ],

            'remarks' => [
                'nullable',
                'string',
            ],
        ]);

        if (array_key_exists('reservation_status', $validated)) {
            $reservation->historyNote = $validated['remarks'] ?? null;
        }

        $reservation->update($validated);

        // Synchronize Reservation Transaction

        $reservation->refresh();

        // I-sync ang vehicle status base sa reservation status.
        $statusService->syncVehicleFromReservation(
            $reservation
        );

        // Load Relationships

        $reservation->load([
            'customer.user',
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
            'reservedBy',
            'sale',
        ]);

        return response()->json([
            'message' =>
            'Reservation updated successfully.',
            'data' => $reservation,
        ], 200);
    }

    /**
     * ARCHIVE RESERVATION
     *
     * Dili permanent delete.
     * I-archive lang ang reservation record.
     */
    public function destroy(
        Request $request,
        Reservation $reservation
    ): JsonResponse {

        $user = $request->user();

        // Customer dili pwede mo-archive.
        if ($user->customer) {
            return response()->json([
                'message' =>
                'Customers are not authorized to archive reservations here.',
            ], 403);
        }

        // Dili pwede i-archive kung naa nay payment,
        // financing, or sale record.
        if (
            $reservation->payments()->exists() ||
            $reservation->financing()->exists() ||
            $reservation->sale()->exists()
        ) {
            return response()->json([
                'message' =>
                'This reservation cannot be archived because it already has payment, financing, or sales records.',
            ], 409);
        }

        $reservation->update([
            'archived' => 1,
        ]);

        return response()->json([
            'message' =>
            'Reservation archived successfully.',
        ], 200);
    }

    // GET /customer/valid-id — the ID the customer can reuse for a new reservation.
    public function validIdOnFile(Request $request): JsonResponse
    {
        $customer = $request->user()->customer;

        if (!$customer) {
            return response()->json(['message' => 'Customer profile not found.'], 404);
        }

        $reservation = $this->idOnFile($customer->id);

        return response()->json([
            'data' => $reservation ? [
                'valid_id_type' => $reservation->valid_id_type,
                'valid_id_front' => $reservation->valid_id_front,
                'valid_id_back' => $reservation->valid_id_back,
                'valid_id_front_status' => $reservation->valid_id_front_status,
                'valid_id_back_status' => $reservation->valid_id_back_status,
                'from_reservation_id' => $reservation->id,
            ] : null,
        ]);
    }

    // Latest reusable ID: neither side flagged for resubmission, approved ones first.
    private function idOnFile(int $customerId): ?Reservation
    {
        return Reservation::where('customer_id', $customerId)
            ->where('valid_id_front_status', '!=', 'resubmit')
            ->where('valid_id_back_status', '!=', 'resubmit')
            ->orderByRaw("(valid_id_front_status = 'approved' AND valid_id_back_status = 'approved') DESC")
            ->latest('id')
            ->first();
    }

    public function approve(Request $request, Reservation $reservation, TransactionStatusService $statusService): JsonResponse
    {
        if ($request->user()->customer) {
            return response()->json(['message' => 'Customers are not authorized to approve reservations.'], 403);
        }

        $validated = $request->validate(['note' => ['nullable', 'string', 'max:1000']]);
        $current = $reservation->reservation_status;
        $financing = $reservation->purchase_option === 'financing';

        $next = match ($current) {
            ReservationStatus::PENDING_RESERVATION, ReservationStatus::PENDING_DOCUMENTS => $financing ? ReservationStatus::PENDING_FINANCING : ReservationStatus::PENDING_PAYMENT,
            ReservationStatus::PENDING_FINANCING => ReservationStatus::PENDING_PAYMENT,
            default => null,
        };

        if (!$next) {
            return response()->json(['message' => 'This reservation has no approval step right now.'], 422);
        }

        if ($current === ReservationStatus::PENDING_RESERVATION && ($reservation->valid_id_front_status !== 'approved' || $reservation->valid_id_back_status !== 'approved')) {
            return response()->json(['message' => 'Approve both the front and back of the valid ID first.'], 422);
        }

        $reservation->historyAction = 'approved';
        $reservation->historyNote = $validated['note'] ?? null;
        $reservation->update(['reservation_status' => $next->value]);
        $statusService->syncVehicleFromReservation($reservation->fresh('vehicle'));

        $receiver = $reservation->customer?->user_id;
        if ($receiver) {
            [$title, $message, $type] = match ($next) {
                ReservationStatus::PENDING_FINANCING => ['Financing Reservation Verified', 'Your reservation payment method has been verified. Please comply with and submit the required financing documents.', 'financing'],
                default => $financing
                    ? ['Financing Approved', 'Your financing requirements were verified. Please proceed with the next payment step to continue your reservation.', 'payment']
                    : ['Reservation Approved', 'Your reservation was approved. Please pay the reservation fee to hold the vehicle.', 'payment'],
            };
            NotificationHelper::send($request->user()->id, $receiver, $title, $message, $type);
        }

        return response()->json([
            'message' => 'Reservation approved.',
            'data' => $this->freshReservation($reservation),
        ]);
    }

    public function reject(Request $request, Reservation $reservation, TransactionStatusService $statusService): JsonResponse
    {
        if ($request->user()->customer) {
            return response()->json(['message' => 'Customers are not authorized to reject reservations.'], 403);
        }

        $validated = $request->validate(['reason' => ['required', 'string', 'max:1000']]);

        if (in_array($reservation->reservation_status, [ReservationStatus::COMPLETED, ReservationStatus::REJECTED, ReservationStatus::CANCELLED, ReservationStatus::EXPIRED], true)) {
            return response()->json(['message' => 'This reservation can no longer be rejected.'], 422);
        }

        $reservation->historyAction = 'rejected';
        $reservation->historyNote = $validated['reason'];
        $reservation->update([
            'reservation_status' => ReservationStatus::REJECTED->value,
            'remarks' => $validated['reason'],
        ]);
        $statusService->syncVehicleFromReservation($reservation->fresh('vehicle'));

        if ($receiver = $reservation->customer?->user_id) {
            NotificationHelper::send($request->user()->id, $receiver, 'Reservation Rejected', "Your reservation was rejected. Reason: {$validated['reason']}", 'reservation');
        }

        return response()->json([
            'message' => 'Reservation rejected.',
            'data' => $this->freshReservation($reservation),
        ]);
    }

    private function freshReservation(Reservation $reservation): Reservation
    {
        return $reservation->fresh([
            'customer.user',
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
            'vehicle.images',
            'vehicle.specs',
            'reservedBy',
            'statusHistories.user:id,username,role_id',
            'statusHistories.user.role',
        ]);
    }
}
