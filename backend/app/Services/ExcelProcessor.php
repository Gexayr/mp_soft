<?php
namespace App\Services;

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use Illuminate\Support\Facades\Storage;
use DateTime;
use Exception;
use Illuminate\Support\Facades\DB;

class ExcelProcessor
{

    private string $root;
    private string $importDir;
    private string $processedDir;
    private string $failedDir;
    private string $logsDir;

    public function __construct()
    {
        ini_set('memory_limit', '512M');

        // Use the 'local' disk root: storage/app/private
        $this->root = Storage::disk('local')->path('');
        $this->importDir = $this->root . 'import';
        $this->processedDir = $this->root . 'processed';
        $this->failedDir = $this->root . 'failed';
        $this->logsDir = $this->root . 'logs';

        $this->ensureDirectories();
    }

    public function processAll(): array
    {
        // This processor now only handles Orders documents. Kept for backward compatibility
        // to process any .xlsx in the import directory that match Orders format.
        $files = glob($this->importDir . '/*.xlsx');
        $summary = [
            'processed' => 0,
            'failed' => 0,
            'details' => [],
        ];

        foreach ($files as $file) {
            try {
                $count = $this->processFile($file);
                $this->moveFile($file, $this->processedDir);
                $this->log("INFO", sprintf('Файл %s обработан успешно (%d строк)', basename($file), $count));
                $summary['processed']++;
                $summary['details'][] = [basename($file) => [
                    'status' => 'processed',
                    'rows' => $count,
                ]];
            } catch (Exception $e) {
                $this->moveFile($file, $this->failedDir);
                $this->log("ERROR", sprintf('Файл %s — %s', basename($file), $e->getMessage()));
                $summary['failed']++;
                $summary['details'][] = [basename($file) => [
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                ]];
            }
        }

        return $summary;
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

        // Read headers (first row)
        $headers = [];
        for ($col = 1; $col <= $highestColumnIndex; $col++) {
//            $headers[] = trim((string)$sheet->getCellByColumnAndRow($col, 1)->getValue());
            $colLetter = Coordinate::stringFromColumnIndex($col);
            $headers[] = trim((string)$sheet->getCell($colLetter . '1')->getValue());
        }

        // Validate that this is an Orders document only
        $required = [
            'Дата создания',
            'Артикул Wildberries',
            'Наименование',
            'Стикер',
            'Склад продавца',
        ];

        $notRequired = [
            '№ задания',
            'QR-код поставки',
            'Дата создания',
            'Дата сканирования ШК ТТН',
            'Размер',
            'Цвет',
            'Стоимость',
            'Валюта',
            'Артикул продавца',
            'Дата доставки клиенту',
            'Статус задания',
            'Куда доставить',
            'ФИО покупателя',
            'Телефон покупателя',
            'Дата сканирования товара',
            'Стоимость приёмки',
            'Время с момента заказа',
            'Признак продажи юрлицу',
        ];
        $merged = array_merge($required, $notRequired);
        $map = [];
        foreach ($merged as $name) {
            $idx = array_search($name, $headers, true);
            if ($idx === false && in_array($name, $required)) {
                throw new Exception(sprintf('отсутствует колонка "%s"', $name));
            }
            $map[$name] = $idx + 1; // 1-based index
        }

        $inserted = 0;
        $seenBarcodes = [];

        for ($row = 2; $row <= $highestRow; $row++) {
            // Extract values safely
            $rowData = [];
            foreach ($map as $colName => $colIndex) {
                $colLetter = Coordinate::stringFromColumnIndex($colIndex);
                $rowData[$colName] = $sheet->getCell($colLetter . $row)->getCalculatedValue();
            }

            // Transform and validate (orders only)
            $record = $this->transformOrderRow($rowData);


            if ($record === null) {
                // skip empty row
                continue;
            }

            // barcode validation
            if (empty($record['barcode']) || $record['barcode'] === "-") {
                continue;
            }
            if (isset($seenBarcodes[$record['barcode']])) {
                continue;
            }
            $seenBarcodes[$record['barcode']] = true;

            // Insert into DB (unique barcode constraint may ignore duplicates across files)
            $inserted += $this->insertOrder($record) ? 1 : 0;
        }

        return $inserted;
    }

