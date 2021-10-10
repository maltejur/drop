module.exports = {
  reactStrictMode: true,
  async rewrites() {
    const fileserver = `http://localhost:${process.env.FILES_PORT || 3051}`;
    return [
      {
        source: "/file/:dropSlug/:fileName",
        destination: `${fileserver}/file/:dropSlug/:fileName`,
      },
      {
        source: "/thumbnail/:dropSlug/:fileName",
        destination: `${fileserver}/thumbnail/:dropSlug/:fileName`,
      },
    ];
  },
};
