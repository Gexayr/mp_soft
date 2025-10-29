<?php
namespace App\Services;

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use DateTime;
use Exception;

class SalesExcelProcessor
{
    private string $root;
    private string $importDir;
    private string $processedDir;
    private string $failedDir;
    private string $logsDir;

    public function __construct()
    {
        ini_set('memory_limit', '512M');
        $this->root = Storage::disk('local')->path('');
        $this->importDir = $this->root . 'import';
        $this->processedDir = $this->root . 'processed';
        $this->failedDir = $this->root . 'failed';
        $this->logsDir = $this->root . 'logs';
        $this->ensureDirectories();
    }

    public function processFile(string $path): int
    {
        if (!is_readable($path)) {
            throw new Exception('файл недоступен для чтения');
        }

        $spreadsheet = IOFactory::load($path);
        $sheet = $spreadsheet->getActiveSheet();
        $highestRow = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();
        $highestColumnIndex = Coordinate::columnIndexFromString($highestColumn);

        // Read headers
        $headers = [];
        for ($col = 1; $col <= $highestColumnIndex; $col++) {
            $colLetter = Coordinate::stringFromColumnIndex($col);
            $headers[] = trim((string)$sheet->getCell($colLetter . '1')->getValue());
        }

        // Validate required columns for sales
        $required = [
            'Дата продажи',
            'ШК',
            'Код номенклатуры',
            'К перечислению Продавцу за реализованный Товар',
            'Услуги по доставке товара покупателю',
            'Обоснование для оплаты',
        ];
        $map = [];
        foreach ($required as $name) {
            $idx = array_search($name, $headers, true);
            if ($idx === false) {
                throw new Exception(sprintf('отсутствует колонка "%s"', $name));
            }
            $map[$name] = $idx + 1; // 1-based index
        }

        // Keep only the last occurrence per barcode
        $byBarcode = [];
        for ($row = 2; $row <= $highestRow; $row++) {
            $rowData = [];
            foreach ($map as $colName => $colIndex) {
                $colLetter = Coordinate::stringFromColumnIndex($colIndex);
                $rowData[$colName] = $sheet->getCell($colLetter . $row)->getCalculatedValue();
            }
            $record = $this->transformSalesRow($rowData);
            if ($record === null) continue;
            $barcode = $record['barcode'] ?? '';
            if ($barcode === '' || $barcode === '-') continue;
            // Overwrite to keep last seen row for this barcode
            $byBarcode[$barcode] = $record;
        }

        $processed = 0;
        foreach ($byBarcode as $barcode => $rec) {
            // Try find order by barcode (orders.barcode == sales ШК)
            $order = DB::table('orders')->where('barcode', $barcode)->first();
            if ($order) {
                // Update only delivery, payout, status
                DB::table('orders')->where('id', $order->id)->update([
                    'delivery' => $rec['delivery'],
                    'payout' => $rec['payout'],
                    'status' => $rec['status'],
                    'updated_at' => now(),
                ]);
                $processed++;
            } else {
                // Insert into sales table only if no order matches
                DB::table('sales')->insertOrIgnore([
                    'barcode' => $rec['barcode'],
                    'mp_article' => $rec['mp_article'] ?? null,
                    'name' => $rec['name'] ?? null,
                    'warehouse' => $rec['warehouse'] ?? null,
                    'date' => $rec['date'] ?? null,
                    'status' => $rec['status'] ?? null,
                    'status_date' => $rec['status_date'] ?? null,
                    'delivery' => $rec['delivery'] ?? null,
                    'payout' => $rec['payout'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $processed++;
            }
        }

        return $processed;
    }

    private function transformSalesRow(array $row): ?array
    {
        // Skip empty rows
        $allEmpty = true;
        foreach ($row as $v) { if ((string)$v !== '') { $allEmpty = false; break; } }
        if ($allEmpty) return null;

        $date = $this->parseDate($row['Дата продажи'] ?? null);
        if (!$date) return null;
        return [
            'barcode' => trim((string)($row['ШК'] ?? '')),
            'mp_article' => trim((string)($row['Код номенклатуры'] ?? '')),
            'name' => null,
            'warehouse' => null,
            'date' => $date,
            'status' => $this->normalizeStatus((string)($row['Обоснование для оплаты'] ?? '')),
            'status_date' => $date,
            'delivery' => $this->toFloat($row['Услуги по доставке товара покупателю'] ?? null),
            'payout' => $this->toFloat($row['К перечислению Продавцу за реализованный Товар'] ?? null),
        ];
    }

    private function parseDate($value): ?string
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->format('Y-m-d');
        }
        if (is_numeric($value)) {
            $date = DateTime::createFromFormat('Y-m-d', '1899-12-30');
            if ($date) {
                $date->modify('+' . (int)$value . ' days');
                return $date->format('Y-m-d');
            }
        }
        $str = trim((string)$value);
        if ($str === '') return null;
        $fmts = ['Y-m-d','d.m.Y','d/m/Y','m/d/Y','d-m-Y','Y.m.d'];
        foreach ($fmts as $fmt) {
            $dt = DateTime::createFromFormat($fmt, $str);
            if ($dt) return $dt->format('Y-m-d');
        }
        $ts = strtotime($str);
        return $ts ? date('Y-m-d', $ts) : null;
    }

    private function toFloat($value): ?float
    {
        if ($value === null || $value === '') return null;
        if (is_numeric($value)) return (float)$value;
        $s = str_replace([' ', '\u00A0'], '', (string)$value);
        $s = str_replace(['\u00A0'], '', $s);
        $s = str_replace(["\t"], '', $s);
        $s = strtr($s, [',' => '.', '−' => '-', '—' => '-']);
        $s = preg_replace('/[^0-9\.-]/u', '', $s);
        return is_numeric($s) ? (float)$s : null;
    }

    private function normalizeStatus(string $status): ?string
    {
        $s = trim(mb_strtolower($status));
        if ($s === '') return null;
        $map = [
            'выкуп' => 'purchased',
            'возврат' => 'returned',
            'реализация' => 'sold',
        ];
        foreach ($map as $k => $v) {
            if (str_contains($s, $k)) return $v;
        }
        return $status;
    }

    private function ensureDirectories(): void
    {
        foreach ([$this->importDir, $this->processedDir, $this->failedDir, $this->logsDir] as $dir) {
            if (!is_dir($dir)) {
                @mkdir($dir, 0775, true);
            }
        }
    }

    private function moveFile(string $from, string $toDir): void
    {
        $base = basename($from);
        $dest = $toDir . '/' . $base;
        @rename($from, $dest);
    }

    private function log(string $level, string $message): void
    {
        $date = date('Y-m-d');
        $ts = date('Y-m-d H:i');
        $line = sprintf('[%s] %s: %s', $ts, strtoupper($level), $message) . PHP_EOL;
        file_put_contents($this->logsDir . '/' . $date . '.log', $line, FILE_APPEND);
    }
}
