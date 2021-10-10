import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-csharp";
import "prismjs/themes/prism.css";
import { useMemo } from "react";

export default function Hightlighted({
  children,
  language,
  noBorder = false,
}: {
  children: string;
  language: string;
  noBorder?: boolean;
}) {
  const highlighted = useMemo(() => {
    if (children) {
      return highlight(children, languages[language], language);
    }
  }, [language, children]);

  return highlighted ? (
    <pre
      dangerouslySetInnerHTML={{ __html: highlighted }}
      style={noBorder ? { border: "none" } : {}}
    />
  ) : (
    <pre>{children}</pre>
  );
}
