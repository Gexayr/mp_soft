<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Services\ExcelProcessor;

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

        // Trigger processing
        $processor = new ExcelProcessor();
        $summary = $processor->processAll();

        return response()->json([
            'success' => true,
            'message' => 'Documents uploaded successfully and processing started',
            'data' => [
                'paths' => $paths,
                'original_names' => $originalNames,
                'processing_summary' => $summary,
            ],
        ], 201);
    }
}
