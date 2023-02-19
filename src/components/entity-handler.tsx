import { type RouterOutputs } from "../utils/api";
import parse from "html-react-parser";

type EntityHandlerProperties = {
  children: string;
  entities: RouterOutputs["twitter"]["getTweets"]["tweets"][0]["entities"];
};
export const EntityHandler = ({
  children,
  entities,
}: EntityHandlerProperties) => {
  if (!entities) {
    return <>{children}</>;
  }

  let formatted = children;

  entities.urls?.map((entity) => {
    formatted = formatted.replace(
      entity.url,
      entity.display_url?.startsWith("pic")
        ? ""
        : `<a className="link link-hover link-secondary" target="_blank" rel="noreferrer" href="${
            entity.url ?? ""
          }">${entity.display_url || entity.url}</a>`
    );
  });

  return <>{parse(formatted)}</>;
};
