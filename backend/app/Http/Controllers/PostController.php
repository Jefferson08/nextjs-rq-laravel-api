<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Http\Resources\PostResource;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Post::query();

        // Busca global
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%");
            });
        }

        // Filtro por status
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        // Ordenação
        $sortBy = $request->query('sort_by', 'published_at');
        $sortDir = $request->query('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        // Paginação
        $perPage = $request->query('per_page', 10);
        $posts = $query->paginate($perPage);

        return PostResource::collection($posts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // ⏳ Delay de 1.5 segundos para demonstrar optimistic updates
        sleep(1.5);
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'author' => 'required|string|max:100',
            'status' => 'required|in:draft,published,archived',
            'published_at' => 'nullable|date',
        ]);

        // Se published_at não foi fornecida e o status é 'published', definir a data atual
        if (!isset($validated['published_at']) && $validated['status'] === 'published') {
            $validated['published_at'] = now();
        }

        $post = Post::create($validated);

        return new PostResource($post);
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        return new PostResource($post);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        // ⏳ Delay de 1.5 segundos para demonstrar optimistic updates
        sleep(1.5);
        
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'author' => 'sometimes|required|string|max:100',
            'status' => 'sometimes|required|in:draft,published,archived',
            'published_at' => 'nullable|date',
        ]);

        // Se o status está mudando para 'published' e não há published_at definido, usar data atual
        if (isset($validated['status']) && $validated['status'] === 'published' && 
            !isset($validated['published_at']) && is_null($post->published_at)) {
            $validated['published_at'] = now();
        }

        $post->update($validated);

        return new PostResource($post);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        // ⏳ Delay de 1.5 segundos para demonstrar optimistic updates
        sleep(1.5);
        
        $post->delete();

        return response()->noContent();
    }

    /**
     * Remove multiple resources from storage.
     */
    public function bulkDestroy(Request $request)
    {
        // ⏳ Delay de 2 segundos para demonstrar optimistic updates
        sleep(2);
        
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:posts,id'
        ]);

        $deletedCount = Post::whereIn('id', $validated['ids'])->delete();

        return response()->json([
            'message' => "Deleted {$deletedCount} posts successfully",
            'deleted_count' => $deletedCount
        ]);
    }
}
