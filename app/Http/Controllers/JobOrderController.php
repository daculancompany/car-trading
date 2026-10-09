<?php

namespace App\Http\Controllers;

use App\Helpers\NotificationHelper;
use App\Models\JobOrder;
use App\Models\JobOrderInspection;
use App\Models\JobOrderUpdate;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use App\Models\RequestService;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Concerns\LimitsFieldStaff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class JobOrderController extends Controller
{
    use LimitsFieldStaff;

    /**
     * JOB ORDER RELATIONSHIPS
     */
    private function jobOrderRelations(): array
    {
        return [
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
            'vehicle.images',
            'vehicle.specs',
            'requestService.vehicleRelease.sale.reservation.customer.user',
            'requestService.vehicleRelease.sale.reservation.vehicle.brand',
            'requestService.vehicleRelease.sale.reservation.vehicle.model',
            'requestService.vehicleRelease.sale.reservation.vehicle.variant',
            'assignedStaff.user.role',
            'creator',
            'partsUsed.vehiclePart',
            'inspection.inspector:id,username',
            'inspection.decider:id,username',
            'updates.user:id,username',
            'payments.receiver:id,username',
            'estimateResponder:id,username',
        ];
    }

    /**
     * GET ALL JOB ORDERS
     */
    public function index(): JsonResponse
    {
        $jobOrders = JobOrder::with(
            $this->jobOrderRelations()
        )
            ->when($this->fieldStaffId() !== null, fn($q) => $q->where('assigned_staff_id', $this->fieldStaffId()))
            ->where('archived', false)
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Job orders retrieved successfully.',
            'data' => $jobOrders,
        ], 200);
    }

    /**
     * CREATE JOB ORDER
     *
     * Supports:
     *
     * 1. Internal Admin Job Order
     * 2. Customer Request Service Job Order
     *
     * POST /api/job-orders
     */
    public function store(Request $request): JsonResponse
    {
        $this->ensureOfficeUser();

        $validated = $request->validate([
            'vehicle_id' => [
                'required',
                'integer',
                'exists:vehicles,id',
            ],

            'request_service_id' => [
                'nullable',
                'integer',
                'exists:request_services,id',
            ],

            'assigned_staff_id' => [
                'required',
                'integer',
                'exists:staffs,id',
            ],

            'work_type' => [
                'required',
                Rule::in([
                    'repair',
                    'maintenance',
                    'inspection',
                    'washing',
                    'detailing',
                    'other',
                ]),
            ],

            'description' => [
                'required',
                'string',
            ],

            'labor_cost' => ['nullable', 'numeric', 'min:0'],

            ...$this->detailRules(),
        ]);

        $jobOrder = DB::transaction(function () use (
            $validated,
            $request
        ) {
            $requestService = null;

            // OPTIONAL CUSTOMER REQUEST

            if (!empty($validated['request_service_id'])) {
                $requestService = RequestService::with([
                    'vehicleRelease',
                ])->findOrFail(
                    $validated['request_service_id']
                );

                // Request must be pending
                if ($requestService->status !== 'pending') {
                    abort(
                        409,
                        'This service request cannot be assigned.'
                    );
                }

                // Prevent duplicate job order
                if ($requestService->jobOrder()->exists()) {
                    abort(
                        409,
                        'This service request already has a job order.'
                    );
                }

                // Ensure request vehicle matches selected vehicle
                $requestVehicleId = optional(
                    $requestService->vehicleRelease?->sale?->reservation
                )->vehicle_id;

                if (
                    $requestVehicleId !== null &&
                    (int) $requestVehicleId !== (int) $validated['vehicle_id']
                ) {
                    abort(
                        409,
                        'The selected vehicle does not match the service request.'
                    );
                }
            }

            // GENERATE AUTOMATIC JOB ORDER NUMBER
            // Example: JO-2026-0001

            $year = now()->year;

            $latestJobOrder = JobOrder::where(
                'job_order_no',
                'like',
                "JO-{$year}-%"
            )
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();

            if ($latestJobOrder) {
                $lastNumber = (int) substr(
                    $latestJobOrder->job_order_no,
                    -4
                );

                $nextNumber = $lastNumber + 1;
            } else {
                $nextNumber = 1;
            }

            $jobOrderNo = sprintf(
                'JO-%d-%04d',
                $year,
                $nextNumber
            );

            // CREATE JOB ORDER

            $jobOrder = JobOrder::create([
                'vehicle_id' => $validated['vehicle_id'],

                'request_service_id' =>
                $validated['request_service_id'] ?? null,

                'assigned_staff_id' =>
                $validated['assigned_staff_id'],

                'created_by' =>
                $request->user()->id,

                'job_order_no' =>
                $jobOrderNo,

                'work_type' =>
                $validated['work_type'],

                'start_job' =>
                null,

                'finish_job' =>
                null,

                'description' =>
                $validated['description'],

                'labor_cost' => $validated['labor_cost'] ?? 0,

                ...collect($validated)->only(array_keys($this->detailRules()))->all(),

                'priority' => $validated['priority'] ?? 'normal',

                'status' =>
                'assigned',

                'archived' =>
                false,
            ]);

            // UPDATE CUSTOMER REQUEST STATUS

            if ($requestService) {
                $requestService->update([
                    'status' => 'assigned',
                ]);
            }

            return $jobOrder;
        });

        // LOAD RELATIONSHIPS

        $jobOrder->load(
            $this->jobOrderRelations()
        );

        return response()->json([
            'message' =>
            'Job order created and assigned successfully.',

            'data' =>
            $jobOrder,
        ], 201);
    }

    /**
     * GET ONE JOB ORDER
     */
    public function show(
        JobOrder $jobOrder
    ): JsonResponse {
        $this->ensureAssignedTo($jobOrder);


        $jobOrder->load(
            $this->jobOrderRelations()
        );

        return response()->json([

            'message' =>
            'Job order retrieved successfully.',

            'data' =>
            $jobOrder,

        ], 200);
    }

    /**
     * UPDATE JOB ORDER
     */
    public function update(
        Request $request,
        JobOrder $jobOrder
    ): JsonResponse {
        $this->ensureAssignedTo($jobOrder);

        // Field staff can only move their job forward and add notes.
        if ($this->fieldStaffId() !== null) {
            $request->replace($request->only(['status', 'description']));
            if ($request->filled('status') && !in_array($request->input('status'), ['in_progress', 'completed'], true)) {
                return response()->json(['message' => 'You can only start or finish a job.'], 422);
            }
        }


        // PREVENT EDITING COMPLETED / CANCELLED

        if (
            in_array(
                $jobOrder->status,
                [
                    'completed',
                    'cancelled',
                ]
            )
        ) {

            return response()->json([

                'message' =>
                'A completed or cancelled job order cannot be modified.',

            ], 409);
        }

        $validated = $request->validate([

            'start_job' => [
                'sometimes',
                'nullable',
                'date',
            ],

            'finish_job' => [
                'sometimes',
                'nullable',
                'date',
                'after_or_equal:start_job',
            ],

            'description' => [
                'sometimes',
                'required',
                'string',
            ],

            'labor_cost' => ['nullable', 'numeric', 'min:0'],

            ...$this->detailRules(),

            'status' => [
                'sometimes',
                Rule::in([
                    'assigned',
                    'in_progress',
                    'completed',
                    'cancelled',
                ]),
            ],

        ]);

        // STATUS RULES

        $newStatus =
            $validated['status']
            ?? $jobOrder->status;

        // CANNOT COMPLETE WITHOUT STARTING

        if (
            $newStatus === 'completed' &&
            !$jobOrder->start_job &&
            empty($validated['start_job'])
        ) {

            return response()->json([

                'message' =>
                'A job order must be started before it can be completed.',

            ], 422);
        }

        if (
            $newStatus === 'in_progress' &&
            $jobOrder->status !== 'in_progress' &&
            !$jobOrder->loadMissing('inspection')->canStart()
        ) {
            return response()->json([
                'message' => $jobOrder->startBlockReason(),
            ], 422);
        }

        // AUTOMATIC START DATE

        if (
            $newStatus === 'in_progress' &&
            !$jobOrder->start_job
        ) {

            $validated['start_job'] =
                now();
        }

        // AUTOMATIC FINISH DATE

        if (
            $newStatus === 'completed' &&
            !$jobOrder->finish_job
        ) {

            $validated['finish_job'] =
                now();
        }

        if ($newStatus === 'completed') {
            $validated['progress'] = 100;
            if (!$jobOrder->invoice_no) {
                $validated['invoice_no'] = $this->nextInvoiceNo();
                $validated['invoiced_at'] = now();
            }
        }

        // UPDATE JOB ORDER

        DB::transaction(function () use (
            $jobOrder,
            $validated,
            $newStatus
        ) {

            $jobOrder->update(
                $validated
            );

            // SYNCHRONIZE CUSTOMER REQUEST

            $requestService =
                $jobOrder->requestService;

            if ($requestService) {

                $requestService->update([

                    'status' =>
                    $newStatus,

                ]);
            }
        });

        if ($newStatus === 'completed' && $jobOrder->wasChanged('status')) {
            $this->notifyCustomer(
                $jobOrder,
                'Your vehicle is ready',
                "{$jobOrder->job_order_no} is done. Total: ₱" . number_format($jobOrder->fresh()->total_cost, 2) . '. Please rate our service once you pick it up.'
            );
        }

        // RETURN UPDATED DATA

        return response()->json([

            'message' =>
            'Job order updated successfully.',

            'data' =>
            $jobOrder->fresh(
                $this->jobOrderRelations()
            ),

        ], 200);
    }

    /**
     * ARCHIVE JOB ORDER
     */
    public function destroy(
        JobOrder $jobOrder
    ): JsonResponse {
        $this->ensureOfficeUser();


        // CANNOT ARCHIVE COMPLETED JOB

        if (
            $jobOrder->status === 'completed'
        ) {

            return response()->json([

                'message' =>
                'A completed job order cannot be archived.',

            ], 409);
        }

        // CANNOT ARCHIVE IF VEHICLE PARTS EXIST

        if (
            $jobOrder
            ->vehicleParts()
            ->exists()
        ) {

            return response()->json([

                'message' =>
                'This job order cannot be archived because it already has vehicle parts records.',

            ], 409);
        }

        // RETURN CUSTOMER REQUEST TO PENDING

        $requestService =
            $jobOrder->requestService;

        DB::transaction(function () use (
            $jobOrder,
            $requestService
        ) {

            if ($requestService) {

                $requestService->update([

                    'status' =>
                    'pending',

                ]);
            }

            // ARCHIVE JOB ORDER

            $jobOrder->update([

                'archived' =>
                true,

            ]);
        });

        return response()->json([

            'message' =>
            'Job order archived successfully.',

        ], 200);
    }

    private function detailRules(): array
    {
        return [
            'priority' => ['sometimes', Rule::in(['low', 'normal', 'high', 'urgent'])],
            'scheduled_at' => ['nullable', 'date'],
            'estimated_completion' => ['nullable', 'date', 'after_or_equal:scheduled_at'],
            'reported_problem' => ['nullable', 'string', 'max:5000'],
            'estimated_labor_cost' => ['nullable', 'numeric', 'min:0'],
            'odometer_in' => ['nullable', 'integer', 'min:0'],
            'fuel_level' => ['nullable', Rule::in(['empty', 'quarter', 'half', 'three_quarter', 'full'])],
            'personal_items' => ['nullable', 'string', 'max:2000'],
            'warranty_days' => ['nullable', 'integer', 'min:0', 'max:3650'],
            'warranty_km' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function saveInspection(Request $request, JobOrder $jobOrder): JsonResponse
    {
        $this->ensureAssignedTo($jobOrder);

        if (!in_array($jobOrder->status, ['pending', 'assigned'], true)) {
            return response()->json([
                'message' => 'The inspection can only be changed before the job starts.',
            ], 409);
        }

        foreach (['checklist', 'pre_checks', 'tires', 'brakes', 'damage_marks', 'recommended_services'] as $jsonField) {
            if (is_string($request->input($jsonField))) {
                $request->merge([$jsonField => json_decode($request->input($jsonField), true) ?? []]);
            }
        }

        $validated = $request->validate([
            'result' => ['required', Rule::in(JobOrderInspection::RESULTS)],
            'findings' => ['required', 'string', 'max:5000'],
            'recommendation' => ['nullable', 'string', 'max:5000'],
            'odometer' => ['nullable', 'integer', 'min:0'],
            'checklist' => ['nullable', 'array'],
            'checklist.*.item' => ['required', 'string', 'max:100'],
            'checklist.*.status' => ['required', Rule::in(JobOrderInspection::CHECK_STATUSES)],
            'checklist.*.note' => ['nullable', 'string', 'max:1000'],
            'checklist.*.section' => ['nullable', 'string', 'max:100'],
            'fuel_level' => ['nullable', 'string', 'max:20'],
            'pre_checks' => ['nullable', 'array'],
            'pre_checks.*' => ['boolean'],
            'tires' => ['nullable', 'array'],
            'tires.size' => ['nullable', 'string', 'max:50'],
            'tires.spare_ok' => ['nullable', 'boolean'],
            'tires.wheels' => ['nullable', 'array'],
            'tires.wheels.*.psi' => ['nullable', 'numeric', 'min:0', 'max:150'],
            'tires.wheels.*.tread_mm' => ['nullable', 'numeric', 'min:0', 'max:30'],
            'tires.wheels.*.status' => ['nullable', Rule::in(JobOrderInspection::CHECK_STATUSES)],
            'brakes' => ['nullable', 'array'],
            'brakes.*.pad_mm' => ['nullable', 'numeric', 'min:0', 'max:30'],
            'brakes.*.status' => ['nullable', Rule::in(JobOrderInspection::CHECK_STATUSES)],
            'damage_marks' => ['nullable', 'array', 'max:40'],
            'damage_marks.*.no' => ['required', 'integer', 'min:1'],
            'damage_marks.*.view' => ['required', Rule::in(JobOrderInspection::DAMAGE_VIEWS)],
            'damage_marks.*.x' => ['required', 'numeric', 'between:0,100'],
            'damage_marks.*.y' => ['required', 'numeric', 'between:0,100'],
            'damage_marks.*.type' => ['required', Rule::in(JobOrderInspection::DAMAGE_TYPES)],
            'damage_marks.*.severity' => ['required', Rule::in(['attention', 'urgent'])],
            'damage_marks.*.note' => ['nullable', 'string', 'max:500'],
            'recommended_services' => ['nullable', 'array'],
            'recommended_services.*' => ['string', 'max:60'],
            'next_service_date' => ['nullable', 'date'],
            'service_required' => ['nullable', 'string', 'max:255'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'keep_photos' => ['nullable', 'array'],
            'keep_photos.*' => ['string'],
            'photos' => ['nullable', 'array', 'max:20'],
            'photos.*' => ['image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'photo_items' => ['nullable', 'array'],
            'photo_items.*' => ['nullable', 'string', 'max:100'],
            'photo_captions' => ['nullable', 'array'],
            'photo_captions.*' => ['nullable', 'string', 'max:255'],
        ]);

        $existing = $jobOrder->inspection;
        $keep = collect($validated['keep_photos'] ?? []);

        $kept = collect($existing?->photos ?? [])
            ->filter(fn ($photo) => $keep->contains($photo['path']));

        collect($existing?->photos ?? [])
            ->reject(fn ($photo) => $keep->contains($photo['path']))
            ->each(fn ($photo) => Storage::disk('public')->delete($photo['path']));

        $uploaded = collect($request->file('photos', []))
            ->values()
            ->map(fn ($file, $index) => [
                'path' => $file->store('job-order-inspections/' . $jobOrder->id, 'public'),
                'item' => $validated['photo_items'][$index] ?? null,
                'caption' => $validated['photo_captions'][$index] ?? null,
            ]);

        $inspection = JobOrderInspection::updateOrCreate(
            ['job_order_id' => $jobOrder->id],
            [
                'inspected_by' => $request->user()->id,
                'inspected_at' => now(),
                'odometer' => $validated['odometer'] ?? null,
                'result' => $validated['result'],
                'findings' => $validated['findings'],
                'recommendation' => $validated['recommendation'] ?? null,
                'checklist' => array_values($validated['checklist'] ?? []),
                'photos' => $kept->merge($uploaded)->values()->all(),
                'fuel_level' => $validated['fuel_level'] ?? null,
                'pre_checks' => $validated['pre_checks'] ?? null,
                'tires' => $validated['tires'] ?? null,
                'brakes' => $validated['brakes'] ?? null,
                'damage_marks' => array_values($validated['damage_marks'] ?? []),
                'recommended_services' => array_values($validated['recommended_services'] ?? []),
                'next_service_date' => $validated['next_service_date'] ?? null,
                'service_required' => $validated['service_required'] ?? null,
                'estimated_cost' => $validated['estimated_cost'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'office_decision' => null,
                'decided_by' => null,
                'decided_at' => null,
                'decision_note' => null,
            ]
        );

        if ($inspection->result === 'not_found') {
            User::whereHas('role', fn ($query) => $query->whereIn('name', ['Admin', 'Secretary']))
                ->where('id', '!=', $request->user()->id)
                ->get()
                ->each(fn ($user) => NotificationHelper::send(
                    senderUserId: $request->user()->id,
                    receiverUserId: $user->id,
                    title: 'Inspection: complaint not found',
                    message: "No problem was found on {$jobOrder->job_order_no}. Decide whether to proceed or cancel the job.",
                    notificationType: 'job_order'
                ));
        }

        return response()->json([
            'message' => 'Inspection saved successfully.',
            'data' => $jobOrder->fresh($this->jobOrderRelations()),
        ], 200);
    }

    public function decideInspection(Request $request, JobOrder $jobOrder): JsonResponse
    {
        $this->ensureOfficeUser();

        $validated = $request->validate([
            'decision' => ['required', Rule::in(['proceed', 'cancel'])],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $inspection = $jobOrder->inspection;

        if (!$inspection || $inspection->result !== 'not_found') {
            return response()->json([
                'message' => 'Only an inspection that found no problem needs a decision.',
            ], 409);
        }

        if (in_array($jobOrder->status, ['completed', 'cancelled'], true)) {
            return response()->json([
                'message' => 'This job order is already closed.',
            ], 409);
        }

        DB::transaction(function () use ($jobOrder, $inspection, $validated, $request) {
            $inspection->update([
                'office_decision' => $validated['decision'],
                'decided_by' => $request->user()->id,
                'decided_at' => now(),
                'decision_note' => $validated['note'] ?? null,
            ]);

            if ($validated['decision'] === 'cancel') {
                $jobOrder->update(['status' => 'cancelled']);
                $jobOrder->requestService?->update(['status' => 'cancelled']);
            }
        });

        return response()->json([
            'message' => $validated['decision'] === 'cancel'
                ? 'Job order cancelled.'
                : 'Work can now start on this job order.',
            'data' => $jobOrder->fresh($this->jobOrderRelations()),
        ], 200);
    }

    public function addUpdate(Request $request, JobOrder $jobOrder): JsonResponse
    {
        $this->ensureAssignedTo($jobOrder);

        if ($jobOrder->status !== 'in_progress') {
            return response()->json([
                'message' => 'Progress can only be posted while the job is in progress.',
            ], 409);
        }

        $validated = $request->validate([
            'progress' => ['required', 'integer', 'min:0', 'max:100'],
            'comment' => ['required', 'string', 'max:5000'],
            'photos' => ['nullable', 'array', 'max:10'],
            'photos.*' => ['image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ]);

        $paths = collect($request->file('photos', []))
            ->map(fn ($file) => $file->store('job-order-updates/' . $jobOrder->id, 'public'))
            ->values()
            ->all();

        DB::transaction(function () use ($jobOrder, $validated, $paths, $request) {
            JobOrderUpdate::create([
                'job_order_id' => $jobOrder->id,
                'user_id' => $request->user()->id,
                'progress' => $validated['progress'],
                'comment' => $validated['comment'],
                'photos' => $paths,
            ]);

            $jobOrder->update(['progress' => $validated['progress']]);
        });

        return response()->json([
            'message' => 'Progress update posted.',
            'data' => $jobOrder->fresh($this->jobOrderRelations()),
        ], 201);
    }

    public function inspectionPdf(Request $request, JobOrder $jobOrder)
    {
        $user = $request->user();

        if ($user->customer) {
            $ownerId = $jobOrder->requestService?->vehicleRelease?->sale?->reservation?->customer_id;
            abort_if($ownerId !== $user->customer->id, 403, 'You are not allowed to view this inspection.');
        } else {
            abort_unless($user->role && in_array(strtolower($user->role->name), ['admin', 'secretary', 'mechanic', 'washer'], true), 403);
            $this->ensureAssignedTo($jobOrder);
        }

        $jobOrder->load([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
            'vehicle.specs',
            'assignedStaff',
            'requestService.vehicleRelease.sale.reservation.customer',
            'inspection.inspector',
        ]);

        $inspection = $jobOrder->inspection;
        abort_unless($inspection, 404, 'This job order has no inspection yet.');

        $template = json_decode(file_get_contents(resource_path('js/components/Admin/JobOrders/inspectionTemplate.json')), true);

        $checks = collect($inspection->checklist ?? [])
            ->mapWithKeys(fn ($entry) => [$entry['item'] => [
                'status' => JobOrderInspection::normalizeStatus($entry['status'] ?? null),
                'note' => $entry['note'] ?? null,
            ]]);

        $templateItems = collect($template['sections'])->flatMap(fn ($section) => $section['items']);
        $extraItems = $checks->keys()->reject(fn ($item) => $templateItems->contains($item))->values();
        if ($extraItems->isNotEmpty()) {
            $template['sections'][] = ['key' => 'other', 'title' => 'General', 'color' => 'gray', 'items' => $extraItems->all()];
        }

        $customer = $jobOrder->requestService?->vehicleRelease?->sale?->reservation?->customer;
        $vehicle = $jobOrder->vehicle;

        $marks = collect($inspection->damage_marks ?? []);
        $diagrams = collect(JobOrderInspection::DAMAGE_VIEWS)
            ->mapWithKeys(fn ($view) => [$view => $this->diagramImage($view, $marks->where('view', $view)->values()->all())]);

        $pdf = Pdf::loadView('job-orders.inspection', [
            'diagrams' => $diagrams,
            'jobOrder' => $jobOrder,
            'inspection' => $inspection,
            'template' => $template,
            'checks' => $checks,
            'customerName' => $customer ? trim("{$customer->first_name} {$customer->last_name}") : 'Shop job',
            'vehicleName' => trim(implode(' ', array_filter([$vehicle?->year_model, $vehicle?->brand?->brand, $vehicle?->model?->model, $vehicle?->variant?->variant]))),
            'mechanicName' => trim(($jobOrder->assignedStaff?->first_name ?? '') . ' ' . ($jobOrder->assignedStaff?->last_name ?? '')) ?: ($inspection->inspector?->username ?? '—'),
        ])->setPaper('a4', 'portrait');

        return $pdf->download("inspection-{$jobOrder->job_order_no}.pdf");
    }

    private function customerOwnerId(JobOrder $jobOrder): ?int
    {
        return $jobOrder->requestService?->vehicleRelease?->sale?->reservation?->customer_id;
    }

    private function customerUserId(JobOrder $jobOrder): ?int
    {
        return $jobOrder->requestService?->vehicleRelease?->sale?->reservation?->customer?->user_id;
    }

    private function ensureCanView(Request $request, JobOrder $jobOrder): void
    {
        $user = $request->user();

        if ($user->customer) {
            abort_if($this->customerOwnerId($jobOrder) !== $user->customer->id, 403, 'You are not allowed to view this job order.');

            return;
        }

        abort_unless($user->role && in_array(strtolower($user->role->name), ['admin', 'secretary', 'mechanic', 'washer'], true), 403);
        $this->ensureAssignedTo($jobOrder);
    }

    private function notifyCustomer(JobOrder $jobOrder, string $title, string $message): void
    {
        if ($receiver = $this->customerUserId($jobOrder)) {
            NotificationHelper::send(request()->user()?->id, $receiver, $title, $message, 'service');
        }
    }

    private function notifyOffice(string $title, string $message): void
    {
        User::whereHas('role', fn ($query) => $query->whereIn('name', ['Admin', 'Secretary']))
            ->where('id', '!=', request()->user()?->id)
            ->get()
            ->each(fn ($user) => NotificationHelper::send(request()->user()?->id, $user->id, $title, $message, 'job_order'));
    }

    private function nextInvoiceNo(): string
    {
        $year = now()->year;
        $last = JobOrder::where('invoice_no', 'like', "SI-{$year}-%")->orderByDesc('invoice_no')->value('invoice_no');
        $next = $last ? ((int) substr($last, -4)) + 1 : 1;

        return sprintf('SI-%d-%04d', $year, $next);
    }

    public function sendEstimate(Request $request, JobOrder $jobOrder): JsonResponse
    {
        $this->ensureOfficeUser();

        if (!in_array($jobOrder->status, ['pending', 'assigned'], true)) {
            return response()->json(['message' => 'An estimate can only be sent before the job starts.'], 409);
        }

        if ($jobOrder->requires_inspection && !$jobOrder->inspection) {
            return response()->json(['message' => 'Inspect the vehicle first, then send the estimate.'], 422);
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:3000'],
        ]);

        $jobOrder->update([
            'estimate_status' => 'pending',
            'estimate_amount' => $validated['amount'],
            'estimate_note' => $validated['note'] ?? null,
            'estimate_sent_at' => now(),
            'estimate_responded_at' => null,
            'estimate_response_note' => null,
            'estimate_responded_by' => null,
        ]);

        $this->notifyCustomer(
            $jobOrder,
            'Estimate ready for approval',
            "We inspected your vehicle ({$jobOrder->job_order_no}). Estimated cost: ₱" . number_format((float) $validated['amount'], 2) . '. Please approve or decline in My Service Requests.'
        );

        return response()->json([
            'message' => 'Estimate sent to the customer.',
            'data' => $jobOrder->fresh($this->jobOrderRelations()),
        ]);
    }

    public function respondEstimate(Request $request, JobOrder $jobOrder): JsonResponse
    {
        $user = $request->user();
        $jobOrder->loadMissing('requestService.vehicleRelease.sale.reservation.customer');

        if ($user->customer) {
            abort_if($this->customerOwnerId($jobOrder) !== $user->customer->id, 403, 'You are not allowed to respond to this estimate.');
        } else {
            $this->ensureOfficeUser();
        }

        if ($jobOrder->estimate_status !== 'pending') {
            return response()->json(['message' => 'There is no estimate waiting for a response.'], 409);
        }

        $validated = $request->validate([
            'decision' => ['required', Rule::in(['approve', 'decline'])],
            'note' => [$request->input('decision') === 'decline' ? 'required' : 'nullable', 'string', 'max:2000'],
        ]);

        $approved = $validated['decision'] === 'approve';
        $by = $user->customer ? 'the customer' : "{$user->username} on behalf of the customer";

        $jobOrder->update([
            'estimate_status' => $approved ? 'approved' : 'declined',
            'estimate_responded_at' => now(),
            'estimate_response_note' => $validated['note'] ?? null,
            'estimate_responded_by' => $user->id,
        ]);

        $this->notifyOffice(
            $approved ? 'Estimate approved' : 'Estimate declined',
            "{$jobOrder->job_order_no}: estimate " . ($approved ? 'approved' : 'declined') . " by {$by}." . (!empty($validated['note']) ? " Note: {$validated['note']}" : '')
        );

        if ($approved && $jobOrder->assignedStaff?->user_id) {
            NotificationHelper::send($user->id, $jobOrder->assignedStaff->user_id, 'Job ready to start', "{$jobOrder->job_order_no}: the customer approved the estimate. You can start the work.", 'job_order');
        }

        return response()->json([
            'message' => $approved ? 'Estimate approved.' : 'Estimate declined.',
            'data' => $jobOrder->fresh($this->jobOrderRelations()),
        ]);
    }

    public function storePayment(Request $request, JobOrder $jobOrder): JsonResponse
    {
        $this->ensureOfficeUser();

        if ($jobOrder->status !== 'completed') {
            return response()->json(['message' => 'Record payments after the job is completed.'], 409);
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'method' => ['required', Rule::in(\App\Models\JobOrderPayment::METHODS)],
            'reference_no' => [Rule::requiredIf(fn () => in_array($request->input('method'), ['gcash', 'bank_transfer', 'card'], true)), 'nullable', 'string', 'max:100'],
            'paid_at' => ['nullable', 'date'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $balance = $jobOrder->balance;
        if ($validated['amount'] > $balance + 0.009) {
            return response()->json(['message' => 'The amount is more than the remaining balance of ₱' . number_format($balance, 2) . '.'], 422);
        }

        $jobOrder->payments()->create([
            ...$validated,
            'paid_at' => $validated['paid_at'] ?? now(),
            'received_by' => $request->user()->id,
        ]);

        $fresh = $jobOrder->fresh($this->jobOrderRelations());

        if ($fresh->payment_status === 'paid') {
            $this->notifyCustomer($fresh, 'Payment received', "Thank you! {$fresh->job_order_no} ({$fresh->invoice_no}) is fully paid.");
        }

        return response()->json([
            'message' => 'Payment recorded.',
            'data' => $fresh,
        ], 201);
    }

    public function destroyPayment(JobOrder $jobOrder, \App\Models\JobOrderPayment $payment): JsonResponse
    {
        $this->ensureOfficeUser();
        abort_if($payment->job_order_id !== $jobOrder->id, 404);
        $payment->delete();

        return response()->json([
            'message' => 'Payment removed.',
            'data' => $jobOrder->fresh($this->jobOrderRelations()),
        ]);
    }

    public function updateWarranty(Request $request, JobOrder $jobOrder): JsonResponse
    {
        $this->ensureOfficeUser();

        $validated = $request->validate([
            'warranty_days' => ['nullable', 'integer', 'min:0', 'max:3650'],
            'warranty_km' => ['nullable', 'integer', 'min:0'],
        ]);

        $jobOrder->update($validated);

        return response()->json([
            'message' => 'Warranty updated.',
            'data' => $jobOrder->fresh($this->jobOrderRelations()),
        ]);
    }

    public function feedback(Request $request, JobOrder $jobOrder): JsonResponse
    {
        $user = $request->user();
        $jobOrder->loadMissing('requestService.vehicleRelease.sale.reservation.customer');
        abort_unless($user->customer && $this->customerOwnerId($jobOrder) === $user->customer->id, 403, 'Only the customer can rate this job.');

        if ($jobOrder->status !== 'completed') {
            return response()->json(['message' => 'You can rate the service once the job is completed.'], 409);
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'feedback' => ['nullable', 'string', 'max:2000'],
        ]);

        $jobOrder->update([...$validated, 'rated_at' => now()]);

        $this->notifyOffice('New service rating', "{$jobOrder->job_order_no} was rated {$validated['rating']}/5" . (!empty($validated['feedback']) ? ": \"{$validated['feedback']}\"" : '.'));

        return response()->json([
            'message' => 'Thank you for your feedback!',
            'data' => $jobOrder->fresh($this->jobOrderRelations()),
        ]);
    }

    public function invoicePdf(Request $request, JobOrder $jobOrder)
    {
        $jobOrder->load([
            ...$this->jobOrderRelations(),
        ]);
        $this->ensureCanView($request, $jobOrder);

        if ($jobOrder->status !== 'completed') {
            abort(409, 'The invoice is available once the job is completed.');
        }

        if (!$jobOrder->invoice_no) {
            $jobOrder->update(['invoice_no' => $this->nextInvoiceNo(), 'invoiced_at' => $jobOrder->finish_job ?? now()]);
        }

        $customer = $jobOrder->requestService?->vehicleRelease?->sale?->reservation?->customer;
        $vehicle = $jobOrder->vehicle;

        return Pdf::loadView('job-orders.invoice', [
            'jobOrder' => $jobOrder,
            'customer' => $customer,
            'vehicleName' => trim(implode(' ', array_filter([$vehicle?->year_model, $vehicle?->brand?->brand, $vehicle?->model?->model, $vehicle?->variant?->variant]))),
            'mechanicName' => trim(($jobOrder->assignedStaff?->first_name ?? '') . ' ' . ($jobOrder->assignedStaff?->last_name ?? '')) ?: '—',
        ])->setPaper('a4', 'portrait')->download("invoice-{$jobOrder->invoice_no}.pdf");
    }

    public function serviceReminders(Request $request): JsonResponse
    {
        $this->ensureOfficeUser();

        $days = (int) $request->query('days', 30);

        $rows = JobOrderInspection::query()
            ->whereNotNull('next_service_date')
            ->whereDate('next_service_date', '<=', now()->addDays($days))
            ->whereHas('jobOrder', fn ($query) => $query->where('status', 'completed'))
            ->with([
                'jobOrder:id,job_order_no,vehicle_id,request_service_id,finish_job',
                'jobOrder.vehicle:id,stock_no,year_model,brand_id,model_id',
                'jobOrder.vehicle.brand:id,brand',
                'jobOrder.vehicle.model:id,model',
                'jobOrder.vehicle.specs',
                'jobOrder.requestService.vehicleRelease.sale.reservation.customer',
            ])
            ->orderBy('next_service_date')
            ->get()
            ->reject(fn ($inspection) => \App\Services\ServiceReminderService::hasNewerJob($inspection))
            ->map(fn ($inspection) => [
                'inspection_id' => $inspection->id,
                'job_order_id' => $inspection->job_order_id,
                'job_order_no' => $inspection->jobOrder?->job_order_no,
                'next_service_date' => $inspection->next_service_date?->toDateString(),
                'days_left' => (int) now()->startOfDay()->diffInDays($inspection->next_service_date, false),
                'service_required' => $inspection->service_required,
                'recommended_services' => $inspection->recommended_services ?? [],
                'reminder_sent_at' => $inspection->reminder_sent_at,
                'vehicle' => $inspection->jobOrder?->vehicle,
                'customer' => $inspection->jobOrder?->requestService?->vehicleRelease?->sale?->reservation?->customer,
            ])
            ->values();

        return response()->json(['data' => $rows]);
    }

    public function sendReminder(JobOrderInspection $inspection): JsonResponse
    {
        $this->ensureOfficeUser();
        $sent = \App\Services\ServiceReminderService::remind($inspection, request()->user()?->id);

        return response()->json(
            ['message' => $sent ? 'Reminder sent to the customer.' : 'This vehicle has no customer account to notify.'],
            $sent ? 200 : 422
        );
    }

    private function diagramImage(string $view, array $marks): string
    {
        $path = public_path("images/inspection/car-{$view}.png");
        $image = imagecreatefrompng($path);
        imagesavealpha($image, true);
        $width = imagesx($image);
        $height = imagesy($image);
        $font = base_path('vendor/dompdf/dompdf/lib/fonts/DejaVuSans-Bold.ttf');
        $white = imagecolorallocate($image, 255, 255, 255);
        $palette = [
            'attention' => imagecolorallocate($image, 214, 158, 46),
            'urgent' => imagecolorallocate($image, 229, 62, 62),
        ];
        $radius = (int) round($width * 0.032);

        foreach ($marks as $mark) {
            $x = (int) round($width * $mark['x'] / 100);
            $y = (int) round($height * $mark['y'] / 100);
            imagefilledellipse($image, $x, $y, $radius * 2 + 6, $radius * 2 + 6, $white);
            imagefilledellipse($image, $x, $y, $radius * 2, $radius * 2, $palette[$mark['severity']] ?? $palette['urgent']);
            $label = (string) $mark['no'];
            $size = $radius * 0.95;
            $box = imagettfbbox($size, 0, $font, $label);
            $textWidth = $box[2] - $box[0];
            $textHeight = $box[1] - $box[7];
            imagettftext($image, $size, 0, (int) ($x - $textWidth / 2 - $box[0]), (int) ($y + $textHeight / 2), $white, $font, $label);
        }

        ob_start();
        imagepng($image);
        $data = ob_get_clean();
        imagedestroy($image);

        return 'data:image/png;base64,' . base64_encode($data);
    }
}
