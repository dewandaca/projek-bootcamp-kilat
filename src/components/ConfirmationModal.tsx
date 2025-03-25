import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmationModal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-lg">
                <h2 className="text-lg font-semibold text-[#6D4C41]">Confirm Deletion</h2>
                <p className='text-[#6D4C41]'>Are you sure you want to delete this comment?</p>
                <div className="mt-4 flex justify-center space-x-2">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 px-4 py-2 rounded text-[#6D4C41]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
