import { Button } from "@geist-ui/react";
import { Plus, Share2, UploadCloud } from "@geist-ui/react-icons";
import React from "react";
import { DropEvent, FileRejection, useDropzone } from "react-dropzone";
import Link from "next/link";

export default function Navbar({
  onFiles,
}: {
  onFiles: (files: File[]) => void;
}) {
  function onDrop(
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) {
    onFiles(acceptedFiles);
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="navbar">
      <Link href="/" passHref>
        <a className="title">
          <UploadCloud size={30} />
          <h3>drop</h3>
        </a>
      </Link>
      <div className="buttons">
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <Button
            auto
            scale={0.7}
            icon={<Plus />}
            type={isDragActive ? "success" : "default"}
            ghost={isDragActive ? true : false}
          >
            Add files
          </Button>
        </div>
        <Button type="success" auto scale={0.7} icon={<Share2 />}>
          Share
        </Button>
      </div>
      <style jsx>{`
        .navbar {
          display: flex;
          height: 30px;
          width: 100%;
          max-width: 1000px;
          margin: auto;
          padding: 30px;
          align-items: center;
          justify-content: space-between;
        }

        .title {
          color: black;
          display: flex;
        }

        h3 {
          margin-left: 10px;
          transform: translateY(3px);
        }

        .buttons {
          display: flex;
        }

        .buttons :global(button) {
          margin-left: 7px !important;
        }
      `}</style>
    </div>
  );
}
