<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Services\ExcelProcessor;
use App\Services\SalesExcelProcessor;

class DocumentController extends Controller
{
    /**
     * Handle upload of two documents.
     */
    public function upload(Request $request)
    {
        // Allow uploading either document1 (orders) or document2 (sales), or both
        $validator = Validator::make($request->all(), [
            'document1' => 'sometimes|file|max:20480|required_without:document2', // max 20MB
            'document2' => 'sometimes|file|max:20480|required_without:document1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors(),
            ], 422);
        }

        $paths = [];
        $originalNames = [];

        // Save into /import (on 'local' disk => storage/app/private/import)
        $directory = 'import';

        if ($request->hasFile('document1')) {
            $file = $request->file('document1');
            $storedPath = $file->store($directory, ['disk' => 'local']);
            $paths['document1'] = $storedPath;
            $originalNames['document1'] = $file->getClientOriginalName();
        }

        if ($request->hasFile('document2')) {
            $file = $request->file('document2');
            $storedPath = $file->store($directory, ['disk' => 'local']);
            $paths['document2'] = $storedPath;
            $originalNames['document2'] = $file->getClientOriginalName();
        }

        // Trigger processing separately: document1 => orders, document2 => sales
        $summary = [
            'processed' => 0,
            'failed' => 0,
            'details' => [],
        ];

        if (isset($paths['document1'])) {
            $ordersPath = Storage::disk('local')->path($paths['document1']);
            try {
                $ordersProcessor = new ExcelProcessor();
                $rows = $ordersProcessor->processFile($ordersPath);
                $summary['processed']++;
                $summary['details'][] = [
                    $originalNames['document1'] => [
                        'type' => 'orders',
                        'status' => 'processed',
                        'rows' => $rows,
                    ]
                ];
            } catch (\Throwable $e) {
                $summary['failed']++;
                $summary['details'][] = [
                    $originalNames['document1'] => [
                        'type' => 'orders',
                        'status' => 'failed',
                        'error' => $e->getMessage(),
                    ]
                ];
            }
        }

        if (isset($paths['document2'])) {
            $salesPath = Storage::disk('local')->path($paths['document2']);
            try {
                $salesProcessor = new SalesExcelProcessor();
                $rows = $salesProcessor->processFile($salesPath);
                $summary['processed']++;
                $summary['details'][] = [
                    $originalNames['document2'] => [
                        'type' => 'sales',
                        'status' => 'processed',
                        'rows' => $rows,
                    ]
                ];
            } catch (\Throwable $e) {
                $summary['failed']++;
                $summary['details'][] = [
                    $originalNames['document2'] => [
                        'type' => 'sales',
                        'status' => 'failed',
                        'error' => $e->getMessage(),
                    ]
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Documents uploaded successfully and processed',
            'data' => [
                'paths' => $paths,
                'original_names' => $originalNames,
                'processing_summary' => $summary,
            ],
        ], 201);
    }
}
