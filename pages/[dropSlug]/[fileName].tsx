/* eslint-disable @next/next/no-img-element */
import { Button, Display, Text } from "@geist-ui/react";
import { ArrowLeft, Download } from "@geist-ui/react-icons";
import HidableButton from "components/hidableButton";
import Layout from "components/layout";
import { getFile, getFileId } from "lib/db/file";
import { getFileType } from "lib/files";
import { GetServerSideProps } from "next";
import React, { useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { response } from "express";
import Hightlighted from "components/hightlighted";
import { getLanguageFromFilename } from "lib/filetype";
import { File as FileType } from "@prisma/client";

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
  const isPdf = mime === "application/pdf";
  const isText = mime.startsWith("text") && file.size < 10000;
  const viewable = isImage || isPdf || isText;
  const [text, setText] = useState<string>();

  useEffect(() => {
    fetch(`/file/${dropSlug}/${fileName}`)
      .then((response) => response.text())
      .then((response) => setText(response));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="root">
      <Layout
        footer={
          <>
            <a href={`/file/${dropSlug}/${fileName}`}>
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
            <img src={`/file/${dropSlug}/${fileName}`} alt={fileName} />
          ) : isPdf ? (
            <iframe src={`/file/${dropSlug}/${fileName}?view=true`} />
          ) : isText ? (
            <Hightlighted language={getLanguageFromFilename(fileName)}>
              {text}
            </Hightlighted>
          ) : (
            <a href={`/file/${dropSlug}/${fileName}`}>
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
          ${isText || isPdf ? "width: 100%;" : "max-width: 100%;"}
          max-height: 60vh;
        }

        .root :global(pre) {
          padding: 20px;
          height: 60vh;
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
  const { mime } = await getFileType(file.id);

  return {
    props: { dropSlug, fileName, mime, file },
  };
};
