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

        $type = $this->detectType($headers);

        // Build column index map
        $required = $this->requiredColumns($type);
        $map = [];
        foreach ($required as $name) {
            $idx = array_search($name, $headers, true);
            if ($idx === false) {
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
//                $rowData[$colName] = $sheet->getCellByColumnAndRow($colIndex, $row)->getCalculatedValue();
                $colLetter = Coordinate::stringFromColumnIndex($colIndex);
                $rowData[$colName] = $sheet->getCell($colLetter . $row)->getCalculatedValue();
            }

            // Transform and validate
            $record = $this->transformRow($type, $rowData);
            if ($record === null) {
                // skip empty row
                continue;
            }

            // barcode validation
            if (empty($record['barcode']) || $record['barcode'] === "-") {
                continue;
//                throw new Exception(sprintf('строка %d: штрих-код пустой', $row));
            }
            if (isset($seenBarcodes[$record['barcode']])) {
                continue;
//                throw new Exception(sprintf('строка %d: дубликат штрих-кода "%s"', $row, $record['barcode']));
            }
            $seenBarcodes[$record['barcode']] = true;

            // Insert into DB (unique barcode constraint may ignore duplicates across files)
            $inserted += $this->insertOrder($record) ? 1 : 0;
        }

        return $inserted;
    }

    private function detectType(array $headers): string
    {
        $ordersHeaders = [
            'Дата создания',
            'Артикул Wildberries',
            'Наименование',
            'Стикер',
            'Склад продавца',
        ];
        $salesHeaders = [
            'Дата продажи',
            'ШК',
            'Код номенклатуры',
            'К перечислению Продавцу за реализованный Товар',
            'Услуги по доставке товара покупателю',
            'Обоснование для оплаты',
        ];

        $hasAll = function(array $need) use ($headers) {
            foreach ($need as $n) {
                if (!in_array($n, $headers, true)) return false;
            }
            return true;
        };

        if ($hasAll($ordersHeaders)) return 'orders';
        if ($hasAll($salesHeaders)) return 'sales';

        // Choose better error by checking which required is missing more explicitly
        $missingOrders = array_values(array_diff($ordersHeaders, $headers));
        $missingSales = array_values(array_diff($salesHeaders, $headers));
        $msg = count($missingOrders) <= count($missingSales)
            ? sprintf('отсутствует колонка "%s"', $missingOrders[0] ?? 'неизвестно')
            : sprintf('отсутствует колонка "%s"', $missingSales[0] ?? 'неизвестно');
        throw new Exception($msg);
    }

    private function requiredColumns(string $type): array
    {
        return $type === 'orders'
            ? ['Дата создания','Артикул Wildberries','Наименование','Стикер','Склад продавца']
            : ['Дата продажи','ШК','Код номенклатуры','К перечислению Продавцу за реализованный Товар','Услуги по доставке товара покупателю','Обоснование для оплаты'];
    }

    private function transformRow(string $type, array $row): ?array
    {
        // Skip empty rows: when all fields empty
        $allEmpty = true;
        foreach ($row as $v) { if ((string)$v !== '') { $allEmpty = false; break; } }
        if ($allEmpty) return null;

        if ($type === 'orders') {
            $date = $this->parseDate($row['Дата создания']);
            if (!$date) throw new Exception('некорректная дата');
            return [
                'barcode' => trim((string)$row['Стикер']),
                'mp_article' => trim((string)$row['Артикул Wildberries']),
                'name' => trim((string)$row['Наименование']),
                'warehouse' => trim((string)$row['Склад продавца']),
                'date' => $date,
                'status' => null,
                'status_date' => $date,
                'delivery' => null,
                'payout' => null,
            ];
        } else { // sales
            $date = $this->parseDate($row['Дата продажи']);
            if (!$date) throw new Exception('некорректная дата');
            return [
                'barcode' => trim((string)$row['ШК']),
                'mp_article' => trim((string)$row['Код номенклатуры']),
                'name' => null,
                'warehouse' => null,
                'date' => $date,
                'status' => $this->normalizeStatus((string)$row['Обоснование для оплаты']),
                'status_date' => $date,
                'delivery' => $this->toFloat($row['Услуги по доставке товара покупателю']),
                'payout' => $this->toFloat($row['К перечислению Продавцу за реализованный Товар']),
            ];
        }
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

    private function toFloat($value): ?float
    {
        if ($value === null || $value === '') return null;
        if (is_numeric($value)) return (float)$value;
        $s = str_replace([' ', '\u00A0'], '', (string)$value);
        $s = str_replace(['\u00A0'], '', $s);
        // Convert comma to dot if needed
        $s = str_replace(['\t'], '', $s);
        $s = strtr($s, [',' => '.', '−' => '-', '—' => '-']);
        $s = preg_replace('/[^0-9\.-]/u', '', $s);
        return is_numeric($s) ? (float)$s : null;
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
