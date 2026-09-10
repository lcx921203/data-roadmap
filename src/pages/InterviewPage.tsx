import { useMemo, useState } from 'react'
import { BottomSheet } from '../components/BottomSheet'
import { QuestionRow } from '../components/QuestionRow'
import { SearchIcon } from '../components/Icons'
import { TopBar } from '../components/TopBar'
import { appRegistry } from '../content/registry'
import {
  interviewDiscovery,
  matchesAnswerFilter,
  matchesFrequencyFilter,
  matchesInterviewSearch,
  matchesInterviewTag,
} from '../content/interviewDiscovery'
import type {
  InterviewAnswerFilter,
  InterviewFrequencyFilter,
} from '../types/discovery'

const frequencyOptions: Array<{
  value: InterviewFrequencyFilter
  label: string
}> = [
  { value: 'all', label: '不限' },
  { value: 'core', label: '核心重复题' },
  { value: 'repeated', label: '多次重复题' },
  { value: 'supported', label: '有重复证据' },
  { value: 'single', label: '真实单次题' },
]

export function InterviewPage() {
  const { interviewBank } = appRegistry
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [frequency, setFrequency] =
    useState<InterviewFrequencyFilter>('all')
  const [answer, setAnswer] =
    useState<InterviewAnswerFilter>('all')

  const visible = useMemo(
    () =>
      interviewBank.questions.filter(
        (question) =>
          matchesInterviewSearch(question, query) &&
          matchesInterviewTag(question, activeTag) &&
          matchesFrequencyFilter(question, frequency) &&
          matchesAnswerFilter(question, answer),
      ),
    [
      activeTag,
      answer,
      frequency,
      interviewBank.questions,
      query,
    ],
  )

  const hasAdvancedFilters = frequency !== 'all' || answer !== 'all'

  return (
    <>
      <TopBar title="Interview" />
      <div className="page page--list">
        <h1>面试题</h1>
        <p className="page-lead">
          搜索问题和场景，或按技术快速进入题集。
        </p>

        <label className="search-field interview-search">
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索问题、场景或关键词…"
            aria-label="搜索面试题"
          />
        </label>
        <p className="search-example">
          例如：数据倾斜、指标不一致、历史回填
        </p>

        <div className="quick-filter-heading">
          <strong>按技术快速进入</strong>
          <button
            type="button"
            className="advanced-filter-button"
            data-active={hasAdvancedFilters}
            onClick={() => setFiltersOpen(true)}
          >
            筛选{hasAdvancedFilters ? ' · 已应用' : ''}
          </button>
        </div>

        <div className="chip-row interview-tech-chips" aria-label="技术标签">
          <button
            type="button"
            data-selected={activeTag === null}
            aria-pressed={activeTag === null}
            onClick={() => setActiveTag(null)}
          >
            全部
          </button>
          {interviewDiscovery.quick_tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              data-selected={activeTag === tag.id}
              aria-pressed={activeTag === tag.id}
              onClick={() =>
                setActiveTag((current) =>
                  current === tag.id ? null : tag.id,
                )
              }
            >
              {tag.label}
            </button>
          ))}
        </div>

        <div className="section-heading section-heading--interview">
          <h2>
            {activeTag
              ? interviewDiscovery.quick_tags.find(
                  (tag) => tag.id === activeTag,
                )?.label ?? '题目'
              : '题目'}
          </h2>
          <span>{visible.length} 道</span>
        </div>

        {visible.length > 0 ? (
          <section className="question-list" aria-label="面试题列表">
            {visible.map((question) => (
              <QuestionRow key={question.id} item={question} />
            ))}
          </section>
        ) : (
          <div className="empty-state">
            <strong>没有找到相关题目</strong>
            <p>可以换一个关键词，或清除技术标签和筛选条件。</p>
          </div>
        )}
      </div>

      <BottomSheet
        open={filtersOpen}
        title="筛选题目"
        onClose={() => setFiltersOpen(false)}
      >
        <section className="filter-group">
          <h3>出现情况</h3>
          <div className="filter-choice-list">
            {frequencyOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                data-selected={frequency === option.value}
                onClick={() => setFrequency(option.value)}
              >
                <span>{option.label}</span>
                <span aria-hidden="true">
                  {frequency === option.value ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="filter-group">
          <h3>答案</h3>
          <div className="filter-choice-list">
            <button
              type="button"
              data-selected={answer === 'all'}
              onClick={() => setAnswer('all')}
            >
              <span>不限</span>
              <span aria-hidden="true">{answer === 'all' ? '✓' : ''}</span>
            </button>
            <button
              type="button"
              data-selected={answer === 'curated'}
              onClick={() => setAnswer('curated')}
            >
              <span>答案已整理</span>
              <span aria-hidden="true">
                {answer === 'curated' ? '✓' : ''}
              </span>
            </button>
          </div>
        </section>

        <div className="filter-sheet-actions">
          <button
            type="button"
            className="secondary-action"
            onClick={() => {
              setFrequency('all')
              setAnswer('all')
            }}
          >
            清除筛选
          </button>
          <button
            type="button"
            className="primary-action"
            onClick={() => setFiltersOpen(false)}
          >
            查看 {visible.length} 道题
          </button>
        </div>
      </BottomSheet>
    </>
  )
}
