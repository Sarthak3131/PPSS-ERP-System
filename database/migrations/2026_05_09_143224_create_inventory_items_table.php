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
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('item_code')->unique();
            $table->string('item_name');
            $table->enum('category', ['raw_material', 'packaging', 'component', 'consumable', 'finished_good']);
            $table->integer('stock_quantity')->default(0);
            $table->string('unit');
            $table->integer('reorder_level')->default(0);
            $table->string('supplier')->nullable();
            $table->integer('lead_time_days')->default(0);
            $table->string('status')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
