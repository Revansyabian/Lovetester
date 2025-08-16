<?php
/* ================================================
 * WEBSITE CEK STATUS NOMOR TELEPON (REAL)
 * ================================================
 * Fungsi: Mengecek status nomor menggunakan API NumVerify
 */

// API Key dari NumVerify (https://numverify.com) - Daftar untuk dapatkan API key gratis
$api_key = "GANTI_DENGAN_API_KEY_ANDA";

// Fungsi utama pengecekan nomor
function cekNomor($nomor, $api_key) {
    $url = "http://apilayer.net/api/validate?access_key={$api_key}&number={$nomor}";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Proses form
$result = null;
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['cek_nomor'])) {
    $nomor = preg_replace('/[^0-9]/', '', $_POST['nomor']);
    if (strlen($nomor) >= 10) {
        $result = cekNomor($nomor, $api_key);
    }
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cek Status Nomor Telepon</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .valid { background-color: #e6ffe6; border-left: 5px solid #4CAF50; }
        .invalid { background-color: #ffe6e6; border-left: 5px solid #f44336; }
        .form-group { margin-bottom: 15px; }
        button { background-color: #2196F3; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>Cek Status Nomor Telepon</h1>
    
    <div class="card">
        <form method="post">
            <div class="form-group">
                <label>Masukkan Nomor Telepon:</label>
                <input type="text" name="nomor" placeholder="Contoh: 08123456789" required style="width: 100%; padding: 8px;">
            </div>
            <button type="submit" name="cek_nomor">Cek Status</button>
        </form>
    </div>

    <?php if ($result): ?>
    <div class="card <?php echo $result['valid'] ? 'valid' : 'invalid'; ?>">
        <h3>Hasil Pengecekan</h3>
        <p><strong>Nomor:</strong> <?= htmlspecialchars($result['number'] ?? '-') ?></p>
        <p><strong>Status:</strong> 
            <?php if ($result['valid']): ?>
                <span style="color: green;">AKTIF</span>
            <?php else: ?>
                <span style="color: red;">BANNED/TIDAK VALID</span>
            <?php endif; ?>
        </p>
        <p><strong>Provider:</strong> <?= htmlspecialchars($result['carrier'] ?? '-') ?></p>
        <p><strong>Tipe:</strong> <?= htmlspecialchars($result['line_type'] ?? '-') ?></p>
        <p><strong>Lokasi:</strong> <?= htmlspecialchars($result['country_name'] ?? '-') ?></p>
    </div>
    <?php endif; ?>

    <div class="card">
        <h3>Cara Kerja Sistem Ini:</h3>
        <p>Website ini menggunakan API dari <a href="https://numverify.com" target="_blank">NumVerify</a> untuk mengecek status nomor telepon secara real-time.</p>
        <p>Fitur yang tersedia:</p>
        <ul>
            <li>Validasi nomor telepon</li>
            <li>Deteksi nomor banned/tidak aktif</li>
            <li>Informasi provider</li>
            <li>Lokasi nomor</li>
        </ul>
    </div>
</body>
</html>