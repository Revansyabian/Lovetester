<?php
header('Content-Type: application/json');

// Ganti dengan API key Anda dari NumVerify (https://numverify.com)
$api_key = "f8820f5bd7eb7f15b9661d72711ff2f4";

// Ambil nomor telepon dari request
$phoneNumber = isset($_POST['phoneNumber']) ? $_POST['phoneNumber'] : '';

if (empty($phoneNumber)) {
    echo json_encode([
        'success' => false,
        'error' => 'Nomor telepon tidak boleh kosong'
    ]);
    exit;
}

// Format nomor (pastikan sudah termasuk kode negara)
$phoneNumber = preg_replace('/[^0-9]/', '', $phoneNumber);

// Panggil API NumVerify
$url = "http://apilayer.net/api/validate?access_key={$api_key}&number={$phoneNumber}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);

if (isset($result['success']) {
    // Format respons untuk frontend
    echo json_encode([
        'success' => true,
        'valid' => $result['valid'],
        'number' => $result['international_format'],
        'carrier' => $result['carrier'],
        'line_type' => $result['line_type'],
        'country_code' => $result['country_code'],
        'country_name' => $result['country_name']
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Tidak dapat memeriksa nomor. Silakan coba lagi.'
    ]);
}
?>