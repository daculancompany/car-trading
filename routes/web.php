<?php

use Illuminate\Support\Facades\Route;

// Web Routes
// Here is where you can register web routes for your application. These
// routes are loaded by the RouteServiceProvider and all of them will
// be assigned to the "web" middleware group. Make something great!

// React SPA (resources/js) — handles every non-API path client-side.
Route::view('/{any?}', 'app')->where('any', '^(?!api|storage|sanctum).*$');
