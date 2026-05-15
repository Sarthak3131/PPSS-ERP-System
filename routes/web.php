<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Catch-all route for SPA - return welcome view for all routes so React Router handles them
Route::fallback(function () {
    return view('welcome');
});
