<?php

namespace App\Http\Controllers;

use App\Models\PaymentAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PaymentAccountController extends Controller
{
    /**
     * Display all payment accounts.
     */
    public function index(): JsonResponse
    {
        $accounts = PaymentAccount::withCount('payments')
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Payment accounts retrieved successfully.',
            'data' => $accounts,
        ], 200);
    }

    /**
     * Store a new payment account.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'account_provider' => [
                'required',
                'string',
                'max:255',
                'unique:payment_accounts,account_provider',
            ],

            'account_name' => [
                'required',
                'string',
                'max:255',
            ],

            'account_number' => [
                'required',
                'string',
                'max:255',
                'unique:payment_accounts,account_number',
            ],

            'qr_code' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        // Store QR code image
        $qrCodePath = $request->file('qr_code')->store(
            'payment-accounts',
            'public'
        );

        // Store only the path in database
        $validated['qr_code_path'] = $qrCodePath;

        // Remove uploaded file from validated data
        unset($validated['qr_code']);

        $account = PaymentAccount::create($validated);

        return response()->json([
            'message' => 'Payment account created successfully.',
            'data' => $account,
        ], 201);
    }

    /**
     * Display a specific payment account.
     */
    public function show(PaymentAccount $paymentAccount): JsonResponse
    {
        $paymentAccount->loadCount('payments');

        return response()->json([
            'message' => 'Payment account retrieved successfully.',
            'data' => $paymentAccount,
        ], 200);
    }

    /**
     * Update a payment account.
     */
    public function update(
        Request $request,
        PaymentAccount $paymentAccount
    ): JsonResponse {
        $validated = $request->validate([
            'account_provider' => [
                'required',
                'string',
                'max:255',
                Rule::unique(
                    'payment_accounts',
                    'account_provider'
                )->ignore($paymentAccount->id),
            ],

            'account_name' => [
                'required',
                'string',
                'max:255',
            ],

            'account_number' => [
                'required',
                'string',
                'max:255',
                Rule::unique(
                    'payment_accounts',
                    'account_number'
                )->ignore($paymentAccount->id),
            ],

            // QR code is optional when updating
            'qr_code' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        // Update QR Code

        if ($request->hasFile('qr_code')) {

            // Delete old QR code
            if ($paymentAccount->qr_code_path) {
                Storage::disk('public')->delete(
                    $paymentAccount->qr_code_path
                );
            }

            // Store new QR code
            $validated['qr_code_path'] =
                $request->file('qr_code')->store(
                    'payment-accounts',
                    'public'
                );
        }

        // Remove uploaded file from database data
        unset($validated['qr_code']);

        $paymentAccount->update($validated);

        return response()->json([
            'message' => 'Payment account updated successfully.',
            'data' => $paymentAccount->fresh(),
        ], 200);
    }

    /**
     * Delete a payment account.
     */
    public function destroy(
        PaymentAccount $paymentAccount
    ): JsonResponse {
        if ($paymentAccount->payments()->exists()) {
            return response()->json([
                'message' =>
                'This payment account cannot be deleted because it has existing payment records.',
            ], 409);
        }

        // Delete QR code image
        if ($paymentAccount->qr_code_path) {
            Storage::disk('public')->delete(
                $paymentAccount->qr_code_path
            );
        }

        $paymentAccount->delete();

        return response()->json([
            'message' => 'Payment account deleted successfully.',
        ], 200);
    }
}
