<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Applyr</title>
    <style>
        body { font-family: ui-monospace, monospace; font-size: 13px; color: #111; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border: 2px solid #111; border-radius: 8px; overflow: hidden; }
        .header { background: #111; color: #fff; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 18px; letter-spacing: 4px; }
        .body { padding: 24px; }
        .feature { background: #f9f9f9; border-left: 4px solid #111; padding: 12px 16px; margin: 12px 0; }
        .feature strong { display: block; margin-bottom: 2px; }
        .btn { display: inline-block; background: #111; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 16px 4px 0 0; }
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
            <p>Welcome to <strong>Applyr</strong> — your centralized job application tracker. Here's what you can do:</p>

            <div class="feature">
                <strong>Track all your applications</strong>
                Manage every job application from Wishlist to Offer, with full status history.
            </div>

            <div class="feature">
                <strong>Never miss a follow-up</strong>
                Set reminders and get notified via email and in-app alerts at the right time.
            </div>

            <div class="feature">
                <strong>AI-powered resume generation</strong>
                Generate tailored resumes for each application using our OpenRouter AI integration.
            </div>

            <div class="feature">
                <strong>Browser extension import</strong>
                Import jobs directly from LinkedIn, Indeed, and other job boards with one click.
            </div>

            <a href="{{ $appUrl ?? 'http://localhost:5173' }}" class="btn">Get Started</a>
        </div>
        <div class="footer">
            © {{ date('Y') }} Applyr — Job Application Tracker
        </div>
    </div>
</body>
</html>