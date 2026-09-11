import {
  DiagramArrow,
  DiagramBranch,
  DiagramFrame,
  DiagramNode,
} from './DiagramFrame'

export function IcebergManifestTree() {
  return (
    <DiagramFrame
      title="Manifest 层级关系"
      caption="Manifest List 保存 Manifest 级索引与分区摘要；Manifest 记录 Data / Delete File 的路径、分区值、行数、大小和列统计。"
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

        <DiagramBranch label="引用多个">
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
        </DiagramBranch>
      </div>
    </DiagramFrame>
  )
}
