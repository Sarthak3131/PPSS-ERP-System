<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class InventoryRequest extends FormRequest
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
        $id = $this->route('inventory');
        $uniqueRule = $id ? 'unique:inventory_items,item_code,' . $id : 'unique:inventory_items,item_code';

        return [
            'item_code' => 'required|string|max:255|' . $uniqueRule,
            'item_name' => 'required|string|max:255',
            'category' => 'required|in:raw_material,packaging,component,consumable,finished_good',
            'stock_quantity' => 'required|integer|min:0',
            'unit' => 'required|string|max:255',
            'reorder_level' => 'required|integer|min:0',
            'supplier' => 'nullable|string|max:255',
            'lead_time_days' => 'required|integer|min:0',
            'status' => 'nullable|string|max:255',
        ];
    }
}
