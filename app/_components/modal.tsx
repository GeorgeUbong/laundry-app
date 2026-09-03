import type { ReactNode } from "react";

type ModalProps = {
	title: string;
	onClose: () => void;
	children: ReactNode;
};

export default function Modal({ title, onClose, children }: ModalProps) {
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) {
					onClose();
				}
			}}
		>
			<div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
				<div className="flex items-center justify-between gap-4">
					<h2 id="modal-title" className="text-xl font-bold text-gray-900">
						{title}
					</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close modal"
						className="text-2xl leading-none text-gray-400 hover:text-gray-700"
					>
						&times;
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}
