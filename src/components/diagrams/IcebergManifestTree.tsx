import {
  DiagramArrow,
  DiagramFrame,
  DiagramNode,
} from './DiagramFrame'

export function IcebergManifestTree() {
  return (
    <DiagramFrame
      title="Manifest 层级关系"
      caption="Manifest List 先组织 Manifest；每个 Manifest 再记录多个 Data File / Delete File 及其分区与列统计。"
      className="iceberg-manifest-diagram"
    >
      <div className="diagram-stack">
        <DiagramNode
          tone="amber"
          title="Snapshot"
          subtitle="一个已提交的表版本"
        />
        <DiagramArrow label="引用" />

        <DiagramNode
          tone="violet"
          title="Manifest List"
          subtitle="Manifest 级索引与 Partition Summary"
        />

        <div className="diagram-branch" aria-label="Manifest List 引用多个 Manifest">
          <div className="diagram-branch__stem" aria-hidden="true" />
          <div className="diagram-branch__children">
            <div>
              <DiagramNode
                tone="rose"
                title="Manifest A"
                subtitle="Data File 元数据"
                compact
              />
              <div className="diagram-leaf-list">
                <span>Data File 1</span>
                <span>Data File 2</span>
                <span>Data File 3</span>
              </div>
            </div>

            <div>
              <DiagramNode
                tone="rose"
                title="Manifest B"
                subtitle="Data / Delete File 元数据"
                compact
              />
              <div className="diagram-leaf-list">
                <span>Data File 4</span>
                <span className="diagram-leaf-list__delete">
                  Delete File 1
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="diagram-note diagram-note--split">
        <div>
          <strong>Manifest List</strong>
          <p>Manifest 数量、分区范围摘要等。</p>
        </div>
        <div>
          <strong>Manifest</strong>
          <p>路径、分区值、行数、大小、列统计等。</p>
        </div>
      </div>
    </DiagramFrame>
  )
}
