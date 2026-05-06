<?php

namespace App\Console\Commands;

use App\Models\Application;
use App\Models\Notification;
use App\Mail\ReminderMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendReminders extends Command
{
    protected $signature = 'app:send-reminders';

    protected $description = 'Send reminder notifications for applications with due reminder dates';

    public function handle(): int
    {
        $today = now()->toDateString();
        $appUrl = config('app.url') . '/login';

        $applications = Application::with('user')
            ->whereNotNull('reminder_date')
            ->whereDate('reminder_date', '<=', $today)
            ->whereNotIn('status', ['accepted', 'rejected'])
            ->get();

        foreach ($applications as $application) {
            Notification::create([
                'user_id' => $application->user_id,
                'type' => 'reminder',
                'message' => "Reminder: Follow up on {$application->position} at {$application->company_name}",
            ]);

            if ($application->user->email) {
                try {
                    Mail::to($application->user->email)->send(new ReminderMail(
                        userName: $application->user->name,
                        companyName: $application->company_name,
                        position: $application->position,
                        appliedDate: $application->applied_at
                            ? \Carbon\Carbon::parse($application->applied_at)->format('d/m/Y')
                            : 'Not specified',
                    ));

                    $this->info("Email sent to {$application->user->email} for {$application->company_name}");
                } catch (\Exception $e) {
                    $this->error("Failed to send email to {$application->user->email}: {$e->getMessage()}");
                }
            }
        }

        $this->info("Done. Processed {$applications->count()} reminders.");

        return Command::SUCCESS;
    }
}