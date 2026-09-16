import React from 'react';
import Layout from '@theme/Layout';
import CapabilityFilter from '@site/src/components/CapabilityFilter'

const CAPABILITIES = [
  { id: 'bq',   title: 'BigQuery Datasets' },
  { id: 'gcs',  title: 'GCS Buckets' },
  { id: 'iam',  title: 'Service Accounts (IAM)' },
  { id: 'dbt',  title: 'dbt Transformations' },
  { id: 'air',  title: 'Airflow DAGs' },
  { id: 'look', title: 'Looker Dashboards' },
];

export default function Capabilities() {
  return (
    <Layout title="Capabilities" description="Filter EDP capabilities">
      <main className="container margin-vert--lg">
        <h1>Capabilities</h1>
        <CapabilityFilter capabilities={CAPABILITIES} />
      </main>
    </Layout>
  );
}
