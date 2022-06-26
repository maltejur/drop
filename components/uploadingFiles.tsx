import { Progress, Spinner, Text } from "@geist-ui/core";
import humanFileSize from "lib/humanFileSize";
import { UploaderFile } from "lib/uploader";
import { DOWNLOAD_URL, PERMA_URL } from "lib/downloadUrl";

export default function UploadingFiles({
  dropSlug,
  stagedFiles = [],
  uploadingFiles = [],
}: {
  dropSlug: string;
  stagedFiles?: File[];
  uploadingFiles: UploaderFile[];
}) {
  return (
    <div className="root">
      {Object.values(uploadingFiles).map((file) => (
        <div key={file.id} className="file">
          <div className="filename">
            <Text className="name">{file.file.name}</Text>
            {typeof file.md5 !== "string" && (
              <>
                <Text type="secondary" small ml={0.7}>
                  Calculating Hash
                </Text>
                <Spinner scale={0.7} ml={0.5} />
              </>
            )}
            {(file.uploadedSize === file.totalSize || file.uploader.done) && (
              <>
                <Text mx={0.4}>-</Text>
                <Text
                  small
                  type="success"
                  style={{ cursor: "pointer" }}
                  mr={0.6}
                >
                  <a href={`/${dropSlug}/${file.file.name}`}>View</a>
                </Text>
                <Text
                  small
                  type="success"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${PERMA_URL}/${dropSlug}/${file.file.name}`
                    );
                  }}
                  mr={0.6}
                >
                  Copy link
                </Text>
                <Text small type="success" style={{ cursor: "pointer" }}>
                  <a href={`${DOWNLOAD_URL}/${dropSlug}/${file.file.name}`}>
                    Download
                  </a>
                </Text>
              </>
            )}
            <div className="spacer"></div>
            <Text>
              {file.prettyUploadedSize} / {file.prettyTotalSize}
            </Text>
          </div>
          <Progress
            value={file.uploadedSize / file.totalSize}
            max={1}
            type={
              file.uploadedSize === file.totalSize || file.uploader.done
                ? "success"
                : "default"
            }
          />
        </div>
      ))}
      {stagedFiles.map((file) => (
        <div key={file.name} className="file">
          <div className="filename">
            <Text className="name">{file.name}</Text>
            <Text>{humanFileSize(file.size)}</Text>
          </div>
          <Progress value={0} max={1} type="secondary" />
        </div>
      ))}
      <style jsx>{`
        .root {
          padding: 30px;
          padding-bottom: 40px;
        }

        .file {
          margin-bottom: 15px;
        }

        .filename {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: -10px;
        }

        .filename :global(.name) {
          max-width: 50%;
          word-break: break-all;
        }

        .spacer {
          flex-grow: 1;
        }
      `}</style>
    </div>
  );
}
