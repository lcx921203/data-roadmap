import { useMemo, useState } from 'react'
import { QuestionRow } from '../components/QuestionRow'
import { SearchIcon } from '../components/Icons'
import { TopBar } from '../components/TopBar'
import { appRegistry } from '../content/registry'

type FilterKey = 'all' | 'core' | 'repeated' | 'curated'

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'core', label: '核心重复' },
  { key: 'repeated', label: '多次重复' },
  { key: 'curated', label: '答案已整理' },
]

export function InterviewPage() {
  const { interviewBank } = appRegistry
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    return interviewBank.questions.filter((question) => {
      const matchesKeyword =
        !keyword || question.question.toLowerCase().includes(keyword)

      const matchesFilter =
        filter === 'all' ||
        (filter === 'core' && question.frequency_band === 'core_verified') ||
        (filter === 'repeated' &&
          question.frequency_band === 'repeated_verified') ||
        (filter === 'curated' && question.answer_curated)

      return matchesKeyword && matchesFilter
    })
  }, [filter, interviewBank.questions, query])

  return (
    <>
      <TopBar title="Interview" />
      <div className="page page--list">
        <h1>面试题</h1>
        <p className="page-lead">
          按当前已收录的真实面经出现情况排序。
        </p>

        <label className="search-field">
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索 Spark、Kafka、Iceberg..."
            aria-label="搜索面试题"
          />
        </label>

        <div className="chip-row" aria-label="面试题筛选">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              data-selected={filter === item.key}
              aria-pressed={filter === item.key}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="section-heading section-heading--interview">
          <h2>题目</h2>
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
            <p>可以换一个关键词或筛选条件。</p>
          </div>
        )}
      </div>
    </>
  )
}
