<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GoogleReviewController extends Controller
{
    public function index()
    {
        $apiKey  = config('services.google.places_key');
        $placeId = config('services.google.place_id_tamu_kopi');

        if (!$apiKey || !$placeId) {
            return response()->json(['error' => 'Missing Google Places configuration'], 500);
        }

        $url = "https://maps.googleapis.com/maps/api/place/details/json";

        $response = Http::get($url, [
            'place_id' => $placeId,
            'fields'   => 'rating,user_ratings_total,reviews',
            'key'      => $apiKey,
            'language' => 'id',
        ]);

        if (!$response->ok()) {
            return response()->json(['error' => 'Failed to call Google Places'], 500);
        }

        $data = $response->json();

        if (($data['status'] ?? null) !== 'OK') {
            return response()->json(['error' => 'Google Places status not OK', 'raw' => $data], 500);
        }

        $result  = $data['result'] ?? [];
        $reviews = $result['reviews'] ?? [];

        $goodReviews = collect($reviews)
            ->filter(fn($r) => ($r['rating'] ?? 0) >= 4)
            ->take(6)
            ->map(fn($r) => [
                'author'       => $r['author_name'] ?? 'Pengguna Google',
                'rating'       => $r['rating'] ?? null,
                'text'         => $r['text'] ?? '',
                'relativeTime' => $r['relative_time_description'] ?? '',
            ])
            ->values()
            ->all();

        return response()->json([
            'rating'          => $result['rating'] ?? null,
            'userRatingCount' => $result['user_ratings_total'] ?? 0,
            'reviews'         => $goodReviews,
        ]);
    }
}
