<?php

namespace App\Exports;

use App\Models\Transaction;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize; // Tambahkan ini untuk lebar kolom otomatis
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class KasExport implements FromCollection, WithHeadings, WithColumnFormatting, WithStyles, ShouldAutoSize
{
    protected int|float $totalPemasukan = 0;
    protected int|float $totalPengeluaran = 0;
    protected int|float $sisaDana = 0;

    public function __construct(
        protected Request $request,
        protected string  $tipe
    ) {}

    public function collection()
    {
        $start = $this->request->filled('start')
            ? Carbon::parse($this->request->start)->startOfDay()
            : now()->startOfMonth()->startOfDay();

        $end = $this->request->filled('end')
            ? Carbon::parse($this->request->end)->endOfDay()
            : now()->endOfDay();

        // Logika Pemasukan
        if ($this->tipe === 'pemasukan') {
            $rows = Transaction::query()
                ->select(['invoice_number', 'cashier_name', 'total', 'created_at'])
                ->whereBetween('created_at', [$start, $end])
                ->latest()
                ->get();

            $this->totalPemasukan   = $rows->sum('total');
            $this->totalPengeluaran = Product::whereBetween('date', [$start, $end])->sum('price');
            $this->sisaDana         = $this->totalPemasukan - $this->totalPengeluaran;

            $mapped = $rows->values()->map(function ($row, $index) {
                return [
                    $index + 1,
                    $row->invoice_number,
                    $row->created_at?->format('d-m-Y H:i'),
                    $row->cashier_name ?? 'Sistem',
                    $row->total,
                ];
            });

            // Summary di bawah tabel
            $summaryRows = collect([
                [''],
                [''], 
                ['Total Pendapatan', '', '', '', $this->totalPemasukan],
                ['Beli Bahan', '', '', '', -$this->totalPengeluaran],
                ['Sisa Dana', '', '', '', $this->sisaDana],
            ]);

            return $mapped->concat($summaryRows);
        }

        // Logika Pengeluaran
        if ($this->tipe === 'pengeluaran') {
            $rows = Product::query()
                ->with('category')
                ->select(['name', 'price', 'date', 'category_id', 'created_by_name'])
                ->whereBetween('date', [$start, $end])
                ->latest('date')
                ->get();

            $this->totalPengeluaran = $rows->sum('price');
            $jumlahPembelian        = $rows->count();

            $mapped = $rows->values()->map(function ($row, $index) {
                return [
                    $index + 1,
                    $row->name,
                    optional($row->category)->name ?? '-',
                    $row->created_by_name ?? 'Tidak diketahui',
                    $row->date
                        ? Carbon::parse($row->date)->format('d-m-Y')
                        : null,
                    $row->price,
                ];
            });

            // Summary di bawah tabel
            $summaryRows = collect([
                [''], 
                ['Total Pengeluaran', '', '', '', '', $this->totalPengeluaran],
                ['Jumlah Pembelian', '', '', '', '', $jumlahPembelian],
            ]);

            return $mapped->concat($summaryRows);
        }

        return new Collection();
    }

    public function headings(): array
    {
        if ($this->tipe === 'pemasukan') {
            return [
                'No',
                'Id Transaksi',
                'Tanggal & Jam',
                'Penerima (Kasir)',
                'Total Pemasukan',
            ];
        }

        if ($this->tipe === 'pengeluaran') {
            return [
                'No',
                'Nama Produk',
                'Kategori',
                'Dibeli Oleh',
                'Tanggal',
                'Harga',
            ];
        }

        return [];
    }

    public function columnFormats(): array
    {
        if ($this->tipe === 'pemasukan') {
            return [
                'E' => '#,##0', 
            ];
        }

        if ($this->tipe === 'pengeluaran') {
            return [
                'F' => '#,##0', 
                'E' => '@',     
            ];
        }

        return [];
    }

    public function styles(Worksheet $sheet)
    {
        if ($this->tipe === 'pengeluaran') {
            $lastRow = $sheet->getHighestRow(); 
            $sheet->getStyle('F' . $lastRow)->getNumberFormat()->setFormatCode('0'); 
        }

        return [
            1 => ['font' => ['bold' => true]], 
        ];
    }
}