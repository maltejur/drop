// https://github.com/killmenot/valid-data-url
// https://github.com/killmenot/parse-data-url

function validDataUrl(s: string) {
  return validDataUrl.regex.test((s || "").trim());
}
validDataUrl.regex =
  /^data:([a-z]+\/[a-z0-9-+.]+(;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}()|~`]+)*)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)$/i;

interface Parsed {
  mediaType?: string;
  contentType?: string;
  base64: string;
  data: string;
  toBuffer: () => Buffer;
}

export default function parseDataUrl(s: string) {
  if (!validDataUrl(s)) {
    return null;
  }

  const parts = s.trim().match(validDataUrl.regex);
  const parsed: any = {};

  if (parts[1]) {
    parsed.mediaType = parts[1].toLowerCase();

    const mediaTypeParts = parts[1].split(";").map((x) => x.toLowerCase());

    parsed.contentType = mediaTypeParts[0];

    mediaTypeParts.slice(1).forEach((attribute) => {
      const p = attribute.split("=");
      parsed[p[0]] = p[1];
    });
  }

  parsed.base64 = !!parts[parts.length - 2];
  parsed.data = parts[parts.length - 1] || "";

  parsed.toBuffer = () => {
    const encoding = parsed.base64 ? "base64" : "utf8";

    return Buffer.from(parsed.data, encoding);
  };

  return parsed as Parsed;
}
