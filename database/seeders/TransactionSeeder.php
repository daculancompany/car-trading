<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\FinancingDocument;
use App\Models\FinancingInfo;
use App\Models\FinancingRequirement;
use App\Models\JobOrder;
use App\Models\Message;
use App\Models\Notification;
use App\Models\PartsUsed;
use App\Models\Payment;
use App\Models\PaymentAccount;
use App\Models\RequestService;
use App\Models\Reservation;
use App\Models\Sale;
use App\Models\Staff;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehiclePart;
use App\Models\VehicleRelease;
use Carbon\Carbon;
use Database\Seeders\Support\PlaceholderImage;
use Illuminate\Database\Seeder;

/**
 * One story per customer so every screen has something realistic to show:
 *
 *  customer1  cash buyer, car released, one finished + one ongoing service (tire job)
 *  customer2  financing approved, waiting for the bank's release  -> pending collection
 *  customer3  cash, walk-in, downpayment sent but not yet verified -> pending collection
 *  customer4  new online reservation waiting for ID review (+ an older cancelled one)
 *  customer5  financing, documents incomplete, one ID side needs resubmission
 *  customer6  financed and released, PMS request not yet assigned
 *
 * Meant to run on a fresh database (migrate:fresh --seed).
 */
class TransactionSeeder extends Seeder
{
    private User $admin;
    private User $secretary;
    private array $accounts;

