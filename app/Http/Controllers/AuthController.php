<?php

namespace App\Http\Controllers;

use App\Support\ApiResponse;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'Planner',
        ]);

        return ApiResponse::success(
            ['user' => $user->toArray()],
            'Registration successful.',
            201
        );
    }

    public function login(LoginRequest $request)
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        $request->session()->regenerate();

        return ApiResponse::success(
            ['user' => Auth::user()->toArray()],
            'Login successful.'
        );
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return ApiResponse::success(null, 'Logged out successfully.');
    }

    public function me(Request $request)
    {
        return ApiResponse::success(
            ['user' => $request->user()->toArray()],
            'OK'
        );
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();
        
        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'department' => $data['department'] ?? $user->department,
            'plant' => $data['plant'] ?? $user->plant,
        ]);

        return ApiResponse::success(
            ['user' => $user->toArray()],
            'Profile updated successfully.'
        );
    }
}
