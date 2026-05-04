<?php

namespace App\Console\Commands;

use App\Models\Application;
use App\Models\Notification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendReminders extends Command
{
    protected $signature = 'app:send-reminders';

    protected $description = 'Send reminder notifications for applications with due reminder dates';

    public function handle(): int
    {
        $today = now()->toDateString();

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
                    Mail::raw(
                        "Don't forget to follow up on your application for {$application->position} at {$application->company_name}.",
                        function ($message) use ($application) {
                            $message->to($application->user->email)
                                ->subject("Reminder: Follow up on {$application->position}");
                        }
                    );
                } catch (\Exception $e) {
                    $this->error("Failed to send email to {$application->user->email}: {$e->getMessage()}");
                }
            }

            $this->info("Reminder sent for {$application->company_name} - {$application->position}");
        }

        $this->info("Done. Total reminders sent: {$applications->count()}");

        return Command::SUCCESS;
    }
}