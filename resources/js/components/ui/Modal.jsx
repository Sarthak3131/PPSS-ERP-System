import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import cn from '../../utils/cn';

export default function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    className,
}) {
    const sizeClass =
        size === 'lg' ? 'max-w-3xl' : size === 'sm' ? 'max-w-md' : 'max-w-xl';

    return (
        <Transition show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="transition-opacity duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto px-4 py-8">
                    <div className="flex min-h-full items-center justify-center">
                        <Transition.Child
                            as={Fragment}
                            enter="transition duration-200 ease-out"
                            enterFrom="opacity-0 translate-y-2 scale-[0.98]"
                            enterTo="opacity-100 translate-y-0 scale-100"
                            leave="transition duration-150 ease-in"
                            leaveFrom="opacity-100 translate-y-0 scale-100"
                            leaveTo="opacity-0 translate-y-1 scale-[0.99]"
                        >
                            <Dialog.Panel
                                className={cn(
                                    'w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_24px_80px_rgba(2,6,23,0.6)]',
                                    sizeClass,
                                    className,
                                )}
                            >
                                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-700">
                                    <div>
                                        {title ? (
                                            <Dialog.Title className="text-base font-semibold text-slate-900 dark:text-white">
                                                {title}
                                            </Dialog.Title>
                                        ) : null}
                                        {description ? (
                                            <Dialog.Description className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                                                {description}
                                            </Dialog.Description>
                                        ) : null}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="px-6 py-5">{children}</div>

                                {footer ? (
                                    <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
                                        {footer}
                                    </div>
                                ) : null}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

