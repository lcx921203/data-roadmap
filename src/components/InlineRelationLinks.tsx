import { ChevronIcon } from './Icons'
import {
  appRegistry,
  getKnowledgeById,
} from '../content/registry'
import type {
  RelationAssetType,
  RelationTarget,
} from '../content/sectionRelations'

interface InlineRelationLinksProps {
  targets?: RelationTarget[]
  placement?: 'section' | 'header'
}

interface ResolvedRelation {
  type: RelationAssetType
  label: string
  href: string
}

function typeLabel(type: RelationAssetType): string {
  if (type === 'knowledge') return 'Learn'
  if (type === 'scale') return 'Scale'
  return 'Interview'
}

function resolveTarget(
  target: RelationTarget,
): ResolvedRelation | null {
  if (target.type === 'knowledge') {
    const article = getKnowledgeById(target.id)
    if (!article) return null

    return {
      type: target.type,
      label: article.meta.title_cn ?? article.meta.title,
      href: `#/learn/${article.meta.id}`,
    }
  }

  if (target.type === 'scale') {
    const scenario = appRegistry.scaleScenarios.find(
      (item) => item.id === target.id,
    )
    if (!scenario) return null

    return {
      type: target.type,
      label: scenario.title_cn ?? scenario.title,
      href: `#/scale/${scenario.id}`,
    }
  }

  const question = appRegistry.interviewBank.questions.find(
    (item) => item.id === target.id,
  )
  if (!question) return null

  return {
    type: target.type,
    label: question.question,
    href: `#/interview/${question.id}`,
  }
}

export function InlineRelationLinks({
  targets,
  placement = 'section',
}: InlineRelationLinksProps) {
  if (!targets?.length) return null

  const relations = targets.flatMap((target) => {
    const resolved = resolveTarget(target)
    return resolved ? [resolved] : []
  })

  if (!relations.length) return null

  return (
    <div
      className="context-relations"
      data-placement={placement}
      aria-label="关联内容"
    >
      {relations.map((relation) => (
        <a
          key={`${relation.type}:${relation.href}`}
          className="context-relation"
          href={relation.href}
        >
          <span className="context-relation__kind">
            {typeLabel(relation.type)}
          </span>
          <span className="context-relation__title">
            {relation.label}
          </span>
          <ChevronIcon />
        </a>
      ))}
    </div>
  )
}
