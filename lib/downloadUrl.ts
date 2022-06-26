export let DOWNLOAD_URL = process.env.NEXT_PUBLIC_DOWNLOAD_URL;
export let PERMA_URL = process.env.NEXT_PUBLIC_PERMA_URL;
const NODE_ENV = process.env.NODE_ENV;

if (!DOWNLOAD_URL)
  if (NODE_ENV === "development") DOWNLOAD_URL = "http://localhost:3000";
  else
    throw new Error(
      "NEXT_PUBLIC_DOWNLOAD_URL is not defined, it has to point to the URL where the files are hosted (for example with nginx)"
    );

if (!PERMA_URL) PERMA_URL = DOWNLOAD_URL;
