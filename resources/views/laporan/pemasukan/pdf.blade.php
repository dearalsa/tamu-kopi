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
        }
        h3 { 
            margin: 0 0 12px 0; 
            font-size: 18px;
            font-weight: bold;
        }
        p { 
            margin: 2px 0; 
            font-size: 12px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px;
            font-size: 10px;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 6px 8px; 
            text-align: left;
        }
        th { 
            background: #f8f9fa; 
            font-weight: bold;
            font-size: 10px;
        }
        .text-right { 
            text-align: right; 
        }
        .mt-20 { 
            margin-top: 20px; 
        }

        /* summary mengikuti style tabel biasa */
        .summary-table {
            width: 50%;
            margin-top: 20px;
            border-collapse: collapse;
            font-size: 10px;
        }
        .summary-table td {
            border: 1px solid #ddd;
            padding: 6px 8px;
        }
        .summary-label {
            font-weight: bold;
        }
        .summary-value {
            text-align: right;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h3>Laporan Pemasukan</h3>
    <p><strong>Periode:</strong> {{ $start->format('d M Y') }} s/d {{ $end->format('d M Y') }}</p>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 18%;">Id Transaksi</th>
                <th style="width: 15%;">Tanggal</th>
                <th style="width: 10%;">Jam</th>
                <th style="width: 25%;">Penerima (Kasir)</th>
                <th class="text-right" style="width: 27%;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $i => $row)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $row->invoice_number }}</td>
                    <td>{{ $row->created_at->format('d-m-Y') }}</td>
                    <td>{{ $row->created_at->format('H:i') }}</td>
                    <td>{{ $row->cashier_name ?? 'Sistem' }}</td>
                    <td class="text-right">
                        Rp {{ number_format($row->total, 0, ',', '.') }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    @php
        $total_pemasukan = $data->sum('total');
        $total_pengeluaran = \App\Models\Product::whereBetween(
            'date', 
            [$start->copy()->startOfDay(), $end->copy()->endOfDay()]
        )->sum('price');
        $saldo_bersih = $total_pemasukan - $total_pengeluaran;
    @endphp

    <div class="mt-20">
        <table class="summary-table">
            <tr>
                <td class="summary-label">Total Pendapatan</td>
                <td class="summary-value">
                    Rp {{ number_format($total_pemasukan, 0, ',', '.') }}
                </td>
            </tr>
            <tr>
                <td class="summary-label">Total Beli Bahan</td>
                <td class="summary-value">
                    Rp {{ number_format($total_pengeluaran, 0, ',', '.') }}
                </td>
            </tr>
            <tr>
                <td class="summary-label">Sisa Dana</td>
                <td class="summary-value">
                    Rp {{ number_format($saldo_bersih, 0, ',', '.') }}
                </td>
            </tr>
        </table>
    </div>
</body>
</html>