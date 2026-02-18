<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Pengeluaran</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
        }
        h1 {
            font-size: 18px;
            margin-bottom: 4px;
        }
        .subtitle {
            font-size: 11px;
            color: #555;
            margin-bottom: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 6px 8px;
        }
        th {
            background-color: #f3f4f6;
            font-size: 11px;
            text-transform: uppercase;
        }
        td {
            font-size: 11px;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .mt-16 {
            margin-top: 16px;
        }
    </style>
</head>
<body>
    <h1>Laporan Pengeluaran</h1>
    <p class="subtitle">
        Periode: {{ \Carbon\Carbon::parse($start)->format('d M Y') }}
        - {{ \Carbon\Carbon::parse($end)->format('d M Y') }}
    </p>

    <table>
        <thead>
        <tr>
            <th>No</th>
            <th>Nama Produk</th>
            <th>Kategori</th>
            <th>Dibeli Oleh</th>
            <th>Tanggal</th>
            <th>Keterangan</th>
            <th class="text-right">Harga</th>
        </tr>
        </thead>
        <tbody>
        @php
            $totalPengeluaran = 0;
            $jumlahPembelian  = $data->count();
        @endphp

        @forelse($data as $index => $item)
            @php $totalPengeluaran += $item->price; @endphp
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->name }}</td>
                <td>{{ optional($item->category)->name ?? '-' }}</td>
                <td>{{ $item->created_by_name ?? 'Tidak diketahui' }}</td>
                <td>{{ \Carbon\Carbon::parse($item->date)->format('d-m-Y') }}</td>
                <td>{{ $item->description ?? '-' }}</td>
                <td class="text-right">{{ number_format($item->price, 0, ',', '.') }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="7" class="text-center">Belum ada data pengeluaran.</td>
            </tr>
        @endforelse
        </tbody>
    </table>

    <table class="mt-16">
        <tbody>
        <tr>
            <td><strong>Total Pengeluaran</strong></td>
            <td class="text-right"><strong>{{ number_format($totalPengeluaran, 0, ',', '.') }}</strong></td>
        </tr>
        <tr>
            <td><strong>Jumlah Pembelian</strong></td>
            <td class="text-right"><strong>{{ $jumlahPembelian }}</strong></td>
        </tr>
        </tbody>
    </table>
</body>
</html>
