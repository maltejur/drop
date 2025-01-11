import { getDrop } from "lib/db/drop";
import { getFiles, getPaste } from "lib/db/file";
import { GetServerSideProps } from "next";
import { getFile } from "lib/files";
import { Drop, File } from "@prisma/client";
import { Button, Card, Spacer, Text } from "@geist-ui/core";
import React, { useEffect, useMemo, useRef, useState } from "react";
import HidableButton from "components/hidableButton";
import { Clock, Download } from "@geist-ui/icons";
import { getLanguageFromFilename } from "lib/filetype";
import Link from "next/link";
import Layout from "components/layout";
import Hightlighted from "components/hightlighted";
import { DOWNLOAD_URL, PERMA_URL } from "lib/downloadUrl";
import Thumbnail from "components/thumbnail";
import humanizeDuration from "humanize-duration";

export default function DropIndex({
  drop,
  paste,
  files,
  expires,
}: {
  drop: Drop;
  paste?: string;
  files?: File[];
  language?: string;
  expires: number;
}) {
  const [archiveLink, setArchiveLink] = useState<string>();
  const [archiving, setArchiving] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(undefined);

  useEffect(() => {
    fetch(`/api/${drop.slug}/checkArchive`).then(async (response) => {
      if (response.ok) {
        setArchiveLink(await response.text());
      }
    });
  }, [drop.slug]);

  return (
    <div className="root">
      <Layout
        footer={
          <>
            <Spacer style={{ flexGrow: 1 }} />
            {expires > 0 && (
              <>
                <Clock size="15px" />
                <div>
                  Expires in {humanizeDuration(expires, { largest: 1 })}
                </div>
              </>
            )}
            <a href={`${PERMA_URL}/${drop.slug}/${files[0].name}`} download>
              <HidableButton
                icon={<Download />}
                ml={0.5}
                type={"success"}
                width={110}
              >
                Download
              </HidableButton>
            </a>
          </>
        }
        header={
          paste
            ? files[0].name
            : expires > 0 && (
                <div className="expiresHeader">
                  <Clock size="15px" />
                  <div>
                    Expires in {humanizeDuration(expires, { largest: 1 })}
                  </div>
                </div>
              )
        }
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
          <>
            <div className="grid">
              {files.map((file) => (
                <Card key={file.id} shadow>
                  <Link
                    href={`/${drop.slug}/${file.name}`}
                    passHref
                    key={file.id}
                    legacyBehavior
                  >
                    <a>
                      <Thumbnail file={file} />
                      <Text type="secondary" margin={0} small>
                        {file.name}
                      </Text>
                    </a>
                  </Link>
                </Card>
              ))}
            </div>
            {files.length > 1 && (
              <a href={archiveLink} ref={linkRef} className="archiveButton">
                <Button
                  type="success"
                  icon={<Download />}
                  loading={archiving}
                  onClick={() => {
                    if (archiveLink) return;
                    setArchiving(true);
                    fetch(`/api/${drop.slug}/archive`).then(
                      async (response) => {
                        if (response.ok) {
                          setArchiveLink(await response.text());
                          setArchiving(false);
                          setTimeout(() => {
                            linkRef.current.click();
                          });
                        }
                      },
                    );
                  }}
                  disabled={archiving}
                  placeholder=""
                  onPointerEnterCapture={() => {}}
                  onPointerLeaveCapture={() => {}}
                >
                  Download as Archive
                </Button>
              </a>
            )}
          </>
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

        .grid :global(small) {
          display: block;
          text-align: center;
          width: 100%;
          margin-top: 5px;
          line-height: 1em;
          height: 1.2em;
          overflow: hidden;
        }

        .expiresHeader {
          display: flex;
          align-items: center;
        }

        .expiresHeader :global(svg) {
          margin-right: 7px;
        }

        .archiveButton {
          align-self: center;
          margin: 40px 0 40px 0;
        }
        .archiveButton > :global(.btn) {
          padding-left: 40px;
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
  const expires = drop.expires ? drop.expires?.getTime() - Date.now() : -1;
  delete drop.created;
  delete drop.expires;

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
      const content = await getFile(file.dropSlug, file.name);
      return {
        props: {
          paste: content.toString(),
          drop,
          files: [file],
          expires,
        },
      };

    case "files":
      const files = await getFiles(drop.slug);
      return {
        props: {
          files,
          drop,
          expires,
        },
      };

    default:
      throw new Error("Invalid drop type");
  }
};
