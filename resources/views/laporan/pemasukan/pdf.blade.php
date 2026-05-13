<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Pemasukan</title>
    <style>
        body { 
            font-family: sans-serif; 
            font-size: 11px; 
            margin: 0;
            padding: 20px;
            color: #333;
        }
        h3 { 
            margin: 0 0 5px 0; 
            font-size: 18px;
            font-weight: bold;
            color: #000;
        }
        .header-info {
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px;
            font-size: 10px;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 8px 10px; 
            text-align: left;
            vertical-align: top;
        }
        th { 
            background: #f8f9fa; 
            font-weight: bold;
            text-transform: uppercase;
            color: #555;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        /* Status Styling */
        .status-void {
            color: #e53e3e;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-success {
            color: #38a169;
            font-weight: bold;
            text-transform: uppercase;
        }
        .bg-void {
            background-color: #fff5f5; /* Merah sangat tipis */
        }
        .void-reason {
            font-size: 9px;
            color: #c53030;
            font-style: italic;
            display: block;
            margin-top: 4px;
        }

        /* Summary */
        .summary-container {
            margin-top: 30px;
        }
        .summary-table {
            width: 50%;
            margin-left: auto; /* Summary di sebelah kanan agar rapi */
            border-collapse: collapse;
        }
        .summary-table td {
            padding: 7px 10px;
            border: 1px solid #ddd;
        }
        .summary-label {
            background: #f8f9fa;
            font-weight: bold;
        }
        .summary-value {
            text-align: right;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header-info">
        <h3>LAPORAN PEMASUKAN & RIWAYAT TRANSAKSI</h3>
        <p style="margin: 0;">Periode: <strong>{{ $start->format('d M Y') }}</strong> s/d <strong>{{ $end->format('d M Y') }}</strong></p>
    </div>

    <table>
        <thead>
            <tr>
                <th class="text-center" style="width: 5%;">No</th>
                <th style="width: 15%;">Id Transaksi</th>
                <th style="width: 15%;">Waktu</th>
                <th style="width: 15%;">Kasir</th>
                <th class="text-center" style="width: 10%;">Status</th>
                <th class="text-right" style="width: 40%;">Total & Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $i => $row)
                <tr class="{{ $row->status === 'void' ? 'bg-void' : '' }}">
                    <td class="text-center">{{ $i + 1 }}</td>
                    <td><strong>{{ $row->invoice_number }}</strong></td>
                    <td>
                        {{ $row->created_at->format('d/m/Y') }}<br>
                        <small>{{ $row->created_at->format('H:i') }} WIB</small>
                    </td>
                    <td>{{ $row->cashier_name ?? 'Sistem' }}</td>
                    <td class="text-center">
                        <span class="{{ $row->status === 'void' ? 'status-void' : 'status-success' }}">
                            {{ $row->status }}
                        </span>
                    </td>
                    <td class="text-right">
                        @if($row->status === 'void')
                            <span style="text-decoration: line-through; color: #999;">
                                Rp {{ number_format($row->total, 0, ',', '.') }}
                            </span>
                            <span class="void-reason">Alasan Void: {{ $row->void_reason ?? 'Tidak ada alasan' }}</span>
                        @else
                            <strong>Rp {{ number_format($row->total, 0, ',', '.') }}</strong>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    @php
        // LOGIKA SALDO AKTUAL (Hanya yang SUCCESS)
        $pemasukan_sukses = $data->where('status', 'success')->sum('total');
        $total_void = $data->where('status', 'void')->sum('total');
        
        // Pengeluaran ambil dari tabel Product (Beli Bahan)
        $total_pengeluaran = \App\Models\Product::whereBetween('date', [
            $start->copy()->startOfDay(), 
            $end->copy()->endOfDay()
        ])->sum('price');
        
        $saldo_akhir = $pemasukan_sukses - $total_pengeluaran;
    @endphp

    <div class="summary-container">
        <table class="summary-table">
            <tr>
                <td class="summary-label">Total Transaksi Sukses</td>
                <td class="summary-value">Rp {{ number_format($pemasukan_sukses, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="summary-label" style="color: #e53e3e;">Total Nominal VOID</td>
                <td class="summary-value" style="color: #e53e3e;">- Rp {{ number_format($total_void, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="summary-label">Total Pengeluaran (Bahan)</td>
                <td class="summary-value" style="color: #e53e3e;">- Rp {{ number_format($total_pengeluaran, 0, ',', '.') }}</td>
            </tr>
            <tr style="background: #ebf8ff; font-size: 12px;">
                <td class="summary-label" style="background: #ebf8ff; color: #2b6cb0;">Sisa Dana</td>
                <td class="summary-value" style="color: #2b6cb0;">Rp {{ number_format($saldo_akhir, 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>

    <div style="margin-top: 50px; font-size: 9px; color: #999; text-align: center;">
        Laporan ini digenerate otomatis oleh sistem pada {{ now()->format('d/m/Y H:i:s') }}
    </div>
</body>
</html>