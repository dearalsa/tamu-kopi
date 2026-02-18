<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Transaction;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\KasExport;

class LaporanKasController extends Controller
{
    public function pemasukan(Request $request)
    {
        $start = $request->filled('start')
            ? Carbon::parse($request->start)->startOfDay()
            : now()->startOfMonth()->startOfDay();

        $end = $request->filled('end')
            ? Carbon::parse($request->end)->endOfDay()
            : now()->endOfDay();

        $transactions = Transaction::with('user')
            ->whereBetween('created_at', [$start, $end])
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($trx) => [
                'id'           => $trx->id,
                'invoice'      => $trx->invoice_number,
                'total'        => (float) $trx->total,
                'created_at'   => $trx->created_at,
                'cashier_name' => $trx->cashier_name ?? $trx->user?->name ?? '-', // ← fix
            ]);

        $totalPemasukan   = Transaction::whereBetween('created_at', [$start, $end])->sum('total');
        $totalPengeluaran = Product::whereBetween('date', [$start, $end])->sum('price');
        $saldoBersih      = $totalPemasukan - $totalPengeluaran;

        return inertia('Admin/Laporan/Pemasukan/Index', [
            'transactions' => $transactions,
            'start'        => $start->toDateString(),
            'end'          => $end->toDateString(),
            'summary'      => [
                'total_pemasukan'   => (float) $totalPemasukan,
                'total_pengeluaran' => (float) $totalPengeluaran,
                'saldo_bersih'      => (float) $saldoBersih,
            ],
        ]);
    }

    public function pengeluaran(Request $request)
    {
        $start = $request->filled('start')
            ? Carbon::parse($request->start)->startOfDay()
            : now()->startOfMonth()->startOfDay();

        $end = $request->filled('end')
            ? Carbon::parse($request->end)->endOfDay()
            : now()->endOfMonth()->endOfDay();

        $query = Product::with('category')
            ->whereBetween('date', [$start, $end])
            ->latest('date');

        $totalPengeluaran = $query->clone()->sum('price');
        $jumlahTransaksi  = $query->clone()->count();

        $products = $query
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($p) => [
                'id'              => $p->id,
                'name'            => $p->name,
                'price'           => (float) $p->price,
                'date'            => $p->date,
                'created_by_name' => $p->created_by_name ?? '-',
                'description'     => $p->description ?? '-',
                'category'        => [
                    'name' => $p->category->name ?? 'Umum',
                ],
            ]);

        return inertia('Admin/Laporan/Pengeluaran/Index', [
            'products' => $products,
            'start'    => $start->toDateString(),
            'end'      => $end->toDateString(),
            'summary'  => [
                'total_pengeluaran' => (float) $totalPengeluaran,
                'jumlah_transaksi'  => (int) $jumlahTransaksi,
            ],
        ]);
    }

    public function export(Request $request, $tipe)
    {
        $start = $request->filled('start')
            ? Carbon::parse($request->start)->startOfDay()
            : now()->startOfMonth()->startOfDay();

        $end = $request->filled('end')
            ? Carbon::parse($request->end)->endOfDay()
            : now()->endOfMonth()->endOfDay();

        $format = $request->get('format');

        if ($tipe === 'pemasukan') {
            $data = Transaction::with('user')
                ->whereBetween('created_at', [$start, $end])
                ->latest()
                ->get();

            $extraData = [
                'total_pengeluaran' => Product::whereBetween('date', [$start, $end])->sum('price'),
            ];
        } elseif ($tipe === 'pengeluaran') {
            $data = Product::with('category')
                ->whereBetween('date', [$start, $end])
                ->latest('date')
                ->get();

            $extraData = [];
        } else {
            abort(404);
        }

        if ($format === 'pdf') {
            $pdf = Pdf::loadView(
                "laporan.{$tipe}.pdf",
                array_merge(compact('data', 'start', 'end'), $extraData)
            );

            return $pdf->download("laporan_{$tipe}_" . now()->format('Ymd') . ".pdf");
        }

        if ($format === 'excel') {
            return Excel::download(
                new KasExport($request, $tipe),
                "laporan_{$tipe}_" . now()->format('Ymd') . ".xlsx"
            );
        }

        return redirect()->back()->with('error', 'Format tidak didukung');
    }
}