<?php

namespace App\Http\Controllers\Concerns;

/**
 * Staff can open any record; a customer only records tied to their own reservations.
 */
trait ChecksCustomerOwnership
{
    protected function ensureCustomerOwns(?int $ownerCustomerId): void
    {
        $customer = request()->user()?->customer;

        abort_if(
            $customer && $customer->id !== $ownerCustomerId,
            403,
            'You can only open your own records.'
        );
    }
}
