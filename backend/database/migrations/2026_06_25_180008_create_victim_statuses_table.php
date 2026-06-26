<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Status history for lead management. The "current" status is denormalized
        // onto crash_victims.current_status; this table is the audit trail of changes.
        Schema::create('victim_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('victim_id')->constrained('crash_victims')->cascadeOnDelete();

            // NEW | PDF_EXTRACTED | LOOKUP_PENDING | LOOKUP_RUNNING | CONTACT_FOUND |
            // CONTACT_NOT_FOUND | READY_FOR_OUTREACH | CONTACTED | FOLLOW_UP | SIGNED | CLOSED | REJECTED
            $table->string('status');
            $table->text('reason')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('victim_statuses');
    }
};
