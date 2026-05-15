import React from 'react';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    intent = 'primary', // 'primary', 'danger', 'warning'
    isLoading = false,
}) {
    const Icon = intent === 'danger' || intent === 'warning' ? ExclamationTriangleIcon : InformationCircleIcon;
    const iconColor = 
        intent === 'danger' ? 'text-red-600 dark:text-red-400' :
        intent === 'warning' ? 'text-orange-600 dark:text-orange-400' :
        'text-indigo-600 dark:text-indigo-400';
        
    const iconBg = 
        intent === 'danger' ? 'bg-red-100 dark:bg-red-900/30' :
        intent === 'warning' ? 'bg-orange-100 dark:bg-orange-900/30' :
        'bg-indigo-100 dark:bg-indigo-900/30';

    const footer = (
        <div className="flex w-full justify-end gap-3 sm:w-auto">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                {cancelText}
            </Button>
            <Button variant={intent} onClick={onConfirm} isLoading={isLoading}>
                {confirmText}
            </Button>
        </div>
    );

    return (
        <Modal open={isOpen} onClose={onClose} footer={footer} size="sm">
            <div className="sm:flex sm:items-start">
                <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${iconBg}`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-slate-900 dark:text-white" id="modal-title">
                        {title}
                    </h3>
                    <div className="mt-2">
                        <p className="text-sm text-slate-500 dark:text-slate-300">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