    public function run(): void
    {
        $this->admin = User::where('username', 'admin')->firstOrFail();
        $this->secretary = User::where('username', 'secretary')->firstOrFail();
        $this->accounts = PaymentAccount::pluck('id', 'account_provider')->all();

        $c = fn(string $username) => Customer::whereHas('user', fn($q) => $q->where('username', $username))->firstOrFail();
        $v = fn(string $stockNo) => Vehicle::where('stock_no', $stockNo)->firstOrFail();

        $now = now()->startOfHour();

        // customer1 — 2019 Vios, cash, released
        $juan = $c('customer1');
        $vios = $v('ST-2026-0001');
        $r1 = $this->reservation($juan, $vios, 'cash', 'online', $now->copy()->subDays(62), 'completed', "Driver's License");
        $s1 = $this->sale($r1, 'INV-2026-0001', $now->copy()->subDays(55), 10000, 'completed');
        $this->payment($r1, $s1, 'reservation_fee', 'gcash', 10000, 'verified', $now->copy()->subDays(62), '5012 884 210331');
        $this->payment($r1, $s1, 'full_payment', 'cash', 525000, 'verified', $now->copy()->subDays(56));
        $rel1 = $this->release($s1, $now->copy()->subDays(54), 1);
        $vios->update(['status' => 'sold']);

        // customer6 — 2020 Montero Sport, financed, released this month
        // (kept inside the current month so the dashboard's monthly figures have data)
        $lyka = $c('customer6');
        $montero = $v('ST-2026-0002');
        $saleAt = $now->copy()->subDays(4)->max($now->copy()->startOfMonth()->setTime(9, 0));
        $releaseAt = $saleAt->copy()->addHours(20)->min($now->copy()->subHours(2));
        $r2 = $this->reservation($lyka, $montero, 'financing', 'online', $saleAt->copy()->subDays(16), 'completed', 'PhilSys ID');
        $f2 = $this->financing($r2, 'BDO Unibank - Auto Loans', 'Mylene Sabado', 944000, 23450, 48, 'completed', 'BDO-AL-2026-08817');
        $this->financingDocuments($f2, $lyka, 'verified');
        $s2 = $this->sale($r2, 'INV-2026-0002', $saleAt, 0, 'completed');
        $this->payment($r2, $s2, 'reservation_fee', 'gcash', 20000, 'verified', $saleAt->copy()->subDays(16), '5012 884 377120');
        $this->payment($r2, $s2, 'partial_payment', 'bank_transfer', 216000, 'verified', $saleAt->copy()->subDays(9), 'BDO-FT-60331872', 'Downpayment (20%)');
        $this->payment($r2, $s2, 'financing_release', 'bank_transfer', 944000, 'verified', $saleAt->copy()->subDays(1), 'BDO-LR-2026-08817', 'Loan proceeds from BDO', $f2);
        $rel2 = $this->release($s2, $releaseAt, 1);
        $montero->update(['status' => 'sold']);

        // customer2 — 2018 Innova, financing approved, bank release pending
        $maricel = $c('customer2');
        $innova = $v('ST-2026-0003');
        $r3 = $this->reservation($maricel, $innova, 'financing', 'online', $now->copy()->subDays(21), 'reserved', 'PhilSys ID');
        $f3 = $this->financing($r3, 'Security Bank - Auto Loan', 'Francis Uy', 624000, 21890, 36, 'approved', 'SBC-AUTO-77120');
        $this->financingDocuments($f3, $maricel, 'verified');
        $s3 = $this->sale($r3, 'INV-2026-0003', $now->copy()->subDays(9), 0, 'pending');
        $this->payment($r3, $s3, 'reservation_fee', 'maya', 15000, 'verified', $now->copy()->subDays(21), 'MAYA-88213009');
        $this->payment($r3, $s3, 'partial_payment', 'gcash', 141000, 'verified', $now->copy()->subDays(12), '5012 884 501226', 'Downpayment');
        $this->payment($r3, $s3, 'financing_release', 'bank_transfer', 624000, 'pending', $now->copy()->subDays(1), 'SBC-LR-2026-77120', 'Bank says funds released, waiting for it to reflect', $f3);
        $innova->update(['status' => 'reserved']);

        // customer3 — 2021 City, walk-in cash, payment awaiting verification
        // + an older reservation on the Xpander that expired
        $dennis = $c('customer3');
        $xpander = $v('ST-2026-0010');
        $this->reservation($dennis, $xpander, 'cash', 'online', $now->copy()->subDays(30), 'expired', 'Postal ID');

        $city = $v('ST-2026-0004');
        $r4 = $this->reservation($dennis, $city, 'cash', 'walk_in', $now->copy()->subDays(4), 'pending_payment', 'Postal ID', reservedBy: $this->secretary);
        $s4 = $this->sale($r4, 'INV-2026-0004', $now->copy()->subDays(3), 5000, 'pending');
        $this->payment($r4, $s4, 'reservation_fee', 'cash', 15000, 'verified', $now->copy()->subDays(4), null, 'Paid at the lot');
        $this->payment($r4, $s4, 'partial_payment', 'gcash', 50000, 'rejected', $now->copy()->subDays(3), '5012 884 600019', 'Reference number not found in GCash history. Please re-send the correct receipt.');
        $this->payment($r4, $s4, 'partial_payment', 'gcash', 200000, 'pending', $now->copy()->subHours(20), '5012 884 600347');
        $city->update(['status' => 'unavailable']);

        // customer4 — new reservation awaiting ID review; earlier one cancelled
        $angelica = $c('customer4');
        $this->reservation($angelica, $v('ST-2026-0007'), 'cash', 'online', $now->copy()->subDays(34), 'cancelled', "Voter's ID", remarks: 'Customer decided to look for an automatic unit.');
        $mirage = $v('ST-2026-0005');
        $this->reservation($angelica, $mirage, 'cash', 'online', $now->copy()->subDays(1), 'pending_reservation', "Driver's License", idStatus: ['pending', 'pending']);
        $mirage->update(['status' => 'unavailable']);

        // customer5 — Navara on financing, documents incomplete
        $roberto = $c('customer5');
        $navara = $v('ST-2026-0006');
        $r6 = $this->reservation($roberto, $navara, 'financing', 'online', $now->copy()->subDays(3), 'pending_documents', 'PRC ID', idStatus: ['approved', 'resubmit'], idRemarks: [null, 'Back photo is blurry. Please retake it in better light.']);
        $f6 = $this->financing($r6, 'PSBank - Auto Loan', 'Hazel Ong', 716000, 24360, 36, 'pending', null);
        $this->financingDocuments($f6, $roberto, 'partial');
        $navara->update(['status' => 'unavailable']);

        // After-sales service
        $mech1 = Staff::whereHas('user', fn($q) => $q->where('username', 'mechanic1'))->firstOrFail();
        $mech2 = Staff::whereHas('user', fn($q) => $q->where('username', 'mechanic2'))->firstOrFail();
        $washer = Staff::whereHas('user', fn($q) => $q->where('username', 'washer'))->firstOrFail();

        $sr1 = $this->serviceRequest($rel1, 'SR-' . $now->copy()->subDays(30)->format('Ymd') . '-4821', 'First change oil after buying. Also please check the rattling sound from the dashboard when passing rough roads.', $now->copy()->subDays(28), 'completed', $now->copy()->subDays(30));
        $jo1 = $this->jobOrder($vios, $sr1, $mech1, 'JO-2026-0001', 'maintenance', 'Change oil and filter. Tightened loose dashboard trim clip.', 1200, 'completed', $now->copy()->subDays(28)->setTime(8, 30), $now->copy()->subDays(28)->setTime(11, 45));
        $this->partUsed($jo1, 'Engine Oil', 4, $now->copy()->subDays(28));
        $this->partUsed($jo1, 'Oil Filter', 1, $now->copy()->subDays(28));

        $sr2 = $this->serviceRequest($rel1, 'SR-' . $now->copy()->subDays(3)->format('Ymd') . '-1307', 'Front-left tire keeps losing air and the car pulls to the right. Please replace the front tires if needed and check the alignment.', $now->copy()->subDays(1), 'in_progress', $now->copy()->subDays(3));
        $jo2 = $this->jobOrder($vios, $sr2, $mech2, 'JO-2026-0002', 'repair', 'Replace both front tires (sidewall bulge on left). Wheel alignment to follow.', 800, 'in_progress', $now->copy()->subDays(1)->setTime(9, 0), null);
        $this->partUsed($jo2, 'Tire 185/65 R15', 2, $now->copy()->subDays(1));

        $this->serviceRequest($rel2, 'SR-' . $releaseAt->format('Ymd') . '-5590', 'Brakes squeak when stopping, especially in the morning. Please check before our trip to Bukidnon.', $now->copy()->addDays(3), 'pending', $releaseAt->copy()->addHour());

        // Internal shop work (not from a customer request)
        $brv = $v('ST-2026-0011');
        $this->jobOrder($brv, null, $washer, 'JO-2026-0003', 'detailing', 'Full interior shampoo and engine bay cleaning before display.', 1500, 'in_progress', $now->copy()->subHours(5), null);
        $brv->update(['status' => 'maintenance']);

        $jo4 = $this->jobOrder($v('ST-2026-0007'), null, $mech1, 'JO-2026-0004', 'inspection', 'Pre-sale inspection. Front brake pads below limit, replaced. Topped up brake fluid.', 600, 'completed', $now->copy()->subDays(14)->setTime(13, 0), $now->copy()->subDays(14)->setTime(16, 10));
        $this->partUsed($jo4, 'Brake Pads', 1, $now->copy()->subDays(14));
        $this->partUsed($jo4, 'Brake Fluid DOT 3', 1, $now->copy()->subDays(14));

        // Notifications & messages
        $this->notify($this->secretary, $juan->user, 'Vehicle released', 'Your 2019 Toyota Vios has been released. Drive safe!', 'vehicle', $now->copy()->subDays(54), true);
        $this->notify($this->secretary, $juan->user, 'Service in progress', 'Job order JO-2026-0002 for your Vios is now being worked on.', 'job_order', $now->copy()->subDays(1));
        $this->notify($this->secretary, $maricel->user, 'Financing approved', 'Security Bank approved your auto loan. We are waiting for the loan release.', 'financing', $now->copy()->subDays(10));
        $this->notify($this->secretary, $dennis->user, 'Payment rejected', 'We could not verify your GCash payment of P50,000. Please check the reference number.', 'payment', $now->copy()->subDays(3));
        $this->notify($this->secretary, $roberto->user, 'ID needs resubmission', 'The back of your PRC ID is blurry. Please upload a clearer photo.', 'reservation', $now->copy()->subDays(2));
        $this->notify($dennis->user, $this->admin, 'New payment submitted', 'Dennis Ochavo sent a GCash payment of P200,000 for the 2021 Honda City.', 'payment', $now->copy()->subHours(20));
        $this->notify($lyka->user, $this->admin, 'New service request', 'Lyka Maglangit asked for a brake check on her 2020 Montero Sport.', 'service', $now->copy()->subDays(1));
        $this->notify($angelica->user, $this->secretary, 'New reservation', 'Angelica Lagbas reserved the 2019 Mirage G4. ID is waiting for review.', 'reservation', $now->copy()->subDays(1));

        $this->message($juan->user, $this->secretary, 'Good morning po. Pwede ba ko magpa-check sa ligid ugma? Murag naay leak sa front left.', $now->copy()->subDays(3)->setTime(8, 12), true);
        $this->message($this->secretary, $juan->user, 'Good morning sir! Yes po, pwede. Pa-submit lang og service request sa app para ma-schedule namo.', $now->copy()->subDays(3)->setTime(8, 40), true);
        $this->message($juan->user, $this->secretary, 'Sige po, na-submit na nako. Salamat!', $now->copy()->subDays(3)->setTime(9, 5), true);
        $this->message($dennis->user, $this->secretary, 'Hi, na-send na nako ang 200k sa GCash. Pa-confirm lang po.', $now->copy()->subHours(19), false);
    }

