<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Applyr</title>
    <!--[if mso]>
    <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
    <![endif]-->
    <style>
        @media (max-width: 600px) {
            .apr-wrap { width: 100% !important; }
            .apr-pad { padding-left: 20px !important; padding-right: 20px !important; }
        }
    </style>
</head>
<body style="margin:0; padding:0; background-color:#f2efe7;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2efe7;">
        <tr>
            <td align="center" style="padding:40px 16px;">
                <table role="presentation" class="apr-wrap" width="560" cellpadding="0" cellspacing="0" style="width:560px; max-width:100%; background-color:#ffffff; border:2px solid #111111; border-radius:16px; box-shadow:6px 6px 0px 0px rgba(17,17,17,1);">

                    <tr>
                        <td align="center" style="background-color:#111111; border-radius:13px 13px 0 0; padding:22px 24px;">
                            <span style="font-family:'Space Grotesk','Segoe UI',Helvetica,Arial,sans-serif; font-size:18px; font-weight:700; letter-spacing:6px; color:#ffffff;">APPLYR</span>
                        </td>
                    </tr>

                    <tr>
                        <td class="apr-pad" style="padding:36px 40px 8px 40px; font-family:'IBM Plex Sans',Helvetica,Arial,sans-serif;">
                            <span style="display:inline-block; font-size:11px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:#0f766e;">&#9632;&nbsp; Account created</span>
                            <h1 style="margin:12px 0 0 0; font-family:'Space Grotesk','Segoe UI',Helvetica,Arial,sans-serif; font-size:22px; line-height:1.3; color:#111111;">An account was created for you</h1>
                        </td>
                    </tr>
                    <tr>
                        <td class="apr-pad" style="padding:12px 40px 0 40px; font-family:'IBM Plex Sans',Helvetica,Arial,sans-serif; font-size:14px; line-height:1.6; color:#333333;">
                            <p style="margin:0 0 20px 0;">Hi {{ $user->name }}, an administrator created an Applyr account for you. Here are your login details:</p>
                        </td>
                    </tr>

                    <tr>
                        <td class="apr-pad" style="padding:0 40px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #111111; border-radius:10px;">
                                <tr>
                                    <td style="padding:14px 18px; border-bottom:1px solid #e8e5db; font-family:'IBM Plex Sans',Helvetica,Arial,sans-serif;">
                                        <span style="display:block; font-size:11px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:#8a8a8a;">Email</span>
                                        <span style="font-family:'JetBrains Mono','Courier New',monospace; font-size:14px; color:#111111;">{{ $user->email }}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:14px 18px; font-family:'IBM Plex Sans',Helvetica,Arial,sans-serif;">
                                        <span style="display:block; font-size:11px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:#8a8a8a;">Temporary password</span>
                                        <span style="font-family:'JetBrains Mono','Courier New',monospace; font-size:14px; color:#111111;">{{ $plainPassword }}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td class="apr-pad" style="padding:16px 40px 0 40px; font-family:'IBM Plex Sans',Helvetica,Arial,sans-serif; font-size:13px; line-height:1.6; color:#b45309;">
                            <p style="margin:0;">Log in and change this password from your profile settings as soon as possible.</p>
                        </td>
                    </tr>

                    <tr>
                        <td class="apr-pad" align="left" style="padding:20px 40px 0 40px;">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="background-color:#111111; border-radius:8px;">
                                        <a href="{{ config('app.frontend_url') }}/login" target="_blank" style="display:inline-block; padding:13px 28px; font-family:'IBM Plex Sans',Helvetica,Arial,sans-serif; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none;">Log in &rarr;</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td class="apr-pad" style="padding:28px 40px 0 40px;">
                            <div style="border-top:1px solid #e8e5db;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td class="apr-pad" style="padding:16px 40px 28px 40px; font-family:'IBM Plex Sans',Helvetica,Arial,sans-serif; font-size:11px; line-height:1.6; color:#999999;">
                            &copy; {{ date('Y') }} Applyr &mdash; Job Application Tracker
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
