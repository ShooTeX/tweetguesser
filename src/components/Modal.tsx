import type { PropsWithChildren } from "react";
import { createPortal } from "react-dom";

type ModalProps = PropsWithChildren & {
  onOutsideClick?: () => void;
  show: boolean;
};

export const Modal = ({ show, onOutsideClick, children }: ModalProps) => {
  return (
    <>
      {show &&
        createPortal(
          <div
            className="modal modal-open modal-bottom sm:modal-middle"
            onClick={onOutsideClick}
          >
            <div className="modal-box">{children}</div>
          </div>,
          document.body
        )}
    </>
  );
};
