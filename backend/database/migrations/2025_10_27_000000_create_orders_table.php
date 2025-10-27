<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('barcode')->unique();
            $table->string('mp_article')->nullable();
            $table->string('name')->nullable();
            $table->string('warehouse')->nullable();
            $table->date('date')->nullable();
            $table->string('status')->nullable();
            $table->date('status_date')->nullable();
            $table->decimal('delivery', 12, 2)->nullable();
            $table->decimal('payout', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
