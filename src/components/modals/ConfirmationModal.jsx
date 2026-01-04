import { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import PropTypes from 'prop-types';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onCancel}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-[#05070a]/60 backdrop-blur-2xl" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-[2.5rem] bg-[#05070a]/40 backdrop-blur-3xl border border-white/10 p-8 text-left align-middle shadow-2xl transition-all relative glass-panel">
                                {/* Background Glow */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                                <div className="flex flex-col items-center text-center relative z-10">
                                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500 ring-1 ring-red-500/20">
                                        <AlertTriangle size={32} />
                                    </div>

                                    <DialogTitle
                                        as="h3"
                                        className="text-xl font-bold text-white mb-2 font-display"
                                    >
                                        {title || "Emin misin?"}
                                    </DialogTitle>

                                    <div className="mt-2">
                                        <p className="text-slate-400 mb-8 leading-relaxed">
                                            {message || "Bu işlem geri alınamaz. Devam etmek istediğine emin misin?"}
                                        </p>
                                    </div>

                                    <div className="flex w-full gap-3">
                                        <button
                                            type="button"
                                            className="flex-1 py-3 px-4 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 outline-none focus:ring-2 focus:ring-slate-500"
                                            onClick={onCancel}
                                        >
                                            Vazgeç
                                        </button>
                                        <button
                                            type="button"
                                            className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-red-500"
                                            onClick={onConfirm}
                                        >
                                            <Trash2 size={18} />
                                            Sil
                                        </button>
                                    </div>
                                </div>

                                {/* Close Button */}
                                <button
                                    onClick={onCancel}
                                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-full hover:bg-white/5 transition-colors outline-none focus:ring-2 focus:ring-slate-500"
                                >
                                    <X size={20} />
                                </button>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default ConfirmationModal;
