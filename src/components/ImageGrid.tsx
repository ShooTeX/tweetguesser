import Image from "next/image";
import { type RouterOutputs } from "../utils/api";

type ImageGridProperties = {
  images: RouterOutputs["twitter"]["getTweets"]["tweets"][0]["images"];
  className?: string;
};

const getDynamicRowColSpan = (length: number, index: number) => {
  if (length === 1) {
    return "row-span-2 col-span-2";
  }

  if (length === 2) {
    return "row-span-2 col-span-1";
  }

  if (length > 1 && length < 4 && index === 0) {
    return "row-span-2 col-span-1";
  }

  return "row-span-1 col-span-1";
};

export const ImageGrid = ({ images, className }: ImageGridProperties) => (
  <div
    className={`grid h-80 w-full grid-cols-2 grid-rows-2 gap-2 ${
      className ?? ""
    } overflow-hidden`}
  >
    {images.map(
      (image, index) =>
        image.url && (
          <figure
            key={image.media_key}
            className={`relative ${getDynamicRowColSpan(
              images.length,
              index
            )} overflow-hidden rounded-md`}
          >
            <Image
              className="object-cover"
              fill
              // width={image.width}
              // height={image.height}
              src={image.url}
              alt={image.alt_text || ""}
            />
          </figure>
        )
    )}
  </div>
);
