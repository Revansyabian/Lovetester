<?php
class dcode {
	public $api_url = 'https://sprintpedia.id/api/'; // API URL
	public $secret_key = 'NUsyYy9QTEtwb1UrUmZIeVhvcXRMQT09'; // SECRET KEY
	public $api_key = 'c20988-3a9160-ffccde-a5f18e-e4ebc1'; // API KEY

	public function profile() {
		return json_decode($this->connect($this->api_url.'profile', array('secret_key' => $this->secret_key, 'api_key' => $this->api_key)));
	}

	public function services() {
		return json_decode($this->connect($this->api_url.'services', array('secret_key' => $this->secret_key, 'api_key' => $this->api_key)));
	}

	public function order($data) {
		return json_decode($this->connect($this->api_url.'order', array_merge(array('secret_key' => $this->secret_key, 'api_key' => $this->api_key), $data)));
	}

	public function status($order_id) {
		return json_decode($this->connect($this->api_url.'status', array('secret_key' => $this->secret_key, 'api_key' => $this->api_key, 'id' => $order_id)));
	}

	private function connect($end_point, $post) {
		$_post = Array();
		if (is_array($post)) {
			foreach ($post as $name => $value) {
				$_post[] = $name.'='.urlencode($value);
			}
		}
		$ch = curl_init($end_point);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		if (is_array($post)) {
			curl_setopt($ch, CURLOPT_POSTFIELDS, join('&', $_post));
		}
		curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)');
		$result = curl_exec($ch);
		if (curl_errno($ch) != 0 && empty($result)) {
			$result = false;
		}
		curl_close($ch);
		return $result;
	}
}

// contoh penggunaan

$api = new dcode();

// cek profil
$profile = $api->profile();
print_r($profile);
print('<br /><br />');

// daftar layanan
$services = $api->services();
print_r($services);
print('<br /><br />');

// membuat pesanan
$order = $api->order(array(
	'service' => 1, // id layanan 
	'target' => 'dolanancode', // target pesanan
	'quantity' => 100 // jumlah pesan
));
print_r($order);
print('<br /><br />');

// membuat pesanan custom komentar
$order = $api->order(array(
	'service' => 1, // id layanan 
	'target' => 'linkpost', // target pesanan
	'custom_comments' => "wow keren\r\nkeren banget" // daftar komentar
	'custom_link' => "linkpost" // kustom link
));
print_r($order);
print('<br /><br />');

// cek status pesanan
$status = $api->status('1107'); // 123 = id pesanan
print_r($status);