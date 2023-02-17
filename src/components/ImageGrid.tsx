import Image from "next/image";
import { type RouterOutputs } from "../utils/api";

type ImageGridProps = {
  images: RouterOutputs["twitter"]["getTweets"]["tweets"][0]["images"];
  className?: string;
};

const getDynamicRowColSpan = (length: number, i: number) => {
  if (length === 1) {
    return "row-span-2 col-span-2";
  }

  if (length === 2) {
    return "row-span-2 col-span-1";
  }

  if (length > 1 && length < 4 && i === 0) {
    console.log(length);
    return "row-span-2 col-span-1";
  }

  return "row-span-1 col-span-1";
};

export const ImageGrid = ({ images, className }: ImageGridProps) => (
  <div
    className={`grid h-80 w-full grid-cols-2 grid-rows-2 gap-2 ${
      className ?? ""
    } overflow-hidden`}
  >
    {images.map(
      (image, i) =>
        image.url && (
          <figure
            key={image.media_key}
            className={`relative ${getDynamicRowColSpan(
              images.length,
              i
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
