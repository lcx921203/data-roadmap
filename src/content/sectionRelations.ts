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

const icebergSectionRelations = loadYaml<SectionRelationRegistry>(
  'content/mappings/iceberg-section-relations-v0.6.7.1.yaml',
)

export function getSectionRelationTargets(
  sourceType: 'knowledge' | 'scale',
  sourceId: string,
  anchor: string,
): RelationTarget[] {
  return icebergSectionRelations.relations.find(
    (relation) =>
      relation.source_type === sourceType &&
      relation.source_id === sourceId &&
      relation.anchor === anchor,
  )?.targets ?? []
}
