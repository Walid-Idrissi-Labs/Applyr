<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $companyName,
        public string $position,
        public string $appliedDate,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Reminder: Follow up on {$this->position}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reminder',
            text: 'emails.reminder-text',
        );
    }

    public function build(): static
    {
        return $this->with([
            'appUrl' => config('app.url') . '/login',
        ]);
    }
}