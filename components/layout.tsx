import { ReactNode } from "react";
import {
  Button,
  Fieldset,
  FieldsetContentProps,
  Spacer,
  Text,
  TextProps,
} from "@geist-ui/core";
import { LogOut, UploadCloud } from "@geist-ui/icons";
import NextLink from "next/link";
import { useRouter } from "next/router";

export default function Layout({
  children,
  header,
  footer,
  below,
  titleProps,
  contentProps,
  headerHidden = false,
  footerHidden = false,
  padding = 30,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  below?: ReactNode;
  titleProps?: TextProps;
  contentProps?: FieldsetContentProps;
  headerHidden?: boolean;
  footerHidden?: boolean;
  padding?: number;
}) {
  const router = useRouter();

  return (
    <div className="root">
      {router.pathname === "/" && (
        <Button
          placeholder=""
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
          icon={<LogOut />}
          scale={0.7}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1000,
          }}
          type="abort"
          onClick={() => {
            document.cookie =
              "pass=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            router.push("/login");
          }}
        >
          Sign Out
        </Button>
      )}
      <div className="header">
        <NextLink href="/" passHref legacyBehavior>
          <a>
            <Text h3 {...titleProps}>
              <UploadCloud />
              <Spacer width={0.7} inline />
              Drop
            </Text>
          </a>
        </NextLink>

        <div
          className={
            !header || headerHidden ? "fieldsetHeader hidden" : "fieldsetHeader"
          }
        >
          {header}
        </div>
      </div>
      <Fieldset className="fieldset">
        <Fieldset.Content className="fieldsetContent" {...contentProps}>
          {children}
        </Fieldset.Content>
        <Fieldset.Footer
          className={
            !footer || footerHidden ? "fieldsetFooter hidden" : "fieldsetFooter"
          }
        >
          {footer}
        </Fieldset.Footer>
      </Fieldset>
      {below}
      <style jsx>{`
        .root {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          height: 100vh;
          margin: auto !important;
          width: 1000px !important;
          max-width: calc(100% - 60px);
        }

        .root :global(.fieldset) {
          width: 100% !important;
        }

        .root :global(.fieldsetContent) {
          width: calc(100% - ${padding * 2}px);
          padding: ${padding}px !important;
          max-height: calc(100vh - 250px);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .dropHere :global(svg) {
          transform: translateY(5px);
        }

        .root :global(.fieldsetFooter) {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 6px;
          height: 55px;
          transition:
            height 0.4s ease,
            padding 0.4s ease,
            opacity 0.4s ease;
        }

        .root :global(.fieldsetFooter.hidden) {
          height: 0 !important;
          padding: 0 !important;
          opacity: 0 !important;
        }
        .root .fieldsetHeader {
          color: #444;
          transition: opacity 0.4s ease;
          font-size: calc(0.875 * 16px);
          margin: 0;
          display: flex;
          align-self: flex-end;
          padding-bottom: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          width: 100%;
        }

        .header :global(a) {
          color: inherit;
        }

        .header :global(h3) {
          cursor: pointer;
        }

        .header :global(h3):hover {
          text-decoration: underline;
        }

        .root .fieldsetHeader.hidden {
          opacity: 0 !important;
        }

        @media (max-width: 800px) {
          .root :global(.fieldsetFooter) {
            height: auto;
          }
        }
      `}</style>
    </div>
  );
}
