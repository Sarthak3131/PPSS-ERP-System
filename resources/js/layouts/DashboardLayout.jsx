import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardLayout() {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--erp-bg)] text-[var(--erp-ink)] transition-colors">
            <Transition show={mobileSidebarOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileSidebarOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-[var(--erp-ink)]/60" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition duration-200 ease-out"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition duration-150 ease-in"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="w-72 max-w-[85vw]">
                                <Sidebar closeSidebar={() => setMobileSidebarOpen(false)} />
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>

            <div className="flex min-h-screen">
                <aside className="hidden lg:block sticky top-0 h-screen">
                    <Sidebar />
                </aside>

                <div className="flex min-h-screen flex-1 flex-col">
                    <Navbar openSidebar={() => setMobileSidebarOpen(true)} />
                    <main className="flex-1 px-3 pb-6 pt-4 sm:px-5 lg:px-6 lg:pb-8 lg:pt-5">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
