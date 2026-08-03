<?php
namespace App\Repositories\Sheets;

/**
 * Klien minimal untuk Google Sheets API v4 pakai Service Account,
 * ditulis tanpa dependency composer (biar tetap ringan di hosting
 * shared seperti Hostinger). Hanya mengimplementasikan yang dipakai
 * aplikasi ini: values.get, values.update, values.append, batchUpdate.
 *
 * Satu instance = satu file spreadsheet (setiap "tabel" di aplikasi ini
 * adalah file Google Spreadsheet-nya sendiri, lihat SheetsTable.php).
 * Token OAuth di-cache statis lintas-instance karena satu service account
 * yang sama dipakai untuk semua file.
 *
 * Cara setup credential: lihat docs/google-sheets-setup.md
 */
class SheetsClient
{
    private static ?string $cachedToken = null;
    private static int $cachedTokenExpiry = 0;

    private string $spreadsheetId;

    public function __construct(string $spreadsheetId)
    {
        $this->spreadsheetId = $spreadsheetId;
    }

    private function getAccessToken(): string
    {
        if (self::$cachedToken && time() < self::$cachedTokenExpiry - 30) {
            return self::$cachedToken;
        }
        $json = json_decode(file_get_contents(GOOGLE_SERVICE_ACCOUNT_JSON_PATH), true);
        if (!$json) throw new \RuntimeException('File service-account.json tidak ditemukan/tidak valid');

        $now = time();
        $header = self::b64(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
        $claims = self::b64(json_encode([
            'iss' => $json['client_email'],
            'scope' => 'https://www.googleapis.com/auth/spreadsheets',
            'aud' => 'https://oauth2.googleapis.com/token',
            'exp' => $now + 3600,
            'iat' => $now,
        ]));
        $signInput = $header . '.' . $claims;
        openssl_sign($signInput, $signature, $json['private_key'], 'SHA256');
        $jwt = $signInput . '.' . self::b64($signature);

        $ch = curl_init('https://oauth2.googleapis.com/token');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POSTFIELDS => http_build_query([
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]),
        ]);
        $res = curl_exec($ch);
        curl_close($ch);
        $data = json_decode($res, true);
        if (empty($data['access_token'])) throw new \RuntimeException('Gagal otentikasi ke Google Sheets: ' . $res);

        self::$cachedToken = $data['access_token'];
        self::$cachedTokenExpiry = $now + (int)($data['expires_in'] ?? 3600);
        return self::$cachedToken;
    }

    private static function b64(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function request(string $method, string $urlPath, ?array $body = null): array
    {
        $url = "https://sheets.googleapis.com/v4/spreadsheets/{$this->spreadsheetId}" . $urlPath;
        $ch = curl_init($url);
        $headers = ['Authorization: Bearer ' . $this->getAccessToken(), 'Content-Type: application/json'];
        $opts = [CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => $headers, CURLOPT_CUSTOMREQUEST => $method];
        if ($body !== null) $opts[CURLOPT_POSTFIELDS] = json_encode($body);
        curl_setopt_array($ch, $opts);
        $res = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $data = json_decode($res, true) ?: [];
        if ($status >= 400) throw new \RuntimeException('Google Sheets API error (' . $status . '): ' . ($data['error']['message'] ?? $res));
        return $data;
    }

    /** @return array<array> baris mentah (array of array of string) */
    public function getValues(string $range): array
    {
        $data = $this->request('GET', '/values/' . rawurlencode($range));
        return $data['values'] ?? [];
    }

    public function updateValues(string $range, array $rows): void
    {
        $this->request('PUT', '/values/' . rawurlencode($range) . '?valueInputOption=RAW', ['values' => $rows]);
    }

    public function appendValues(string $range, array $rows): void
    {
        $this->request('POST', '/values/' . rawurlencode($range) . ':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS', ['values' => $rows]);
    }

    public function clearValues(string $range): void
    {
        $this->request('POST', '/values/' . rawurlencode($range) . ':clear', []);
    }
}
