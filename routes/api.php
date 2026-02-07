<?php

use Illuminate\Support\Facades\Route;

Route::get('/reviews', function () {
    return response()->json([
        'rating' => 4.7,
        'userRatingCount' => 48,
        'reviews' => [
            [
                'author' => 'Willy Pujo Hidayat',
                'rating' => 5,
                'text' => 'Cafe-nya skena banget, ibarat jaksel mah, udah nyampe banget ini cafe. Asik banget, sayang aja jauh dari tempat saya di Jakarta, kebetulan mampir diajakin si Adit 😅. Sukses terus yaa',
                'relativeTime' => '6 bulan lalu',
            ],
            [
                'author' => 'Gifari Ahmad',
                'rating' => 5,
                'text' => 'First time here, the coffee soo good I bought the cafe latte, rich and yet creamy, the place fully decorated and warm.',
                'relativeTime' => '2 bulan lalu',
            ],
            [
                'author' => 'Lusiana Adriani',
                'rating' => 5,
                'text' => 'Tempat nongkrong enakeun, banyak disediain game-game seru dan bisa ambil tampa minimal order. Ada tempat photoboxnya juga.',
                'relativeTime' => '1 tahun lalu',
            ],
            [
                'author' => 'Stiefani A.R',
                'rating' => 5,
                'text' => 'Susananya sangat nyaman teduh dan bersih juga. Makanan nya enakk semua minumannya jugaa enakkk untuk harga standar, pelayanannya sangat amat ramah 👍',
                'relativeTime' => '1 tahun lalu',
            ],
            [
                'author' => 'Joko Sarjanoko',
                'rating' => 5,
                'text' => 'Rekomendasi untuk hang out bersama teman2, makanan murah2, keren. Minumannya ok',
                'relativeTime' => '11 bulan lalu',
            ],
            [
                'author' => 'Nisya Triana',
                'rating' => 5,
                'text' => 'Tempatnya adem bgt kalau sore ke malem, baristanya ramah minumannya juga enak, hargaya affordable mantepp',
                'relativeTime' => '11 bulan lalu',
            ],
            [
                'author' => 'Alyssa Tasya Puspita',
                'rating' => 5,
                'text' => 'makanan dan minumann nya enak bangett, tempatnya sejukkk',
                'relativeTime' => '2 tahun lalu',
            ],
            [
                'author' => 'Arief H',
                'rating' => 5,
                'text' => 'Affordable and comfy',
                'relativeTime' => '11 bulan lalu',
            ],
            [
                'author' => 'Maurent Nisa Adesty',
                'rating' => 5,
                'text' => 'Harga normal, enakk buat nugas hihihi',
                'relativeTime' => '2 tahun lalu',
            ],
            [
                'author' => 'putra setir mobil',
                'rating' => 5,
                'text' => 'Enak untuk keseluruhan dari tempat & pelayanan nya',
                'relativeTime' => '11 bulan lalu',
            ],
            [
                'author' => 'salsa bila',
                'rating' => 5,
                'text' => 'sumpah barista nya ramah bgt sma admin IG nya jga respon nya cepet bgt',
                'relativeTime' => '2 tahun lalu',
            ],
            [
                'author' => 'Muhammad syahrul Fahrezi',
                'rating' => 5,
                'text' => 'dua kali bertamu kesini suasananya enjoy',
                'relativeTime' => '3 minggu lalu',
            ],
            [
                'author' => 'rania farah',
                'rating' => 5,
                'text' => 'Tempatnya minimalis banget sih dan banyak pohon2 gitu di sekitarnya plus nya jadi adem tapi minus nya banyak nyamuk haha, tapi mereka nyediain autan kok. Ada berbagai mainan juga yang di sediain, dan Ada kertas buat mewarnai dan disediain pensil warna nya juga Barista nya asik banget, ramah dan baik banget',
                'relativeTime' => '2 tahun lalu',
            ],
            [
                'author' => 'Aris Ulukutek',
                'rating' => 5,
                'text' => 'nambah lagi pilihan ngopi area taman heulang. saya mampir dulu ke sini sebelum jalan pagi di TaHeul atau taman heulang. saya pilih duduk diarea luar karena suasana pagi nya masih bagus. Capucino plus roti keju buat camilannya. harganya masih ramah seperti sambutannya juga pembayaran bisa pakai Qris. ruang dalam nya cukup luas juga.',
                'relativeTime' => '7 bulan lalu',
            ],
            [
                'author' => 'Darsehsri',
                'rating' => 5,
                'text' => 'Lokasi baru Ta-Mu jauh lebih strategis dari lokasi lamanya, tempatnya juga lebih hangat dan bersih. Interior juga cukup menarik, perpaduan merah dan putih terlihat matching di setiap sudutnya. Sore itu saya pesan Mocktail Coffee -Sun Kiss Me, Kopi Bertemu, Pisang Molen, Cireng, Carbonara dan Rice Bowl Chicken Skin -kalau tidak salah. Semua pesanan saya dan teman oke banget, rasanya enak apalagi kalo lihat harganya sangat terjangkau. Tapi yang bikin saya pengen dan pasti balik lagi, Mocktail Coffee-nya Juara, seger dan harus cobain buat yang mau nongkrong disini.',
                'relativeTime' => '6 bulan lalu',
            ],
            [
                'author' => 'Gemi Agung',
                'rating' => 5,
                'text' => 'Luas, nyaman sofa nya. Ada area outdoor juga',
                'relativeTime' => '6 bulan lalu',
            ],
            [
                'author' => 'martha',
                'rating' => 4,
                'text' => 'makanan enak dan murah, minusnya kadang ada nyamuk..',
                'relativeTime' => '4 bulan lalu',
            ],
            [
                'author' => 'Kamboja Kuning Project',
                'rating' => 4,
                'text' => 'Ngopi dengan suasana teduh',
                'relativeTime' => '2 tahun lalu',
            ],
            [
                'author' => 'Social More',
                'rating' => 5,
                'text' => 'Ambience, minuman, dan makanannya enaak! Staff-staffnya juga helpful dan ramah banget. Worth to try kalau kalian mau cari tempat ngobrol dan ngopi di tengah kota Bogor.',
                'relativeTime' => '2 tahun lalu',
            ],
            [
                'author' => 'Kaisar Rizt',
                'rating' => 5,
                'text' => 'Murmer, nyaman, vibes nya enak buat kumpul kumpul sama temen atau nugas',
                'relativeTime' => '2 tahun lalu',
            ],
            [
                'author' => 'aulia fitriyanti',
                'rating' => 5,
                'text' => 'drinks, the atmosphere is good and cool. The employees are also nice',
                'relativeTime' => '2 tahun lalu',
            ],
            [
                'author' => 'desi agustn',
                'rating' => 5,
                'text' => 'Food: 5/5 | Service: 5/5',
                'relativeTime' => '6 bulan lalu',
            ],
        ],
    ]);
});
