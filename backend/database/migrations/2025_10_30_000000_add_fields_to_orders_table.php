<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('task_number')->nullable()->after('id');
            $table->string('provider_QR')->nullable();
            $table->string('creation_date')->nullable();
            $table->string('scanning_date')->nullable();
            $table->string('size')->nullable();
            $table->string('color')->nullable();
            $table->decimal('price', 12, 2)->nullable();
            $table->string('currency')->nullable();
            $table->string('seller_SKU')->nullable();
            $table->string('delivery_date_to_customer')->nullable();
            $table->string('task_status')->nullable();
            $table->string('destination')->nullable();
            $table->string('buyers_full_name')->nullable();
            $table->string('buyers_phone_number')->nullable();
            $table->string('product_scanning_date')->nullable();
            $table->decimal('acceptance_cost', 12, 2)->nullable();
            $table->string('time_since_order')->nullable();
            $table->boolean('legal_entity_indicator')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'task_number',
                'provider_QR',
                'creation_date',
                'scanning_date',
                'size',
                'color',
                'price',
                'currency',
                'seller_SKU',
                'delivery_date_to_customer',
                'task_status',
                'destination',
                'buyers_full_name',
                'buyers_phone_number',
                'product_scanning_date',
                'acceptance_cost',
                'time_since_order',
                'legal_entity_indicator',
            ]);
        });
    }
};
