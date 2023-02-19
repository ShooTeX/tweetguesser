import type { PropsWithChildren } from "react";
import { createPortal } from "react-dom";

type ModalProperties = PropsWithChildren & {
  show: boolean;
};

export const Modal = ({ show, children }: ModalProperties) => {
  return <>{show && createPortal(<>{children}</>, document.body)}</>;
};
