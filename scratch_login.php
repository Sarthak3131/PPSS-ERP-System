<?php
use App\Http\Requests\LoginRequest;
use App\Http\Controllers\AuthController;

try {
    $request = LoginRequest::create('/api/v1/login', 'POST', [
        'email' => 'admin@erp.com',
        'password' => 'password'
    ]);
    
    // Bind session
    $session = app('session')->driver('database');
    $request->setLaravelSession($session);
    
    $controller = new AuthController();
    $response = app()->call([$controller, 'login'], ['request' => $request]);
    
    echo "Login response: " . json_encode($response) . "\n";
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
