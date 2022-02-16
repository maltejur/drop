import { Input, Select, Spacer, Text, useToasts } from "@geist-ui/react";
import {
  Clipboard,
  Clock,
  Download,
  Link,
  Upload,
} from "@geist-ui/react-icons";
import { validateUrl } from "lib/validate";
import React, { useEffect, useMemo, useState } from "react";
import { DropEvent, FileRejection, useDropzone } from "react-dropzone";
import HidableButton from "components/hidableButton";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-css";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-csharp";
import "prismjs/themes/prism.css";
import CIcon from "react-devicons/c/original";
import CppIcon from "react-devicons/cplusplus/original";
import JavascriptIcon from "react-devicons/javascript/original";
import HtmlIcon from "react-devicons/html5/original";
import CssIcon from "react-devicons/css3/original";
import ReactIcon from "react-devicons/react/original";
import JavaIcon from "react-devicons/java/original";
import CsharpIcon from "react-devicons/csharp/original";
import generateId from "lib/generateId";
import UploadingFiles from "components/uploadingFiles";
import axios, { AxiosResponse } from "axios";
import Uploader, { UploaderFile } from "lib/uploader";
import { getFiletypeFromLanguage } from "lib/filetype";
import Layout from "components/layout";

let urlPrefix = process.browser
  ? `${window.location.protocol}//${window.location.host}/`
  : "https://drop.shorsh.de/";

type DropType = "files" | "paste" | "link";

let uploader: Uploader;

