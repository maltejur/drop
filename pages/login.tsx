import { Button, Input, Text } from "@geist-ui/core";
import { LogIn } from "@geist-ui/icons";
import Layout from "components/layout";
import { isValidPass } from "lib/auth";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>();
  const router = useRouter();

  async function login() {
    setLoading(true);
    document.cookie = `pass=${encodeURIComponent(password)};max-age=31536000;Secure`;
    const response = await fetch("/api/auth");
    if (response.ok) {
      router.push("/");
    } else {
      setError("Invalid password");
      setLoading(false);
    }
  }

  return (
    <Layout>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          login();
        }}
      >
        <Input.Password
          disabled={loading}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(undefined);
          }}
          type={error ? "error" : undefined}
          placeholder="Password"
          required
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
          crossOrigin=""
        />
        <Text type="error" small>
          {error}
        </Text>
        <Button
          scale={0.7}
          icon={<LogIn />}
          type="success"
          htmlType="submit"
          loading={loading}
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
          placeholder=""
        >
          Login
        </Button>
      </form>
      <style jsx>{`
        form {
          display: flex;
          flex-direction: column;
          align-items: end;
          gap: 10px;
          margin: 50px auto !important;
        }
      `}</style>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (isValidPass(ctx.req.cookies["pass"])) {
    return {
      props: {},
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  return {
    props: {},
  };
};
