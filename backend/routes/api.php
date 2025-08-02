<?php

use App\Http\Controllers\PostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Rotas REST para posts (protegidas por autenticação)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('posts', PostController::class);
});
