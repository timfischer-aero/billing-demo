"use client";
import { useEffect, useState } from "react";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {useDefinitionModal} from "@/context/DefinitionModalContext";
import type { TermDefinition } from "@/data/denyCodes";
import { fetchDefinition } from "@/data/definitionsApi";

export default function DefinitionModal() {
    const { openCode, closeDefinition } = useDefinitionModal();
    const [definition, setDefinition] = useState<TermDefinition | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (openCode === null) {
            return;
        }

        const controller = new AbortController();

        setDefinition(null);
        setError(null);
        setIsLoading(true);

        fetchDefinition(openCode, controller.signal)
            .then((loadedDefinition) => {
                setDefinition(loadedDefinition);
            })
            .catch((cause: unknown) => {
                if (controller.signal.aborted) {
                    return;
                }

                setError(
                    cause instanceof Error
                    ? cause.message
                    : "An unexpected error occurred.",
                );
            })
            .finally(() => {
            if (!controller.signal.aborted) {
                setIsLoading(false);
            }
            });

        return () => {
            controller.abort();
        };
    }, [openCode]);

    const isOpen = openCode !== null;
    
    let definitionText: string;

    if (isLoading) {
        definitionText = "Loading definition…";
    } else if (error !== null) {
        definitionText = error;
    } else if (definition !== null) {
        definitionText = definition.definition;
    } else {
        definitionText = `No definition available for ${openCode}.`;
    }

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
                    {definitionText}
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