<?php

namespace App\Http\Controllers;

use App\Models\TransactionDetail;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SummaryController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->get('type', 'top');
        $search = $request->get('search');

        if ($type === 'top') {
            $query = TransactionDetail::select('menu_name', DB::raw('SUM(quantity) as total_sold'))
                ->groupBy('menu_name')
                ->orderByDesc('total_sold');
            
            if ($search) {
                $query->having('menu_name', 'like', '%' . $search . '%');
            }
            
            $menus = $query->paginate(20)
                ->through(function ($item) {
                    $menu = Menu::where('name', $item->menu_name)->first();
                    $item->image = $menu ? $menu->image : null;
                    $item->price = $menu ? $menu->price : null;
                    return $item;
                });
        } else {
            $query = TransactionDetail::select('menu_name', DB::raw('SUM(quantity) as total_sold'))
                ->groupBy('menu_name')
                ->having('total_sold', '<=', 5)
                ->orderBy('total_sold');
            
            if ($search) {
                $query->having('menu_name', 'like', '%' . $search . '%');
            }
            
            $menus = $query->paginate(20)
                ->through(function ($item) {
                    $menu = Menu::where('name', $item->menu_name)->first();
                    $item->image = $menu ? $menu->image : null;
                    $item->price = $menu ? $menu->price : null;
                    return $item;
                });
        }

        return Inertia::render('Admin/Kasir/Summary/Index', [
            'menus' => $menus,
            'type' => $type,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}