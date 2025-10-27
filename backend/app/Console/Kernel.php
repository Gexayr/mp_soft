<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
    }

    protected function schedule(Schedule $schedule): void
    {
        // You can schedule processing if needed, e.g. every minute
        // $schedule->command('excel:process-imports')->everyMinute();
    }
}
