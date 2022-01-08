import { File } from "@prisma/client";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

export default function Thumbnail({ file }: { file: File }) {
  const [loaded, setLoaded] = useState(false);
  const ogImageRef = useRef<HTMLImageElement>();

  function loadListener() {
    setLoaded(true);
  }

  useEffect(() => {
    if (ogImageRef) {
      const image = ogImageRef.current;
      if (image) setLoaded(true);
      image.addEventListener("load", loadListener);
      return () => image.removeEventListener("load", loadListener);
    }
  }, [ogImageRef]);

  return (
    <>
      <Head>
        <link rel="preload" href={"/shell32_1.ico"} as="image" />
      </Head>
      <img
        style={{ display: loaded ? "none" : "initial" }}
        src="/shell32_1.ico"
        alt="Thumbnail"
      />
      <img
        style={{ display: loaded ? "initial" : "none" }}
        src={`/api/thumbnail/${file.dropSlug}/${file.name}`}
        alt="Thumbnail"
        ref={ogImageRef}
      />
    </>
  );
}