export default function Home() {
  const [pasteValue, setPasteValue] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [filename, setFilename] = useState("");
  const [dropUrl, setDropUrl] = useState("");
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [dropType, setDropType] = useState<DropType>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [uploaderFiles, setUploaderFiles] = useState<UploaderFile[]>([]);
  const validUrl = useMemo(() => validateUrl(pasteValue), [pasteValue]);
  const [expires, setExpires] = useState("604800");
  const [, setToast] = useToasts();

  function onDrop(
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) {
    setDropType("files");
    setStagedFiles((stagedFiles) => [...stagedFiles, ...acceptedFiles]);
    setDone(false);
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
  });

  useEffect(() => {
    reset();
    return () => (uploader = undefined);
  }, []);

  async function uploadFiles(files: File[]) {
    setDropType("files");
    setLoading(true);
    const drop = await axios.get("/api/drop/create", {
      params: {
        slug: dropUrl,
        type: "files",
        expires: expires !== "-1" && Date.now() + Number(expires) * 1000,
      },
    });
    const ids = await Promise.all(
      files.map((file) =>
        axios
          .get("/api/upload/create", {
            params: {
              dropSlug: drop.data,
              name: file.name,
              fileSize: file.size,
            },
          })
          .then((response) => response.data as string)
          .catch(() => {
            setToast({
              text: `Error uploading ${file.name}, the file probably already exists`,
              type: "error",
            });
          })
      )
    );
    console.log(ids);
    setStagedFiles([]);
    uploader.addFiles(
      files.filter((_, index) => !!ids[index]),
      ids.filter((id) => !!id) as string[]
    );
    setUploaderFiles(uploader.files);
    uploader.startUpload();
  }

  async function uploadPaste(content: string) {
    setDropType("paste");
    setLoading(true);
    const drop = await axios.get("/api/drop/create", {
      params: {
        slug: dropUrl,
        type: "paste",
        expires: expires !== "-1" && Date.now() + Number(expires) * 1000,
      },
    });
    const name = filename || `paste.${getFiletypeFromLanguage(language)}`;
    axios
      .get("/api/upload/create", {
        params: {
          dropSlug: drop.data,
          name,
          fileSize: content.length,
        },
      })
      .then((response) => {
        uploader.addFiles([new File([content], name)], [response.data]);
        uploader.startUpload();
        setUploaderFiles(uploader.files);
      })
      .catch(() => {
        setToast({
          text: `Error uploading ${name}, the file probably already exist`,
          type: "error",
        });
      });
  }

  async function uploadLink(url: string) {
    setDropType("link");
    setLoading(true);
    await axios.get("/api/drop/create", {
      params: {
        slug: dropUrl,
        type: "redirect",
        url,
        expires: expires !== "-1" && Date.now() + Number(expires) * 1000,
      },
    });
    setLoading(false);
    setDone(true);
  }

  function reset() {
    setDropType(undefined);
    setLoading(false);
    setDone(false);
    uploader = new Uploader();
    uploader.onUpdate = () => {
      setUploaderFiles([...uploader.files]);
    };
    uploader.onDone = () => {
      setLoading(false);
      setDone(true);
    };
    setStagedFiles([]);
    setLanguage("plaintext");
    setFilename("");
    setDropUrl(generateId());
    setPasteValue("");
    setUploaderFiles([]);
  }

  return (
    <div className="root">
      <Layout
        header={
          <>
            <Input
              placeholder="Filename"
              value={filename}
              onChange={(event) => setFilename(event.target.value)}
              disabled={loading || done}
              ml={0.5}
            />
            <Select
              ml={0.5}
              value={language}
              onChange={(value) => setLanguage(value.toString())}
              dropdownStyle={{ overflowX: "hidden" }}
              disabled={loading || done}
            >
              <Select.Option value="plaintext">Plain Text</Select.Option>
              <Select.Option value="json">JSON</Select.Option>
              <Select.Option value="yaml">YAML</Select.Option>
              <Select.Option value="c">
                <CIcon /> C
              </Select.Option>
              <Select.Option value="cpp">
                <CppIcon /> C++
              </Select.Option>
              <Select.Option value="typescript">
                <JavascriptIcon /> JavaScript / TypeScript
              </Select.Option>
              <Select.Option value="html">
                <HtmlIcon /> HTML
              </Select.Option>
              <Select.Option value="css">
                <CssIcon /> CSS
              </Select.Option>
              <Select.Option value="tsx">
                <ReactIcon /> TSX
              </Select.Option>
              <Select.Option value="java">
                <JavaIcon /> Java
              </Select.Option>
              <Select.Option value="csharp">
                <CsharpIcon /> C#
              </Select.Option>
            </Select>
          </>
        }
        footer={
          <>
            <Clock color="gray" size="16px" />
            <Select
              placeholder="Expires in ..."
              value={expires}
              onChange={(expiry) => setExpires(expiry.toString())}
              width={"60px"}
              dropdownStyle={{ overflowX: "hidden" }}
              disabled={loading || done}
            >
              <Select.Option label>Expires in ...</Select.Option>
              <Select.Option value="-1">Never</Select.Option>
              <Select.Option value="15778800">6 Months</Select.Option>
              <Select.Option value="7889400">3 Months</Select.Option>
              <Select.Option value="2419200">1 Month</Select.Option>
              <Select.Option value="604800">1 Week</Select.Option>
              <Select.Option value="172800">2 Days</Select.Option>
              <Select.Option value="86400">1 Day</Select.Option>
              <Select.Option value="21600">6 Hours</Select.Option>
              <Select.Option value="3600">1 Hour</Select.Option>
              <Select.Option value="1200">20 Minutes</Select.Option>
            </Select>
            <Input
              label={!(loading || done) && urlPrefix}
              value={loading || done ? urlPrefix + dropUrl : dropUrl}
              onChange={(event) => setDropUrl(event.target.value)}
              onClick={() => {
                if (done) {
                  window.navigator.clipboard.writeText(urlPrefix + dropUrl);
                  setToast({
                    text: "Copied Link to Clipboard!",
                    type: "success",
                  });
                }
              }}
              disabled={loading}
              placeholder="Drop URL"
              readOnly={loading || done}
              width={18}
            />
            <HidableButton
              icon={<Upload />}
              width={130}
              loading={dropType === "files" && loading}
              done={dropType === "files" && done}
              onClick={() => {
                uploadFiles(stagedFiles);
              }}
              hidden={dropType !== "files"}
              type="success"
            >
              Upload Files
            </HidableButton>
            <HidableButton
              icon={<Upload />}
              ml={0.5}
              width={140}
              loading={dropType === "files" && loading}
              disabled={
                !filename || ((loading || done) && dropType !== "files")
              }
              onClick={() => {
                uploadFiles([new File([pasteValue], filename)]);
                setPasteValue("");
              }}
              hidden={!pasteValue}
            >
              Upload as File
            </HidableButton>
            <HidableButton
              icon={<Clipboard />}
              type={!validUrl ? "success" : "default"}
              width={125}
              loading={dropType === "paste" && loading}
              done={dropType === "paste" && done}
              disabled={dropType !== "paste" && (loading || done)}
              onClick={() => uploadPaste(pasteValue)}
              hidden={!pasteValue}
            >
              Create Paste
            </HidableButton>
            <HidableButton
              icon={<Link />}
              type={"success"}
              hidden={!validUrl || !pasteValue}
              width={150}
              loading={dropType === "link" && loading}
              done={dropType === "link" && done}
              disabled={dropType !== "link" && (loading || done)}
              onClick={() => uploadLink(pasteValue)}
            >
              Create short Link
            </HidableButton>
          </>
        }
        headerHidden={!pasteValue || dropType === "files"}
        footerHidden={!pasteValue && dropType !== "files"}
        below={
          !pasteValue &&
          dropType !== "files" && (
            <a className="below" onClick={() => open()}>
              Or click here to upload files
            </a>
          )
        }
        contentProps={getRootProps()}
        titleProps={{
          onClick: (event) => {
            event.preventDefault();
            reset();
          },
        }}
        padding={0}
      >
        {isDragActive ? (
          <div className="dropHere">
            <Text type="secondary">
              <Download />
              <Spacer inline width={0.5} />
              Drop the files here
            </Text>
          </div>
        ) : dropType === "files" ? (
          <UploadingFiles
            dropSlug={dropUrl}
            stagedFiles={stagedFiles}
            uploadingFiles={uploaderFiles}
          />
        ) : (
          <div className="editor">
            <Editor
              value={pasteValue}
              onValueChange={(value) => setPasteValue(value)}
              highlight={(code) =>
                highlight(code, languages[language], language)
              }
              padding={30}
              placeholder="Paste or type text, an url or drop files here"
              style={{ minHeight: 200 }}
              readOnly={loading || done}
            />
          </div>
        )}
        <input {...getInputProps()} />
      </Layout>

      <style jsx>{`
        .dropHere {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          min-height: 200px;
        }

        .dropHere :global(svg) {
          transform: translateY(5px);
        }

        .editor {
          min-height: 200px;
          max-height: 100%;
          overflow-y: auto;
          font-family: monospace;
          font-size: 12px;
        }

        .below {
          color: gray;
          font-size: 12px;
          transform: translateY(-30px);
          margin-right: 10px;
          align-self: flex-end;
        }
      `}</style>
    </div>
  );
}
