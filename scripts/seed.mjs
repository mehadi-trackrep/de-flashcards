// One-time seed script — run with: node scripts/seed.mjs YOUR_UID
// Requires your .env.local to be filled with Firebase config

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, writeBatch } from "firebase/firestore";
import { readFileSync } from "fs";

// Load .env.local
const env = readFileSync(".env.local", "utf-8");
const config = {};
for (const line of env.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key?.startsWith("NEXT_PUBLIC_")) config[key.trim()] = rest.join("=").trim();
}

const app = initializeApp({
  apiKey:            config.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     config.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             config.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);

const UID = process.argv[2];
if (!UID) {
  console.error("\n❌  Provide your UID:  node scripts/seed.mjs YOUR_UID_HERE");
  console.error("    Find it: Firebase Console → Authentication → Users → User UID\n");
  process.exit(1);
}

const TOPICS = [
  { name: "SQL & Databases",        emoji: "🗄️" },
  { name: "Data Modeling",          emoji: "📐" },
  { name: "ETL / ELT",              emoji: "⚙️" },
  { name: "Streaming",              emoji: "🌊" },
  { name: "Data Warehousing",       emoji: "🏛️" },
  { name: "Cloud & Infrastructure", emoji: "☁️" },
  { name: "Python for DE",          emoji: "🐍" },
  { name: "Orchestration",          emoji: "🎼" },
];

const CARDS = [
  { id:"sql-1", topic:"SQL & Databases", emoji:"🗄️", question:"What is the difference between OLTP and OLAP?", answer:"OLTP handles many small, fast read/write transactions (e.g., banking). OLAP handles complex queries on large datasets for analytics. OLTP is row-oriented; OLAP is typically column-oriented." },
  { id:"sql-2", topic:"SQL & Databases", emoji:"🗄️", question:"What are database indexes and why do they matter?", answer:"Indexes are data structures (often B-Trees) that speed up read queries by avoiding full table scans. They trade write performance and storage for faster lookups. Critical for large tables where full scans are too slow." },
  { id:"sql-3", topic:"SQL & Databases", emoji:"🗄️", question:"Explain ACID properties in databases.", answer:"Atomicity (all-or-nothing), Consistency (data remains valid), Isolation (concurrent transactions don't interfere), Durability (committed data persists). These guarantee reliable database transactions." },
  { id:"sql-4", topic:"SQL & Databases", emoji:"🗄️", question:"What is a window function in SQL?", answer:"Window functions perform calculations across rows related to the current row without collapsing them. Example: ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) ranks employees by salary within each department." },
  { id:"sql-5", topic:"SQL & Databases", emoji:"🗄️", question:"What is the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN?", answer:"INNER JOIN returns only matching rows. LEFT JOIN returns all rows from left table + matches from right. FULL OUTER JOIN returns all rows from both tables, with nulls where no match exists." },
  { id:"dm-1",  topic:"Data Modeling",   emoji:"📐", question:"What is a Star Schema vs Snowflake Schema?", answer:"Star Schema: fact table at center connected directly to dimension tables — simple, fast queries. Snowflake Schema: dimension tables further normalized — less redundancy, more joins." },
  { id:"dm-2",  topic:"Data Modeling",   emoji:"📐", question:"What is a slowly changing dimension (SCD)?", answer:"SCD handles how dimension data changes over time. Type 1: overwrite. Type 2: add new row with version/date (full history). Type 3: add new column. Type 2 is most common in warehousing." },
  { id:"dm-3",  topic:"Data Modeling",   emoji:"📐", question:"What is the difference between normalized and denormalized data models?", answer:"Normalized (3NF): eliminates redundancy, more joins needed. Denormalized: data is flattened for query performance. Data warehouses often denormalize for faster analytical reads." },
  { id:"dm-4",  topic:"Data Modeling",   emoji:"📐", question:"What is a fact table and what types exist?", answer:"Fact tables store measurable business events. Types: Transaction (each row = one event), Periodic Snapshot (state at regular intervals), Accumulating Snapshot (row updates as process moves through stages)." },
  { id:"etl-1", topic:"ETL / ELT",       emoji:"⚙️", question:"What is the difference between ETL and ELT?", answer:"ETL: Extract → Transform → Load. Data transformed before loading. ELT: Extract → Load → Transform. Raw data loaded first, transformed inside the warehouse. ELT is preferred with modern cloud warehouses." },
  { id:"etl-2", topic:"ETL / ELT",       emoji:"⚙️", question:"What is idempotency in data pipelines?", answer:"An idempotent pipeline produces the same result regardless of how many times it runs. Critical for safe retries. Achieved by MERGE/UPSERT instead of INSERT, or truncate-and-reload patterns." },
  { id:"etl-3", topic:"ETL / ELT",       emoji:"⚙️", question:"What is data lineage and why does it matter?", answer:"Data lineage tracks the origin, movement, and transformation of data through a pipeline. Enables impact analysis, debugging, compliance, and trust in data quality." },
  { id:"etl-4", topic:"ETL / ELT",       emoji:"⚙️", question:"What is incremental loading vs full refresh?", answer:"Full refresh: reload all data every run (simple, expensive). Incremental: only load new/changed records since last run using a watermark (e.g., updated_at timestamp). Incremental is preferred for large tables." },
  { id:"stream-1", topic:"Streaming",    emoji:"🌊", question:"What is Apache Kafka and what problem does it solve?", answer:"Kafka is a distributed event streaming platform. It decouples producers from consumers, provides durable ordered event logs, handles high-throughput real-time data, and enables replay of events." },
  { id:"stream-2", topic:"Streaming",    emoji:"🌊", question:"What is the difference between stream processing and batch processing?", answer:"Batch: processes data in chunks at scheduled intervals (high latency). Stream: processes data continuously as it arrives (low latency). Stream is needed for real-time use cases." },
  { id:"stream-3", topic:"Streaming",    emoji:"🌊", question:"What are watermarks in stream processing?", answer:"Watermarks track event-time progress in a stream — telling the system all events up to time T have arrived. Used in Flink, Spark Streaming, and Dataflow for windowed aggregations." },
  { id:"stream-4", topic:"Streaming",    emoji:"🌊", question:"Explain exactly-once, at-least-once, and at-most-once delivery semantics.", answer:"At-most-once: may be lost, never duplicated. At-least-once: always delivered, may duplicate. Exactly-once: delivered precisely once — requires idempotent consumers + transactional producers." },
  { id:"dw-1",  topic:"Data Warehousing",emoji:"🏛️", question:"What is columnar storage and why is it used in data warehouses?", answer:"Columnar storage stores data by column rather than row. Benefits: better compression, faster analytical queries, vectorized execution. Used by Parquet, BigQuery, Snowflake, Redshift." },
  { id:"dw-2",  topic:"Data Warehousing",emoji:"🏛️", question:"What is data partitioning and clustering in a warehouse?", answer:"Partitioning: splits data into segments by a column (e.g., date) to enable partition pruning. Clustering: sorts data within partitions to co-locate similar values. Both reduce data scanned per query." },
  { id:"dw-3",  topic:"Data Warehousing",emoji:"🏛️", question:"What is dbt and what problem does it solve?", answer:"dbt brings software engineering practices to data transformation — modular SQL, dependency management, documentation, testing, and managing the T in ELT pipelines." },
  { id:"dw-4",  topic:"Data Warehousing",emoji:"🏛️", question:"What is the medallion architecture (Bronze/Silver/Gold)?", answer:"A layered data lakehouse pattern. Bronze: raw ingested data. Silver: cleaned, validated, joined data. Gold: business-ready aggregates. Each layer adds trust and structure progressively." },
  { id:"cloud-1",topic:"Cloud & Infrastructure",emoji:"☁️", question:"What is object storage and how does it differ from a file system?", answer:"Object storage (S3, GCS, ADLS) stores flat objects with metadata and unique keys — infinitely scalable, cheap. File systems have hierarchical directories and limited scale. Data lakes are built on object storage." },
  { id:"cloud-2",topic:"Cloud & Infrastructure",emoji:"☁️", question:"What is Apache Parquet and why is it preferred for data lakes?", answer:"Parquet is a columnar open-source file format. Advantages: column pruning, predicate pushdown, excellent compression, schema evolution, supported by Spark, Hive, BigQuery, Athena." },
  { id:"cloud-3",topic:"Cloud & Infrastructure",emoji:"☁️", question:"What is a data lakehouse architecture?", answer:"A lakehouse combines the cheap storage of a data lake with the reliability of a data warehouse (ACID, SQL). Enabled by Delta Lake, Apache Iceberg, and Apache Hudi." },
  { id:"py-1",  topic:"Python for DE",   emoji:"🐍", question:"What is PySpark and when would you use it?", answer:"PySpark is Python's API for Apache Spark. Use it when data is too large for a single machine, for parallel transformations on terabytes of data, or for distributed ML with MLlib." },
  { id:"py-2",  topic:"Python for DE",   emoji:"🐍", question:"What is the difference between Pandas and Polars?", answer:"Pandas: mature, single-threaded, great ecosystem. Polars: newer, multi-threaded, columnar (Arrow), lazy evaluation, 5-50x faster on large datasets. Polars preferred for performance-critical pipelines." },
  { id:"py-3",  topic:"Python for DE",   emoji:"🐍", question:"What are generators in Python and why are they useful in DE?", answer:"Generators yield values lazily one at a time, avoiding loading everything into memory. Critical for streaming large files, paginating API responses, or processing millions of records without OOM errors." },
  { id:"orch-1",topic:"Orchestration",   emoji:"🎼", question:"What is Apache Airflow and what is a DAG?", answer:"Airflow is a workflow orchestration platform. A DAG (Directed Acyclic Graph) defines tasks and their dependencies. Airflow schedules, retries, monitors, and logs pipeline runs." },
  { id:"orch-2",topic:"Orchestration",   emoji:"🎼", question:"What are the trade-offs between Airflow, Prefect, and Dagster?", answer:"Airflow: mature, huge ecosystem, complex setup. Prefect: Python-native, easier dev, dynamic workflows. Dagster: asset-centric, built-in lineage and observability, powerful for data teams." },
  { id:"orch-3",topic:"Orchestration",   emoji:"🎼", question:"What is backfilling in pipeline orchestration?", answer:"Backfilling re-runs a pipeline for historical date ranges to populate new tables or fix corrupted data. Requires idempotent pipelines. In Airflow, triggered via backfill CLI or clearing past DAG runs." },
];

async function seed() {
  console.log(`\n🌱 Seeding Firestore for UID: ${UID}\n`);

  for (const t of TOPICS) {
    await setDoc(doc(db, "users", UID, "topics", t.name), {
      name: t.name, emoji: t.emoji, isDefault: true, createdAt: Date.now(),
    });
    console.log(`  ✓ topic: ${t.emoji}  ${t.name}`);
  }

  const batch = writeBatch(db);
  for (const card of CARDS) {
    batch.set(doc(db, "users", UID, "cards", card.id), {
      ...card, isDefault: true, priority: null, done: false,
      createdAt: Date.now(), updatedAt: Date.now(),
    });
  }
  await batch.commit();
  console.log(`  ✓ ${CARDS.length} cards written in one batch`);

  await setDoc(doc(db, "users", UID, "meta", "info"), {
    seeded: true, seededAt: Date.now(), version: 1, seedCount: CARDS.length,
  });

  console.log(`\n✅ Done! ${CARDS.length} cards + ${TOPICS.length} topics seeded.\n`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err.message, "\n");
  process.exit(1);
});