    private function reservation(
        Customer $customer,
        Vehicle $vehicle,
        string $option,
        string $source,
        Carbon $at,
        string $status,
        string $idType,
        ?User $reservedBy = null,
        array $idStatus = ['approved', 'approved'],
        array $idRemarks = [null, null],
        ?string $remarks = null,
    ): Reservation {
        $dir = "reservation_ids/customer-{$customer->id}";
        $name = "{$customer->first_name} {$customer->last_name}";

        return Reservation::create([
            'customer_id' => $customer->id,
            'vehicle_id' => $vehicle->id,
            'reserved_by_id' => $reservedBy?->id,
            'reservation_source' => $source,
            'valid_id_type' => $idType,
            'valid_id_front' => PlaceholderImage::document("{$dir}/front.jpg", strtoupper($idType) . ' - FRONT', [$name, 'Sample ID']),
            'valid_id_back' => PlaceholderImage::document("{$dir}/back.jpg", strtoupper($idType) . ' - BACK', [$name, 'Sample ID']),
            'valid_id_front_status' => $idStatus[0],
            'valid_id_back_status' => $idStatus[1],
            'valid_id_front_remarks' => $idRemarks[0],
            'valid_id_back_remarks' => $idRemarks[1],
            'purchase_option' => $option,
            'reserved_at' => $at,
            'expires_at' => $at->copy()->addDays(7),
            'reservation_status' => $status,
            'remarks' => $remarks,
            'archived' => false,
            'created_at' => $at,
            'updated_at' => $at,
        ]);
    }

