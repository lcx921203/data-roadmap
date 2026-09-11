const knowledgeTopicLabels: Record<string, string> = {
  iceberg: 'Iceberg',
  trino: 'Trino',
  dbt: 'dbt',
  metricflow: 'MetricFlow',
  dagster: 'Dagster',
  datahub: 'DataHub',
  spark: 'Spark',
  flink: 'Flink',
  kafka: 'Kafka',
  doris: 'Doris',
}

export function getKnowledgeTopicLabel(
  topic?: string,
): string | null {
  if (!topic) return null

  return knowledgeTopicLabels[topic.toLowerCase()] ?? topic
}
