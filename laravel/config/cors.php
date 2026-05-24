<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000', 'https://*.vercel.app'],

    //* : in dev env works fine without it
    //TODO : in case prod breaks api requests from the extension, it'd be because of CORS breaking, we'd then need to add this
        //* but for how its looking right now, i dont believe its going to be an issue 
        //*since extensions are trusted via their manifest and dont trigger laravels cors middleware
    // 'allowed_origins_patterns' => ['^chrome-extension:\/\/', '^moz-extension:\/\/'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];