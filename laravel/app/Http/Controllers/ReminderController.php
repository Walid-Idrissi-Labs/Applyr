<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class ReminderController extends Controller
{
    public function sendReminders(): JsonResponse
    {
        $today = now()->toDateString();

        $applications = Application::with('user')
            ->whereNotNull('reminder_date')
            ->whereDate('reminder_date', '<=', $today)
            ->where('status', '!=', 'accepted')
            ->where('status', '!=', 'rejected')
            ->get();

        $count = 0;

        foreach ($applications as $application) {
            Notification::create([
                'user_id' => $application->user_id,
                'type' => 'reminder',
                'message' => "Reminder: Follow up on {$application->position} at {$application->company_name}",
            ]);

            if ($application->user->email) {
                try {
                    Mail::send([], [], function ($message) use ($application) {
                        $message->to($application->user->email)
                            ->subject("Reminder: Follow up on {$application->position}")
                            ->text("Don't forget to follow up on your application for {$application->position} at {$application->company_name}. Applied on: {$application->applied_at}");
                    });
                } catch (\Exception $e) {
                    // Log but don't fail
                }
            }

            $count++;
        }

        return response()->json(['reminders_sent' => $count]);
    }
}