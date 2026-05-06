<!DOCTYPE html>
<html>
<head>
    <title>Welcome to Applyr</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
    <h2>Welcome to Applyr!</h2>
    <p>Hi {{ $user->name }},</p>
    <p>An administrator has created an account for you on Applyr.</p>
    <p>Here are your login details:</p>
    <ul>
        <li><strong>Email:</strong> {{ $user->email }}</li>
        <li><strong>Password:</strong> {{ $plainPassword }}</li>
    </ul>
    <p>We strongly recommend logging in and changing your password immediately from your profile settings.</p>
    <p>Thanks,<br>The Applyr Team</p>
</body>
</html>
