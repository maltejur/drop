let DOWNLOAD_URL = process.env.NEXT_PUBLIC_DOWNLOAD_URL;
const NODE_ENV = process.env.NODE_ENV;

if (!DOWNLOAD_URL)
  if (NODE_ENV === "development") DOWNLOAD_URL = "http://localhost:3000";
  else
    throw new Error(
      "DOWNLOAD_URL is not defined, it has to point to the URL where the files are hosted (for example with nginx)"
    );

export default DOWNLOAD_URL;
