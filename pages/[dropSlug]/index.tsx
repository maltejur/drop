import { getDrop } from "lib/db/drop";
import { getFiles, getPaste } from "lib/db/file";
import { GetServerSideProps } from "next";
import { getFile } from "lib/files";
import { Drop, File } from "@prisma/client";
import { Card, Spacer, Text } from "@geist-ui/react";
import React, { useMemo } from "react";
import HidableButton from "components/hidableButton";
import { Download } from "@geist-ui/react-icons";
import { getLanguageFromFilename } from "lib/filetype";
import Link from "next/link";
import Layout from "components/layout";
import Hightlighted from "components/hightlighted";

export default function DropIndex({
  drop,
  paste,
  files,
}: {
  drop: Drop;
  paste?: string;
  files?: File[];
  language?: string;
}) {
  return (
    <div className="root">
      <Layout
        footer={
          <>
            <Spacer style={{ flexGrow: 1 }} />
            <a href={`/file/${drop.slug}/${files[0].name}`}>
              <HidableButton
                icon={<Download />}
                ml={0.5}
                type={"success"}
                width={110}
                hidden={!paste}
              >
                Download
              </HidableButton>
            </a>
          </>
        }
        header={paste && files[0].name}
        footerHidden={!paste}
        padding={paste ? 0 : 30}
      >
        {paste && (
          <Hightlighted
            language={getLanguageFromFilename(files[0].name)}
            noBorder
          >
            {paste}
          </Hightlighted>
        )}
        {files && !paste && (
          <div className="grid">
            {files.map((file) => (
              <Card key={file.id} shadow>
                <Link
                  href={`/${drop.slug}/${file.name}`}
                  passHref
                  key={file.id}
                >
                  <a>
                    <img
                      src={`/thumbnail/${drop.slug}/${file.name}`}
                      key={file.name}
                      alt="Thumbnail"
                      onError={(event) =>
                        ((event.target as HTMLImageElement).src =
                          "/shell32_1.ico")
                      }
                    />
                    <Text type="secondary" margin={0} small>
                      {file.name}
                    </Text>
                  </a>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </Layout>
      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, 140px);
          gap: 15px;
        }

        .grid :global(.card) :global(.content) {
          padding: 10px 20px;
          margin: 0;
          display: flex;
          flex-direction: column;
          width: 140px;
          height: 150px;
          overflow: hidden;
        }

        .grid img {
          width: 100px;
          height: 100px;
        }

        .grid :global(small) {
          display: block;
          text-align: center;
          width: 100%;
          margin-top: 5px;
          line-height: 1em;
          height: 1.2em;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const dropSlug = ctx.query.dropSlug.toString();
  const drop = await getDrop(dropSlug);
  if (!drop)
    return {
      notFound: true,
    };

  switch (drop.type) {
    case "redirect":
      return {
        props: {},
        redirect: {
          destination: drop.url,
        },
      };

    case "paste":
      const file = await getPaste(drop.slug);
      const content = await getFile(file.id);
      return {
        props: {
          paste: content.toString(),
          drop,
          files: [file],
        },
      };

    case "files":
      const files = await getFiles(drop.slug);
      return {
        props: {
          files,
          drop,
        },
      };

    default:
      throw new Error("Invalid drop type");
  }
};
