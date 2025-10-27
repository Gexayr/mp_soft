<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DocumentController extends Controller
{
    /**
     * Handle upload of two documents.
     */
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'document1' => 'required|file|max:20480', // max 20MB
            'document2' => 'required|file|max:20480',
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

        // Ensure directory exists (Storage disk 'local' by default => storage/app)
        $directory = 'uploads';

        if ($request->hasFile('document1')) {
            $file = $request->file('document1');
            $storedPath = $file->store($directory);
            $paths['document1'] = $storedPath;
            $originalNames['document1'] = $file->getClientOriginalName();
        }

        if ($request->hasFile('document2')) {
            $file = $request->file('document2');
            $storedPath = $file->store($directory);
            $paths['document2'] = $storedPath;
            $originalNames['document2'] = $file->getClientOriginalName();
        }

        return response()->json([
            'success' => true,
            'message' => 'Documents uploaded successfully',
            'data' => [
                'paths' => $paths,
                'original_names' => $originalNames,
            ],
        ], 201);
    }
}
