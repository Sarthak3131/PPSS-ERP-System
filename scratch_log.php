<?php
use Illuminate\Support\Facades\File;
$log = storage_path('logs/laravel.log');
if(File::exists($log)) {
    echo substr(File::get($log), -5000);
} else {
    echo 'No log file';
}
