import Layout from "components/layout";

export default function Page404() {
  return (
    <Layout>
      <div className="center">
        <div className="errCode">404</div>
        <div>Page Not Found</div>
      </div>
      <style jsx>{`
        .center {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 200px;
        }

        .errCode {
          font-size: 40px;
          font-weight: bold;
        }
      `}</style>
    </Layout>
  );
}
