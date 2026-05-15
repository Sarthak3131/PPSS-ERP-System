<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BillOfMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => 'required|exists:products,id',
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'quantity_required' => 'required|numeric|min:0.0001',
            'unit' => 'required|string|max:50',
        ];
    }
}