    private function sale(Reservation $reservation, string $invoice, Carbon $at, float $discount, string $status): Sale
    {
        return Sale::create([
            'reservation_id' => $reservation->id,
            'created_by' => $this->secretary->id,
            'invoice_number' => $invoice,
            'sale_date' => $at,
            'discount_amount' => $discount,
            'status' => $status,
            'archived' => false,
        ]);
    }

    private function payment(
        Reservation $reservation,
        Sale $sale,
        string $type,
        string $method,
        float $amount,
        string $status,
        Carbon $at,
        ?string $reference = null,
        ?string $remarks = null,
        ?FinancingInfo $financing = null,
    ): Payment {
        $account = match ($method) {
            'gcash' => 'GCash',
            'maya' => 'Maya',
            'bank_transfer' => 'BDO',
            default => null,
        };
        $proof = $method === 'cash' ? null : PlaceholderImage::document(
            "payments/proofs/{$sale->invoice_number}-" . substr(md5($type . $amount . $at), 0, 6) . '.jpg',
            'PAYMENT RECEIPT',
            [number_format($amount, 2) . ' PHP', $reference ?? '', 'Sample proof'],
        );

        return Payment::create([
            'reservation_id' => $reservation->id,
            'sale_id' => $sale->id,
            'financing_info_id' => $financing?->id,
            // Maya isn't one of the methods the payments table accepts, so it is stored as gcash (e-wallet).
            'payment_account_id' => $account ? ($this->accounts[$account] ?? null) : null,
            'verified_by' => $status === 'pending' ? null : $this->secretary->id,
            'payer_type' => $type === 'financing_release' ? 'financing_company' : 'customer',
            'payment_type' => $type,
            'payment_method' => $method === 'maya' ? 'gcash' : $method,
            'amount' => $amount,
            'reference_number' => $reference,
            'payment_proof' => $proof,
            'payment_date' => $at,
            'payment_status' => $status,
            'verified_at' => $status === 'pending' ? null : $at->copy()->addHours(3),
            'remarks' => $remarks,
            'archived' => false,
        ]);
    }

    private function financing(Reservation $reservation, string $company, string $contact, float $amount, float $monthly, int $months, string $status, ?string $reference): FinancingInfo
    {
        return FinancingInfo::create([
            'reservation_id' => $reservation->id,
            'company_name' => $company,
            'contact_person' => $contact,
            'contact_number' => '(088) 555 ' . random_int(1000, 9999),
            'email' => 'autoloans.cdo@example.com',
            'address' => 'Corrales Ave., Cagayan de Oro City',
            'financing_reference_no' => $reference,
            'financed_amount' => $amount,
            'monthly_payment' => $monthly,
            'loan_term_months' => $months,
            'verified_by' => $status === 'pending' ? null : $this->secretary->id,
            'financing_status' => $status,
            'remarks' => null,
            'archived' => false,
        ]);
    }

