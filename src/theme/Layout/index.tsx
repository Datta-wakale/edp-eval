import type {ComponentProps, ReactNode} from 'react';
import Layout from '@theme-original/Layout';
import BookMarkManager from '@site/src/components/BookMarkManager';

type LayoutProps = ComponentProps<typeof Layout>;

export default function LayoutWrapper(props: LayoutProps): ReactNode {
  return (
    <>
      <Layout {...props}/>
      <BookMarkManager />
    </>
  );
}