<?php

use Illuminate\Support\Facades\Route;

// AUTHENTICATION
use App\Http\Controllers\AuthController;

// USER MANAGEMENT
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\CustomerController;

// ADMIN DASHBOARD
use App\Http\Controllers\Dashboard\DashboardStatsController;
use App\Http\Controllers\Dashboard\DashboardReservationPipelineController;
use App\Http\Controllers\Dashboard\DashboardFinancialPerformanceController;
use App\Http\Controllers\Dashboard\DashboardSalesTrendController;
use App\Http\Controllers\Dashboard\DashboardTopSellingController;
use App\Http\Controllers\Dashboard\DashboardVehicleStatusController;
use App\Http\Controllers\Dashboard\DashboardLatestVehiclesController;
use App\Http\Controllers\Dashboard\DashboardRecentReservationsController;
use App\Http\Controllers\Dashboard\DashboardJobOrdersController;

// VEHICLE MANAGEMENT
use App\Http\Controllers\VehicleBrandController;
use App\Http\Controllers\VehicleModelController;
use App\Http\Controllers\VehicleVariantController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\ExpenseTypeController;
use App\Http\Controllers\VehicleExpenseController;
use App\Http\Controllers\VehicleImageController;
use App\Http\Controllers\VehicleSpecController;
use App\Http\Controllers\VehicleDocumentController;

// RESERVATIONS
use App\Http\Controllers\ReservationController;

// PAYMENTS
use App\Http\Controllers\PaymentAccountController;
use App\Http\Controllers\PaymentController;

// FINANCING
use App\Http\Controllers\FinancingRequirementGroupController;
use App\Http\Controllers\FinancingRequirementController;
use App\Http\Controllers\FinancingInfoController;
use App\Http\Controllers\FinancingDocumentController;

// SALES
use App\Http\Controllers\SaleController;

// VEHICLE RELEASE
use App\Http\Controllers\VehicleReleaseController;

// VEHICLE PARTS
use App\Http\Controllers\PartsUsedController;
use App\Http\Controllers\PartStockMovementController;
use App\Http\Controllers\VehiclePartController;

// SERVICES / JOB ORDERS
use App\Http\Controllers\RequestServiceController;
use App\Http\Controllers\JobOrderController;
use App\Http\Controllers\ActivityLogController;

// NOTIFICATIONS / MESSAGES
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\MessageController;

// REPORTS
use App\Http\Controllers\ReportController;

// PUBLIC ROUTES
// LOGIN
Route::post('/login', [AuthController::class, 'login']);

// CUSTOMER REGISTRATION
Route::post('/register', [CustomerController::class, 'store']);

// PUBLIC VEHICLE BROWSING
Route::apiResource('vehicle-brands', VehicleBrandController::class)->only(['index', 'show']);
Route::apiResource('vehicle-models', VehicleModelController::class)->only(['index', 'show']);
Route::apiResource('vehicle-variants', VehicleVariantController::class)->only(['index', 'show']);
Route::apiResource('vehicles', VehicleController::class)->only(['index', 'show']);
Route::get('vehicles/{vehicle}/inspection-report', [VehicleController::class, 'inspectionReport']);