    // $mode: 'verified' = full set approved, 'partial' = some missing / pending / rejected
    private function financingDocuments(FinancingInfo $financing, Customer $customer, string $mode): void
    {
        $groups = ['COMMON', $customer->employment_type === 'employed' ? 'EMPLOYED' : 'SELF_EMPLOYED'];
        if ($customer->civil_status === 'married') {
            $groups[] = 'MARRIED';
        }

        $requirements = FinancingRequirement::with('group')
            ->whereHas('group', fn($q) => $q->whereIn('group_code', $groups))
            ->get();

        foreach ($requirements as $index => $requirement) {
            $status = 'verified';
            $remarks = null;

            if ($mode === 'partial') {
                if ($requirement->requirement_name === 'Business Permit') {
                    [$status, $remarks] = ['rejected', 'Permit expired last January. Please upload the 2026 renewal.'];
                } elseif ($index >= 3) {
                    continue; // not uploaded yet
                } elseif ($index > 0) {
                    $status = 'pending';
                }
            }

            for ($copy = 1; $copy <= max(1, $requirement->required_quantity); $copy++) {
                $slug = str($requirement->requirement_name)->slug();
                $fileName = "{$slug}-{$copy}.jpg";

                FinancingDocument::create([
                    'financing_info_id' => $financing->id,
                    'financing_requirement_id' => $requirement->id,
                    'verified_by' => $status === 'pending' ? null : $this->secretary->id,
                    'file_name' => $fileName,
                    'file_path' => PlaceholderImage::document(
                        "financing-documents/{$financing->id}/{$fileName}",
                        strtoupper($requirement->requirement_name),
                        ["{$customer->first_name} {$customer->last_name}", "Copy {$copy}", 'Sample document'],
                    ),
                    'uploaded_at' => now()->subDays(5),
                    'verification_status' => $status,
                    'verified_at' => $status === 'pending' ? null : now()->subDays(4),
                    'remarks' => $remarks,
                    'archived' => false,
                ]);
            }
        }
    }

    private function release(Sale $sale, Carbon $at, int $sequence): VehicleRelease
    {
        return VehicleRelease::create([
            'sale_id' => $sale->id,
            'release_number' => sprintf('REL-%s-%04d', $at->format('Ymd'), $sequence),
            'release_date' => $at->toDateString(),
            'status' => 'released',
            'archived' => false,
        ]);
    }

    private function serviceRequest(VehicleRelease $release, string $number, string $detail, Carbon $preferred, string $status, Carbon $at): RequestService
    {
        return RequestService::create([
            'vehicle_release_id' => $release->id,
            'service_request_number' => $number,
            'request_detail' => $detail,
            'request_proof' => PlaceholderImage::document("request-services/{$number}.jpg", 'CUSTOMER PHOTO', [$number, 'Sample attachment']),
            'request_date_pref' => $preferred->toDateString(),
            'status' => $status,
            'archived' => false,
            'created_at' => $at,
            'updated_at' => $at,
        ]);
    }

    private function jobOrder(Vehicle $vehicle, ?RequestService $request, Staff $staff, string $number, string $type, string $description, float $labor, string $status, ?Carbon $start, ?Carbon $finish): JobOrder
    {
        return JobOrder::create([
            'vehicle_id' => $vehicle->id,
            'request_service_id' => $request?->id,
            'assigned_staff_id' => $staff->id,
            'created_by' => $this->admin->id,
            'job_order_no' => $number,
            'work_type' => $type,
            'start_job' => $start,
            'finish_job' => $finish,
            'description' => $description,
            'labor_cost' => $labor,
            'status' => $status,
            'archived' => false,
        ]);
    }

    private function partUsed(JobOrder $jobOrder, string $partName, int $quantity, Carbon $at): void
    {
        $part = VehiclePart::where('part_name', $partName)->firstOrFail();

        PartsUsed::create([
            'job_order_id' => $jobOrder->id,
            'vehicle_part_id' => $part->id,
            'quantity' => $quantity,
            'used_at' => $at,
        ]);

        // Keep stock consistent with what the parts-used endpoint does.
        $part->decrement('quantity', $quantity);
    }

    private function notify(User $from, User $to, string $title, string $message, string $type, Carbon $at, bool $read = false): void
    {
        Notification::create([
            'sender_user_id' => $from->id,
            'receiver_user_id' => $to->id,
            'title' => $title,
            'message' => $message,
            'notification_type' => $type,
            'is_read' => $read,
            'created_at' => $at,
        ]);
    }

    private function message(User $from, User $to, string $text, Carbon $at, bool $read): void
    {
        Message::create([
            'sender_user_id' => $from->id,
            'receiver_user_id' => $to->id,
            'message' => $text,
            'is_read' => $read,
            'sent_at' => $at,
        ]);
    }
}
