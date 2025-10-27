<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ExcelProcessor;

class ProcessExcelImports extends Command
{
    protected $signature = 'excel:process-imports';
    protected $description = 'Process Excel files from storage/app/private/import and store records into MySQL (orders table)';

    public function handle(): int
    {
        $processor = new ExcelProcessor();
        $summary = $processor->processAll();

        $this->info('Processed: ' . $summary['processed']);
        $this->info('Failed: ' . $summary['failed']);

        return self::SUCCESS;
    }
}
