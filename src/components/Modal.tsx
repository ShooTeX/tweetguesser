import type { PropsWithChildren } from "react";
import { createPortal } from "react-dom";

type ModalProps = PropsWithChildren & {
  show: boolean;
};

export const Modal = ({ show, children }: ModalProps) => {
  return <>{show && createPortal(<>{children}</>, document.body)}</>;
};
