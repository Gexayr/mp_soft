<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TestController extends Controller
{
    /**
     * Test API endpoint
     */
    public function test()
    {
        return response()->json([
            'success' => true,
            'message' => 'API is working!',
            'timestamp' => now(),
        ]);
    }
}
