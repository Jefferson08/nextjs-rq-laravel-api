<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Título do post
            $table->text('content'); // Conteúdo do post
            $table->string('author'); // Nome do autor
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft'); // Status do post
            $table->timestamp('published_at')->nullable(); // Data de publicação (nullable para drafts)
            $table->timestamps(); // created_at e updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
