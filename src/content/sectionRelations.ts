import { loadYaml } from './loaders'

export type RelationAssetType = 'knowledge' | 'scale' | 'interview'

export interface RelationTarget {
  type: RelationAssetType
  id: string
}

interface SectionRelationRecord {
  source_type: 'knowledge' | 'scale'
  source_id: string
  anchor: string
  targets: RelationTarget[]
}

interface SectionRelationRegistry {
  version: string
  type: 'section_relation_registry'
  topic: string
  relations: SectionRelationRecord[]
}

const sectionRelationRegistries = [
  loadYaml<SectionRelationRegistry>(
    'content/mappings/iceberg-section-relations-v0.6.7.1.yaml',
  ),
  loadYaml<SectionRelationRegistry>(
    'content/mappings/trino-section-relations-v0.7.5.yaml',
  ),
  loadYaml<SectionRelationRegistry>(
    'content/mappings/spark-section-relations-v0.8.5.yaml',
  ),
]

const sectionRelations = sectionRelationRegistries.flatMap(
  (registry) => registry.relations,
)

export function getSectionRelationTargets(
  sourceType: 'knowledge' | 'scale',
  sourceId: string,
  anchor: string,
): RelationTarget[] {
  return (
    sectionRelations.find(
      (relation) =>
        relation.source_type === sourceType &&
        relation.source_id === sourceId &&
        relation.anchor === anchor,
    )?.targets ?? []
  )
}
