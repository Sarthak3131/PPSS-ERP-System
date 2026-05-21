import React from 'react';
import { ArchiveBoxIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

export default function ProductBulkActionsToolbar({ selectedCount, onArchive, onDelete, onClear }) {
    if (!selectedCount) return null;

    return (
        <div className="erp-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="text-sm text-(--erp-muted)">
                <span className="font-semibold text-(--erp-ink)">{selectedCount}</span> selected products
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" leftIcon={ArchiveBoxIcon} onClick={onArchive}>
                    Bulk archive
                </Button>
                <Button type="button" variant="danger" size="sm" leftIcon={TrashIcon} onClick={onDelete}>
                    Bulk delete
                </Button>
                <Button type="button" variant="secondary" size="sm" leftIcon={XMarkIcon} onClick={onClear}>
                    Clear selection
                </Button>
            </div>
        </div>
    );
}
