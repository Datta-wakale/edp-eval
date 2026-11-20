import type { ReactNode } from "react";
import Layout from "@theme/Layout";
import Login from "@site/src/UserDemo";

export default function LoginPage(): ReactNode {
    return (
        <Layout>
           <Login />
        </Layout>
    );
}
