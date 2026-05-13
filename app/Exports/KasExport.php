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
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class KasExport implements FromCollection, WithHeadings, WithColumnFormatting, WithStyles, ShouldAutoSize
{
    protected int|float $totalPemasukanSuccess = 0;
    protected int|float $totalNominalVoid = 0;
    protected int|float $totalPengeluaran = 0;
    protected int|float $sisaDanaAktual = 0;

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

        // --- LOGIKA PEMASUKAN ---
        if ($this->tipe === 'pemasukan') {
            // AMBIL SEMUA DATA (Success & Void) + Alasan Void
            $rows = Transaction::query()
                ->select(['invoice_number', 'cashier_name', 'total', 'created_at', 'status', 'void_reason'])
                ->whereBetween('created_at', [$start, $end])
                ->latest()
                ->get();

            // Hitung statistik untuk Summary
            $this->totalPemasukanSuccess = $rows->where('status', 'success')->sum('total');
            $this->totalNominalVoid      = $rows->where('status', 'void')->sum('total');
            $this->totalPengeluaran      = Product::whereBetween('date', [$start, $end])->sum('price');
            $this->sisaDanaAktual        = $this->totalPemasukanSuccess - $this->totalPengeluaran;

            $mapped = $rows->values()->map(function ($row, $index) {
                return [
                    $index + 1,
                    $row->invoice_number,
                    $row->created_at?->format('d-m-Y H:i'),
                    $row->cashier_name ?? 'Sistem',
                    strtoupper($row->status), // Menampilkan status (SUCCESS/VOID)
                    $row->status === 'void' ? ($row->void_reason ?? 'Tanpa alasan') : '-', 
                    $row->total,
                ];
            });

            // Tambahkan baris kosong dan Summary (Persis seperti di PDF)
            $summaryRows = collect([
                [''], // Jeda baris
                ['RINGKASAN LAPORAN'],
                ['Total Transaksi Sukses', '', '', '', '', '', $this->totalPemasukanSuccess],
                ['Total Nominal VOID', '', '', '', '', '', -$this->totalNominalVoid],
                ['Total Pengeluaran (Bahan)', '', '', '', '', '', -$this->totalPengeluaran],
                ['Sisa Dana', '', '', '', '', '', $this->sisaDanaAktual],
            ]);

            return $mapped->concat($summaryRows);
        }

        // --- LOGIKA PENGELUARAN ---
        if ($this->tipe === 'pengeluaran') {
            $rows = Product::query()
                ->with('category')
                ->select(['name', 'price', 'date', 'category_id', 'created_by_name', 'description'])
                ->whereBetween('date', [$start, $end])
                ->latest('date')
                ->get();

            $this->totalPengeluaran = $rows->sum('price');
            $jumlahPembelian        = $rows->count();

            $mapped = $rows->values()->map(function ($row, $index) {
                return [
                    $index + 1,
                    $row->name,
                    optional($row->category)->name ?? 'Umum',
                    $row->created_by_name ?? 'Admin',
                    $row->date ? Carbon::parse($row->date)->format('d-m-Y') : '-',
                    $row->description ?? '-',
                    $row->price,
                ];
            });

            $summaryRows = collect([
                [''],
                ['Total Pengeluaran', '', '', '', '', '', $this->totalPengeluaran],
                ['Jumlah Pembelian', '', '', '', '', '', $jumlahPembelian],
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
                'Waktu',
                'Kasir',
                'Status',
                'Alasan Void',
                'Total Nominal',
            ];
        }

        return [
            'No',
            'Nama Produk',
            'Kategori',
            'Dibeli Oleh',
            'Tanggal',
            'Keterangan',
            'Harga',
        ];
    }

    public function columnFormats(): array
    {
        // Kolom G adalah Total/Harga di kedua tipe
        return [
            'G' => '#,##0',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();
        
        // Style Header (Baris 1)
        $sheet->getStyle('1')->getFont()->setBold(true);
        $sheet->getStyle('1')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setARGB('F3F4F6');

        // Beri warna Merah untuk status VOID di kolom E (Pemasukan)
        if ($this->tipe === 'pemasukan') {
            for ($i = 2; $highestRow; $i++) {
                $cellValue = $sheet->getCell('E' . $i)->getValue();
                if ($cellValue === 'VOID') {
                    $sheet->getStyle('E' . $i)->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('E53E3E'))->setBold(true);
                    $sheet->getStyle('G' . $i)->getFont()->setStrikethrough(true); // Coret harga jika void
                }
                if ($i >= $highestRow) break;
            }
        }

        // Style untuk Summary di bagian bawah
        $summaryStartRow = $highestRow - ($this->tipe === 'pemasukan' ? 4 : 1);
        $sheet->getStyle($summaryStartRow . ':' . $highestRow)->getFont()->setBold(true);
        
        // Rata kanan untuk kolom nominal
        $sheet->getStyle('G2:G' . $highestRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        return [];
    }
}