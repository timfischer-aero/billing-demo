"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {useDefinitionModal} from "@/context/DefinitionModalContext";
import { getDefinition } from "@/data/denyCodes";

export default function DefinitionModal() {
    const { openCode, closeDefinition } = useDefinitionModal();

    const isOpen = openCode !== null;
    const definition = openCode ? getDefinition(openCode) : null;

    return (
         <Dialog
            open={isOpen}
            onClose={closeDefinition}
            className="relative z-50"
            >
            {/* Darkens the page behind the modal */}
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            {/* Centers the modal panel in the viewport */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <DialogTitle className="text-lg font-semibold text-gray-900">
                    {openCode}
                </DialogTitle>

                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    {definition
                    ? definition.definition
                    : `No definition available for ${openCode}.`}
                </p>

                <div className="mt-5 text-right">
                    <button
                    type="button"
                    onClick={closeDefinition}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                    >
                    Close
                    </button>
                </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}