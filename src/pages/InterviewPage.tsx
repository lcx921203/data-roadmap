import { QuestionRow } from '../components/QuestionRow'
import { SearchIcon } from '../components/Icons'
import { TopBar } from '../components/TopBar'
import { appRegistry } from '../content/registry'

export function InterviewPage() {
  const { interviewBank } = appRegistry

  return (
    <>
      <TopBar title="Interview" />
      <div className="page page--list">
        <p className="eyebrow">REAL EVIDENCE · V1</p>
        <h1>30 high-value questions</h1>
        <p className="page-lead">
          真实面经证据排序。题目进入当前范围不等于已经 Publishable。
        </p>

        <button className="search-field" type="button">
          <SearchIcon />
          <span>搜索 Spark、Kafka、Iceberg...</span>
        </button>

        <div className="chip-row" aria-label="快捷筛选">
          <button type="button" data-selected="true">All</button>
          <button type="button">Core</button>
          <button type="button">L5</button>
          <button type="button">Spark</button>
          <button type="button">Warehouse</button>
        </div>

        <section className="question-list" aria-label="Interview Bank">
          {interviewBank.questions.map((question) => (
            <QuestionRow key={question.id} item={question} />
          ))}
        </section>
      </div>
    </>
  )
}
