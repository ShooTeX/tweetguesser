import { type RouterOutputs } from "../utils/api";
import parse from "html-react-parser";
import { useAtomValue } from "jotai";
import { gameConfigAtom } from "../atoms/game";

type EntityHandlerProperties = {
  children: string;
  entities: RouterOutputs["twitter"]["getTweets"]["tweets"][0]["entities"];
};
export const EntityHandler = ({
  children,
  entities,
}: EntityHandlerProperties) => {
  const { hideUrls } = useAtomValue(gameConfigAtom);
  if (!entities) {
    return <>{children}</>;
  }

  let formatted = children;

  entities.urls?.map((entity) => {
    formatted = formatted.replace(
      entity.url,
      entity.display_url?.startsWith("pic") || hideUrls
        ? ""
        : `<a className="link link-hover link-secondary" target="_blank" rel="noreferrer" href="${
            entity.url ?? ""
          }">${entity.display_url || entity.url}</a>`
    );
  });

  entities.mentions?.map((entity) => {
    formatted = formatted.replace(
      `@${entity.username}`,
      `<span className="text-secondary">@${entity.username}</span>`
    );
  });

  return <>{parse(formatted)}</>;
};
