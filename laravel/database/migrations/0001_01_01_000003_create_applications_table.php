<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('company_name');
            $table->string('position');
            $table->string('status')->default('wishlist');
            $table->date('applied_at')->nullable();
            $table->string('link')->nullable();
            $table->text('notes')->nullable();
            $table->string('source')->nullable();
            $table->date('reminder_date')->nullable();
            $table->string('posting_language')->default('en');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};