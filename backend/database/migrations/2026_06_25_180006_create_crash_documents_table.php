<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crash_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crash_report_id')->constrained('crash_reports')->cascadeOnDelete();

            $table->string('document_type')->default('pdf'); // pdf | json | image | supplement
            $table->string('file_name');
            $table->string('file_path');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();

            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crash_documents');
    }
};
