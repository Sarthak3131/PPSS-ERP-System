<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;

final class ApiResponse
{
    public static function success(mixed $data = null, string $message = 'OK', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], $status);
    }

    /**
     * @param  array<string, mixed>|null  $links
     */
    public static function successWithMeta(mixed $data, string $message, array $meta, ?array $links = null, int $status = 200): JsonResponse
    {
        $payload = [
            'success' => true,
            'data' => $data,
            'message' => $message,
            'meta' => $meta,
        ];
        if ($links !== null) {
            $payload['links'] = $links;
        }

        return response()->json($payload, $status);
    }

    public static function paginated(LengthAwarePaginator $paginator, Request $request, string $resourceClass, string $message = 'OK'): JsonResponse
    {
        $data = collect($paginator->items())->map(function ($item) use ($resourceClass, $request) {
            return (new $resourceClass($item))->resolve($request);
        })->values()->all();

        return self::successWithMeta(
            $data,
            $message,
            self::paginationMeta($paginator),
            self::paginationLinks($paginator),
        );
    }

    public static function paginatedMapped(LengthAwarePaginator $paginator, callable $mapper, string $message = 'OK'): JsonResponse
    {
        $data = collect($paginator->items())->map(fn ($item) => $mapper($item))->values()->all();

        return self::successWithMeta(
            $data,
            $message,
            self::paginationMeta($paginator),
            self::paginationLinks($paginator),
        );
    }

    public static function resource(JsonResource $resource, string $message = 'OK', int $status = 200): JsonResponse
    {
        return self::success($resource->resolve(request()), $message, $status);
    }

    public static function failure(string $message, mixed $errors = null, int $status = 400): JsonResponse
    {
        if ($errors === null) {
            $errors = (object) [];
        }

        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }

    /**
     * @return array<string, mixed>
     */
    private static function paginationMeta(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function paginationLinks(LengthAwarePaginator $paginator): array
    {
        return [
            'first' => $paginator->url(1),
            'last' => $paginator->url($paginator->lastPage()),
            'prev' => $paginator->previousPageUrl(),
            'next' => $paginator->nextPageUrl(),
        ];
    }
}
