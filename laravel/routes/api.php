<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\ResumeController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AiController;
use App\Http\Controllers\ReminderController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/email/verify', [AuthController::class, 'verifyEmail']);

// AI extraction (public for browser extension)
Route::post('/ai/extract-job', [AiController::class, 'extractJob']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/password', [AuthController::class, 'changePassword']);
    Route::post('/email/verification', [AuthController::class, 'sendEmailVerification']);

    // Applications
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::get('/applications/dashboard', [ApplicationController::class, 'dashboard']);
    Route::post('/applications', [ApplicationController::class, 'store']);
    Route::get('/applications/{id}', [ApplicationController::class, 'show']);
    Route::put('/applications/{id}', [ApplicationController::class, 'update']);
    Route::delete('/applications/{id}', [ApplicationController::class, 'destroy']);
    Route::patch('/applications/{id}/status', [ApplicationController::class, 'updateStatus']);

    // Tasks (nested under applications)
    Route::get('/applications/{applicationId}/tasks', [TaskController::class, 'index']);
    Route::post('/applications/{applicationId}/tasks', [TaskController::class, 'store']);
    Route::put('/applications/{applicationId}/tasks/{id}', [TaskController::class, 'update']);
    Route::patch('/applications/{applicationId}/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/applications/{applicationId}/tasks/{id}', [TaskController::class, 'destroy']);

    // Documents (nested under applications)
    Route::get('/applications/{applicationId}/documents', [DocumentController::class, 'index']);
    Route::post('/applications/{applicationId}/documents', [DocumentController::class, 'store']);
    Route::get('/applications/{applicationId}/documents/{id}/download', [DocumentController::class, 'download']);
    Route::delete('/applications/{applicationId}/documents/{id}', [DocumentController::class, 'destroy']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications', [NotificationController::class, 'destroyAll']);

    // Tags
    Route::get('/tags', [TagController::class, 'index']);
    Route::post('/tags', [TagController::class, 'store']);
    Route::delete('/tags/{id}', [TagController::class, 'destroy']);

    // Resumes
    Route::get('/resumes', [ResumeController::class, 'index']);
    Route::post('/resumes', [ResumeController::class, 'store']);
    Route::get('/resumes/{id}', [ResumeController::class, 'show']);
    Route::put('/resumes/{id}', [ResumeController::class, 'update']);
    Route::delete('/resumes/{id}', [ResumeController::class, 'destroy']);
    Route::get('/resumes/{id}/export-pdf', [ResumeController::class, 'exportPdf']);
    Route::post('/resumes/{id}/generate', [ResumeController::class, 'generateWithAi']);

    // Admin
    Route::prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/users', [AdminController::class, 'store']);
        Route::put('/users/{id}', [AdminController::class, 'update']);
        Route::patch('/users/{id}/deactivate', [AdminController::class, 'deactivate']);
        Route::patch('/users/{id}/activate', [AdminController::class, 'activate']);
        Route::patch('/users/{id}/grant-admin', [AdminController::class, 'grantAdmin']);
        Route::patch('/users/{id}/revoke-admin', [AdminController::class, 'revokeAdmin']);
        Route::delete('/users/{id}', [AdminController::class, 'destroy']);
        Route::get('/ai-logs', [AdminController::class, 'aiLogs']);
    });
});