// AUTHENTICATED ROUTES
// Any logged-in user (customers included). Controllers scope customer data to its owner.
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me', [AuthController::class, 'updateProfile']);
    Route::post('/me/password', [AuthController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/customer/vehicles', [VehicleController::class, 'customerVehicles']);
    Route::get('/customer/valid-id', [ReservationController::class, 'validIdOnFile']);
    Route::post('/customer/photo', [CustomerController::class, 'updateMyPhoto']);
    Route::get('job-orders/{jobOrder}/inspection/pdf', [JobOrderController::class, 'inspectionPdf']);
    Route::get('job-orders/{jobOrder}/invoice/pdf', [JobOrderController::class, 'invoicePdf']);
    Route::post('job-orders/{jobOrder}/estimate/respond', [JobOrderController::class, 'respondEstimate']);
    Route::post('job-orders/{jobOrder}/feedback', [JobOrderController::class, 'feedback']);

    Route::apiResource('reservations', ReservationController::class)->only(['index', 'store', 'show', 'update']);
    Route::post('reservations/{reservation}/resubmit-id', [ReservationController::class, 'resubmitId']);

    Route::apiResource('payments', PaymentController::class)->only(['index', 'store']);
    Route::post('payments/{payment}/resubmit-proof', [PaymentController::class, 'resubmitProof']);
    Route::apiResource('payment-accounts', PaymentAccountController::class)->only(['index']);
    Route::apiResource('sales', SaleController::class)->only(['index']);

    Route::get('financing-requirements-active', [FinancingRequirementController::class, 'active']);
    Route::get('financing-requirements-grouped', [FinancingRequirementController::class, 'grouped']);
    Route::apiResource('financing-info', FinancingInfoController::class)->only(['index', 'store', 'show']);
    Route::post('financing-info/{financingInfo}/resubmit', [FinancingInfoController::class, 'resubmit']);
    Route::apiResource('financing-documents', FinancingDocumentController::class)->only(['index', 'store', 'show']);
    Route::post('financing-documents/{financingDocument}/resubmit', [FinancingDocumentController::class, 'resubmit']);
    Route::get('/financing-documents/{financingDocument}/preview', [FinancingDocumentController::class, 'preview']);

    Route::apiResource('vehicle-releases', VehicleReleaseController::class)->only(['index']);
    Route::get('/vehicle-releases/{vehicleRelease}/receipt', [VehicleReleaseController::class, 'receipt']);
    Route::get('/vehicle-releases/{vehicleRelease}/receipt/download', [VehicleReleaseController::class, 'downloadReceipt']);
    Route::get('/vehicle-releases/{vehicleRelease}/deed-of-sale', [VehicleReleaseController::class, 'deedOfSale']);
    Route::get('/vehicle-releases/{vehicleRelease}/deed-of-sale/download', [VehicleReleaseController::class, 'downloadDeedOfSale']);
    Route::apiResource('vehicle-documents', VehicleDocumentController::class)->only(['index']);

    Route::apiResource('request-services', RequestServiceController::class)->only(['index', 'store', 'show']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::get('/notifications/{id}', [NotificationController::class, 'show']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    Route::get('messages/conversation/{user}', [MessageController::class, 'conversation']);
    Route::get('messages', [MessageController::class, 'index']);
    Route::post('messages', [MessageController::class, 'store']);
    Route::patch('messages/{message}/read', [MessageController::class, 'markAsRead']);
});

// Shop work: admin, secretary, mechanics and washers (controllers limit field staff to their own jobs).
Route::middleware(['auth:sanctum', 'role:system,staffs'])->group(function () {
    Route::apiResource('job-orders', JobOrderController::class);
    Route::post('job-orders/{jobOrder}/inspection', [JobOrderController::class, 'saveInspection']);
    Route::post('job-orders/{jobOrder}/inspection/decision', [JobOrderController::class, 'decideInspection']);
    Route::post('job-orders/{jobOrder}/updates', [JobOrderController::class, 'addUpdate']);
    Route::post('job-orders/{jobOrder}/estimate', [JobOrderController::class, 'sendEstimate']);
    Route::post('job-orders/{jobOrder}/payments', [JobOrderController::class, 'storePayment']);
    Route::delete('job-orders/{jobOrder}/payments/{payment}', [JobOrderController::class, 'destroyPayment']);
    Route::post('job-orders/{jobOrder}/warranty', [JobOrderController::class, 'updateWarranty']);
    Route::get('service-reminders', [JobOrderController::class, 'serviceReminders']);
    Route::post('service-reminders/{inspection}/send', [JobOrderController::class, 'sendReminder']);
    Route::apiResource('parts-used', PartsUsedController::class);
    Route::get('vehicle-parts', [VehiclePartController::class, 'index']);
});

// Office: admin and secretary only.
Route::middleware(['auth:sanctum', 'role:system,secretary'])->group(function () {
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('staffs', StaffController::class);
    Route::apiResource('customers', CustomerController::class);
    Route::post('customers/{customer}/photo', [CustomerController::class, 'updatePhoto']);

    Route::apiResource('vehicle-brands', VehicleBrandController::class)->except(['index', 'show']);
    Route::apiResource('vehicle-models', VehicleModelController::class)->except(['index', 'show']);
    Route::apiResource('vehicle-variants', VehicleVariantController::class)->except(['index', 'show']);
    Route::apiResource('vehicles', VehicleController::class)->except(['index', 'show']);
    Route::apiResource('vehicle-specs', VehicleSpecController::class);
    Route::apiResource('vehicle-images', VehicleImageController::class);
    Route::apiResource('expense-types', ExpenseTypeController::class);
    Route::apiResource('vehicle-expenses', VehicleExpenseController::class);
    Route::apiResource('vehicle-documents', VehicleDocumentController::class)->except(['index']);

    Route::apiResource('reservations', ReservationController::class)->only(['destroy']);
    Route::patch('reservations/{reservation}/review-id', [ReservationController::class, 'reviewId']);
    Route::post('reservations/{reservation}/approve', [ReservationController::class, 'approve']);
    Route::post('reservations/{reservation}/reject', [ReservationController::class, 'reject']);

    Route::apiResource('payment-accounts', PaymentAccountController::class)->except(['index']);
    Route::apiResource('payments', PaymentController::class)->except(['index', 'store']);
    Route::patch('payments/{payment}/verify', [PaymentController::class, 'verify']);
    Route::patch('payments/{payment}/reject', [PaymentController::class, 'reject']);

    Route::apiResource('sales', SaleController::class)->except(['index']);

    Route::apiResource('financing-requirement-groups', FinancingRequirementGroupController::class);
    Route::apiResource('financing-requirements', FinancingRequirementController::class);
    Route::apiResource('financing-info', FinancingInfoController::class)->except(['index', 'store', 'show']);
    Route::post('financing-info/{financingInfo}/approve', [FinancingInfoController::class, 'approve']);
    Route::post('financing-info/{financingInfo}/reject', [FinancingInfoController::class, 'reject']);
    Route::apiResource('financing-documents', FinancingDocumentController::class)->except(['index', 'store', 'show']);
    Route::patch('financing-documents/{financingDocument}/reject', [FinancingDocumentController::class, 'reject']);

    Route::apiResource('vehicle-releases', VehicleReleaseController::class)->except(['index']);
    Route::patch('/vehicle-releases/{vehicleRelease}/release', [VehicleReleaseController::class, 'release']);

    Route::apiResource('vehicle-parts', VehiclePartController::class)->except(['index']);
    Route::get('part-stock-movements', [PartStockMovementController::class, 'index']);
    Route::post('part-stock-movements', [PartStockMovementController::class, 'store']);
    Route::apiResource('request-services', RequestServiceController::class)->except(['index', 'store', 'show']);

    Route::get('/dashboard/stats', [DashboardStatsController::class, 'index']);
    Route::get('/dashboard/reservation-pipeline', [DashboardReservationPipelineController::class, 'index']);
    Route::get('/dashboard/financial-performance', [DashboardFinancialPerformanceController::class, 'index']);
    Route::get('/dashboard/sales-trend', [DashboardSalesTrendController::class, 'index']);
    Route::get('/dashboard/top-selling', [DashboardTopSellingController::class, 'index']);
    Route::get('/dashboard/vehicle-status', [DashboardVehicleStatusController::class, 'index']);
    Route::get('/dashboard/latest-vehicles', [DashboardLatestVehiclesController::class, 'index']);
    Route::get('/dashboard/recent-reservations', [DashboardRecentReservationsController::class, 'index']);
    Route::get('/dashboard/job-orders', [DashboardJobOrdersController::class, 'index']);

    Route::prefix('reports')->group(function () {
        Route::get('/sales', [ReportController::class, 'sales']);
        Route::get('/sales/pdf', [ReportController::class, 'salesPdf']);
        Route::get('/payments', [ReportController::class, 'payments']);
        Route::get('/payments/pdf', [ReportController::class, 'paymentsPdf']);
        Route::get('/reservations', [ReportController::class, 'reservations']);
        Route::get('/reservations/pdf', [ReportController::class, 'reservationsPdf']);
        Route::get('/vehicles', [ReportController::class, 'vehicles']);
        Route::get('/vehicles/pdf', [ReportController::class, 'vehiclesPdf']);
        Route::get('/financing', [ReportController::class, 'financing']);
        Route::get('/financing/pdf', [ReportController::class, 'financingPdf']);
        Route::get('/expenses', [ReportController::class, 'expenses']);
        Route::get('/expenses/pdf', [ReportController::class, 'expensesPdf']);
        Route::get('/services', [ReportController::class, 'services']);
        Route::get('/services/pdf', [ReportController::class, 'servicesPdf']);
        Route::get('/job-orders', [ReportController::class, 'jobOrders']);
        Route::get('/job-orders/pdf', [ReportController::class, 'jobOrdersPdf']);
        Route::get('/parts', [ReportController::class, 'parts']);
        Route::get('/parts/pdf', [ReportController::class, 'partsPdf']);
        Route::get('/stock-movements', [ReportController::class, 'stockMovements']);
        Route::get('/stock-movements/pdf', [ReportController::class, 'stockMovementsPdf']);
        Route::get('/releases', [ReportController::class, 'releases']);
        Route::get('/releases/pdf', [ReportController::class, 'releasesPdf']);
        Route::get('/mechanics', [ReportController::class, 'mechanics']);
        Route::get('/mechanics/pdf', [ReportController::class, 'mechanicsPdf']);
        Route::get('/service-billing', [ReportController::class, 'serviceBilling']);
        Route::get('/service-billing/pdf', [ReportController::class, 'serviceBillingPdf']);
    });
});

Route::middleware(['auth:sanctum', 'role:system'])->group(function () {
    Route::get('activity-logs', [ActivityLogController::class, 'index']);
});
