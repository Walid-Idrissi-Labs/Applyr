<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your Applyr email</title>
    <style>
        body { font-family: ui-monospace, monospace; font-size: 13px; color: #111; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border: 2px solid #111; border-radius: 8px; overflow: hidden; }
        .header { background: #111; color: #fff; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 18px; letter-spacing: 4px; }
        .body { padding: 24px; }
        .btn { display: inline-block; background: #111; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 12px 4px 0 0; }
        .muted { color: #666; font-size: 11px; margin-top: 10px; }
        .footer { padding: 16px 24px; border-top: 1px solid #eee; font-size: 11px; color: #888; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>APPLYR</h1>
        </div>
        <div class="body">
            <p>Hi <strong>{{ $userName }}</strong>,</p>
            <p>Please verify your email to receive reminders and updates from Applyr.</p>
            <a href="{{ $verifyUrl }}" class="btn">Verify Email</a>
            <p class="muted">This link expires in {{ $expireMinutes }} minutes.</p>
            <p>If you did not create an Applyr account, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            (c) {{ date('Y') }} Applyr - Job Application Tracker
        </div>
    </div>
</body>
</html>
