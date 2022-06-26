/* eslint-disable @next/next/no-img-element */
import { Button, Display, Text } from "@geist-ui/core";
import { ArrowLeft, Download, FullScreen } from "@geist-ui/icons";
import HidableButton from "components/hidableButton";
import Layout from "components/layout";
import { getFile } from "lib/db/file";
import { getFileType } from "lib/files";
import { GetServerSideProps } from "next";
import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import Hightlighted from "components/hightlighted";
import { getLanguageFromFilename } from "lib/filetype";
import { File as FileType } from "@prisma/client";
import { DOWNLOAD_URL } from "lib/downloadUrl";

export default function File({
  dropSlug,
  fileName,
  mime,
  file,
}: {
  dropSlug: string;
  fileName: string;
  mime: string;
  file: FileType;
}) {
  const isImage = mime.startsWith("image");
  const isVideo = mime.startsWith("video");
  const isPdf = mime === "application/pdf";
  const isText = mime.startsWith("text") && file.size < 10000;
  const viewable = isImage || isPdf || isText || isVideo;
  const [text, setText] = useState<string>();

  useEffect(() => {
    if (isText)
      fetch(`${DOWNLOAD_URL}/${dropSlug}/${fileName}?view`)
        .then((response) => response.text())
        .then((response) => setText(response));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="root">
      <Layout
        footer={
          <>
            <a href={`${DOWNLOAD_URL}/${dropSlug}/${fileName}?view`}>
              <HidableButton width={120} icon={<FullScreen />}>
                Fullscreen
              </HidableButton>
            </a>
            <a href={`${DOWNLOAD_URL}/${dropSlug}/${fileName}`}>
              <HidableButton type="success" width={110} icon={<Download />}>
                Download
              </HidableButton>
            </a>
          </>
        }
        footerHidden={!viewable}
      >
        <NextLink href={`/${dropSlug}`}>
          <a>
            <Button auto icon={<ArrowLeft />}>
              Back
            </Button>
          </a>
        </NextLink>
        <Display caption={fileName} shadow>
          {isImage ? (
            <img
              src={`${DOWNLOAD_URL}/${dropSlug}/${fileName}`}
              alt={fileName}
            />
          ) : isPdf || isVideo ? (
            <iframe src={`${DOWNLOAD_URL}/${dropSlug}/${fileName}?view=true`} />
          ) : isText ? (
            <Hightlighted language={getLanguageFromFilename(fileName)}>
              {text}
            </Hightlighted>
          ) : (
            <a href={`${DOWNLOAD_URL}/${dropSlug}/${fileName}`} download>
              <Button icon={<Download />} type="success">
                Download
              </Button>
            </a>
          )}
        </Display>
      </Layout>
      <style jsx>{`
        iframe {
          border: none;
          height: 60vh;
          width: 100%;
        }

        img {
          max-width: 100%;
          max-height: 60vh;
        }

        .root :global(.display) {
          margin: 10px 0 0 0;
        }

        .root :global(.display) :global(.content) {
          min-width: 100px;
          ${isText || isPdf || isVideo ? "width: 100%;" : "max-width: 100%;"}
          max-height: 60vh;
        }

        .root :global(pre) {
          padding: 20px;
          height: calc(60vh - 40px);
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const dropSlug = ctx.query.dropSlug.toString();
  const fileName = ctx.query.fileName.toString();
  const file = await getFile(dropSlug, fileName);
  const { mime } = await getFileType(dropSlug, fileName);

  return {
    props: { dropSlug, fileName, mime, file },
  };
};