    private function transformOrderRow(array $row): ?array
    {
        // Skip empty rows: when all fields empty
        $allEmpty = true;
        foreach ($row as $v) { if ((string)$v !== '') { $allEmpty = false; break; } }
        if ($allEmpty) return null;

        $date = $this->parseDate($row['Дата создания'] ?? null);
        if (!$date) return null;
        return [
            'barcode' => trim((string)($row['Стикер'] ?? '')),
            'mp_article' => trim((string)($row['Артикул Wildberries'] ?? '')),
            'name' => trim((string)($row['Наименование'] ?? '')),
            'warehouse' => trim((string)($row['Склад продавца'] ?? '')),
            'date' => $date,
            'status' => null,
            'status_date' => $date,
            'delivery' => null,
            'payout' => null,

            'task_number' => trim((string)($row['№ задания'] ?? '')),
            'provider_QR' => trim((string)($row['QR-код поставки'] ?? '')),
            'creation_date' => trim((string)($row['Дата создания'] ?? '')),
            'scanning_date' => trim((string)($row['Дата сканирования ШК ТТН'] ?? '')),
            'size' => trim((string)($row['Размер'] ?? '')),
            'color' => trim((string)($row['Цвет'] ?? '')),
            'price' => trim((string)($row['Стоимость'] ?? '')),
            'currency' => trim((string)($row['Валюта'] ?? '')),
            'seller_SKU' => trim((string)($row['Артикул продавца'] ?? '')),
            'delivery_date_to_customer' => trim((string)($row['Дата доставки клиенту'] ?? '')),
            'task_status' => trim((string)($row['Статус задания'] ?? '')),
            'destination' => trim((string)($row['Куда доставить'] ?? '')),
            'buyers_full_name' => trim((string)($row['ФИО покупателя'] ?? '')),
            'buyers_phone_number' => trim((string)($row['Телефон покупателя'] ?? '')),
            'product_scanning_date' => trim((string)($row['Дата сканирования товара'] ?? '')),
            'acceptance_cost' => trim((string)($row['Стоимость приёмки'] ?? '')),
            'time_since_order' => trim((string)($row['Время с момента заказа'] ?? '')),
            'legal_entity_indicator' => trim((string)($row['Признак продажи юрлицу'] ?? '')),
        ];
    }

    private function parseDate($value): ?string
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->format('Y-m-d');
        }
        // PhpSpreadsheet may return Excel serial numbers
        if (is_numeric($value)) {
            // Excel epoch 1899-12-30
            $date = DateTime::createFromFormat('Y-m-d', '1899-12-30');
            if ($date) {
                $date->modify('+' . (int)$value . ' days');
                return $date->format('Y-m-d');
            }
        }
        $str = trim((string)$value);
        if ($str === '') return null;
        // Try multiple formats
        $fmts = ['Y-m-d','d.m.Y','d/m/Y','m/d/Y','d-m-Y','Y.m.d'];
        foreach ($fmts as $fmt) {
            $dt = DateTime::createFromFormat($fmt, $str);
            if ($dt) return $dt->format('Y-m-d');
        }
        $ts = strtotime($str);
        return $ts ? date('Y-m-d', $ts) : null;
    }

    private function normalizeStatus(string $status): ?string
    {
        $s = trim(mb_strtolower($status));
        if ($s === '') return null;
        // Basic normalization (examples)
        $map = [
            'выкуп' => 'purchased',
            'возврат' => 'returned',
            'реализация' => 'sold',
        ];
        foreach ($map as $k => $v) {
            if (str_contains($s, $k)) return $v;
        }
        return $status; // keep original if unknown
    }

    private function ensureDirectories(): void
    {
        foreach ([$this->importDir, $this->processedDir, $this->failedDir, $this->logsDir] as $dir) {
            if (!is_dir($dir)) {
                @mkdir($dir, 0775, true);
            }
        }
    }

    private function insertOrder(array $rec): bool
    {
        $inserted = DB::table('orders')->insertOrIgnore([
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
            'task_number' => $rec['task_number'] ?? null,
            'provider_QR' => $rec['provider_QR'] ?? null,
            'creation_date' => $rec['creation_date'] ?? null,
            'scanning_date' => $rec['scanning_date'] ?? null,
            'size' => $rec['size'] ?? null,
            'color' => $rec['color'] ?? null,
            'price' => $rec['price'] ?? null,
            'currency' => $rec['currency'] ?? null,
            'seller_SKU' => $rec['seller_SKU'] ?? null,
            'delivery_date_to_customer' => $rec['delivery_date_to_customer'] ?? null,
            'task_status' => $rec['task_status'] ?? null,
            'destination' => $rec['destination'] ?? null,
            'buyers_full_name' => $rec['buyers_full_name'] ?? null,
            'buyers_phone_number' => $rec['buyers_phone_number'] ?? null,
            'product_scanning_date' => $rec['product_scanning_date'] ?? null,
            'acceptance_cost' => $rec['acceptance_cost'] ?? null,
            'time_since_order' => $rec['time_since_order'] ?? null,
            'legal_entity_indicator' => $rec['legal_entity_indicator'] ?? null,
        ]);
        return $inserted > 0;
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
