<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SaleController extends Controller
{
    /**
     * GET /api/sales
     * Query params:
     * - page (int)
     * - per_page (int, default 20)
     * - search (string) matches barcode, mp_article, name, warehouse
     * - status (string)
     * - date_from (Y-m-d)
     * - date_to (Y-m-d)
     * - sort_by (id, barcode, mp_article, name, warehouse, date, status, status_date, delivery, payout, created_at)
     * - sort_dir (asc|desc)
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'search' => 'sometimes|string|max:255',
            'status' => 'sometimes|string|max:50',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date',
            'sort_by' => 'sometimes|in:id,barcode,mp_article,name,warehouse,date,status,status_date,delivery,payout,created_at',
            'sort_dir' => 'sometimes|in:asc,desc',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors(),
            ], 422);
        }

        $perPage = (int)($request->input('per_page', 20));
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $query = Sale::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('barcode', 'like', "%$search%")
                  ->orWhere('mp_article', 'like', "%$search%")
                  ->orWhere('name', 'like', "%$search%")
                  ->orWhere('warehouse', 'like', "%$search%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('date', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('date', '<=', $dateTo);
        }

        $query->orderBy($sortBy, $sortDir);

        $paginator = $query->paginate($perPage)->appends($request->query());

        return response()->json([
            'success' => true,
            'data' => [
                'items' => $paginator->items(),
                'pagination' => [
                    'total' => $paginator->total(),
                    'per_page' => $paginator->perPage(),
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                ],
                'sort' => [
                    'by' => $sortBy,
                    'dir' => $sortDir,
                ],
            ],
        ]);
    }
}
