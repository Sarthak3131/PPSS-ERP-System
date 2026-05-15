<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MachineRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $id = $this->route('machine') ? $this->route('machine')->id : null;
        $uniqueRule = $id ? 'unique:machines,machine_code,' . $id : 'unique:machines,machine_code';

        return [
            'machine_code' => 'required|string|max:255|' . $uniqueRule,
            'name' => 'required|string|max:255',
            'capacity_per_hour' => 'required|integer|min:1',
            'status' => 'required|in:Active,Maintenance,Offline',
            'efficiency_rating' => 'required|numeric|min:0.1|max:1.0',
        ];
    }
}
