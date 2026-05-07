<?php
$user = \App\Models\User::find(1);

// Add base resume
\App\Models\Resume::create([
    'user_id' => $user->id,
    'application_id' => null,
    'content' => "# Alex Developer\n\n## Summary\nExperienced Software Engineer with a solid background in building scalable web applications using Laravel, React, and Node.js. Strong focus on backend architecture, API design, and performance optimization. Passionate about clean code and agile methodologies.\n\n## Experience\n**Software Engineer, TechCorp** (2020 - Present)\n- Built RESTful APIs using Laravel.\n- Developed responsive frontends with React.\n\n## Skills\nPHP, JavaScript, Laravel, React, Node.js, SQL.",
    'language' => 'en',
]);

// Add job application
\App\Models\Application::create([
    'user_id' => $user->id,
    'company_name' => 'OpenAI',
    'position' => 'Senior Platform Engineer',
    'status' => 'applied',
    'applied_at' => now(),
    'notes' => "Job Description:\nWe are looking for a Senior Platform Engineer to build highly reliable, scalable APIs. You will work extensively with PHP, Laravel, Python, and modern JavaScript frameworks like React. Experience with AI integrations is a big plus.",
    'posting_language' => 'en',
]);

echo "Created base resume and job application for Admin User.\n";
