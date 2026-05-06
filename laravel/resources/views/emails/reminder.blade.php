<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Follow-up Reminder</title>
    <style>
        body { font-family: ui-monospace, monospace; font-size: 13px; color: #111; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border: 2px solid #111; border-radius: 8px; overflow: hidden; }
        .header { background: #111; color: #fff; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 18px; letter-spacing: 4px; }
        .body { padding: 24px; }
        .highlight { background: #f9f9f9; border-left: 4px solid #111; padding: 12px 16px; margin: 16px 0; }
        .highlight strong { display: block; font-size: 15px; margin-bottom: 4px; }
        .btn { display: inline-block; background: #111; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 16px; }
        .footer { padding: 16px 24px; border-top: 1px solid #eee; font-size: 11px; color: #888; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>APPLYR</h1>
        </div>
        <div class="body">
            <p>Hi {{ $userName }},</p>
            <p>This is a reminder to follow up on your job application.</p>

            <div class="highlight">
                <strong>{{ $position }}</strong>
                at <strong>{{ $companyName }}</strong>
                <br><span style="color:#666">Applied on: {{ $appliedDate }}</span>
            </div>

            <p>Following up shows initiative and can make a real difference in the hiring process. We recommend reaching out within 24–48 hours of your reminder date.</p>

            <p>Good luck — you've got this!</p>

            <a href="{{ $appUrl ?? 'http://localhost:5173' }}" class="btn">Open Applyr</a>
        </div>
        <div class="footer">
            You're receiving this because you set a reminder in Applyr.
            <br>© {{ date('Y') }} Applyr — Job Application Tracker
        </div>
    </div>
</body>
</html>