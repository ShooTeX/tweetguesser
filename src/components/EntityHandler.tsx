import { type RouterOutputs } from "../utils/api";
import parse from "html-react-parser";

type EntityHandlerProps = {
  children: string;
  entities: RouterOutputs["twitter"]["getTweets"][0]["entities"];
};
export const EntityHandler = ({ children, entities }: EntityHandlerProps) => {
  if (!entities) {
    return <>{children}</>;
  }

  let formatted = children;

  entities.urls?.map((entity) => {
    formatted = formatted.replace(
      entity.url,
      !entity.display_url?.startsWith("pic")
        ? `<a className="link link-hover link-secondary">${
            entity.display_url || entity.url
          }</a>`
        : ""
    );
  });

  return <>{parse(formatted)}</>;
};
