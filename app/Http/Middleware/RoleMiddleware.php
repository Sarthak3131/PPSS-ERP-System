<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (! $request->user()) {
            return ApiResponse::failure('Unauthenticated.', (object) [], 401);
        }

        if (! in_array($request->user()->role, $roles)) {
            return ApiResponse::failure('Forbidden. Insufficient role.', (object) [], 403);
        }

        return $next($request);
    }
}
