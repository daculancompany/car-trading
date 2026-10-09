<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(
        Request $request,
        Closure $next,
        ...$roleTypes
    ): Response {

        // GET AUTHENTICATED USER

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // CHECK USER ROLE

        if (!$user->role) {
            return response()->json([
                'message' => 'Your account does not have a valid role.',
            ], 403);
        }

        // GET ROLE TYPE

        // Each allowed value may be a role type (system, staffs, customers) or a role name (secretary, mechanic...).
        $roleType = strtolower($user->role->role_type);
        $roleName = strtolower($user->role->name);
        $allowed = array_map('strtolower', $roleTypes);

        // CHECK ROLE TYPE

        if (!in_array($roleType, $allowed, true) && !in_array($roleName, $allowed, true)) {
            return response()->json([
                'message' => 'You do not have permission to access this resource.',
            ], 403);
        }

        // AUTHORIZED

        return $next($request);
    }
}
