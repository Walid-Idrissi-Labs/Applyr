<?php

use App\Http\Controllers\GoogleAuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// These routes intentionally use the web middleware group so Socialite can
// validate its state value from the Laravel session after Google redirects back.
Route::prefix('auth/google')->middleware('throttle:10,1')->group(function () {
    Route::get('/redirect', [GoogleAuthController::class, 'redirect']);
    Route::get('/callback', [GoogleAuthController::class, 'callback']);
});
