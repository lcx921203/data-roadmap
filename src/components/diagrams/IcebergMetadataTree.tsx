import {
  DiagramArrow,
  DiagramFrame,
  DiagramNode,
} from './DiagramFrame'

export function IcebergMetadataTree() {
  return (
    <DiagramFrame
      title="Iceberg 元数据结构"
      caption="读取路径从 Catalog 的当前 Metadata Pointer 开始，沿 Snapshot、Manifest List、Manifest 最终定位到 Data Files。"
      className="iceberg-metadata-diagram"
    >
      <div className="diagram-stack">
        <DiagramNode
          tone="blue"
          title="Catalog"
          subtitle="保存当前 Metadata Pointer"
        />
        <DiagramArrow label="指向" />

        <DiagramNode
          tone="green"
          title="Table Metadata"
          subtitle="Schema · Partition Spec · Snapshot 列表"
        />
        <DiagramArrow label="当前快照" />

        <DiagramNode
          tone="amber"
          title="Snapshot"
          subtitle="某一时刻的稳定表状态"
        />
        <DiagramArrow label="引用" />

        <DiagramNode
          tone="violet"
          title="Manifest List"
          subtitle="当前 Snapshot 的 Manifest 索引"
        />

        <div
          className="diagram-branch diagram-branch--manifest"
          aria-label="一个 Manifest List 可以引用多个 Manifest"
        >
          <div className="diagram-branch__stem" aria-hidden="true" />
          <div className="diagram-branch__children">
            <div>
              <DiagramNode
                tone="rose"
                title="Manifest A"
                subtitle="文件统计与分区范围"
                compact
              />
              <DiagramArrow />
              <DiagramNode
                tone="cyan"
                title="Data Files"
                subtitle="Parquet / ORC / Avro"
                compact
              />
            </div>

            <div>
              <DiagramNode
                tone="rose"
                title="Manifest B"
                subtitle="文件统计与分区范围"
                compact
              />
              <DiagramArrow />
              <DiagramNode
                tone="cyan"
                title="Data Files"
                subtitle="Parquet / ORC / Avro"
                compact
              />
            </div>
          </div>
          <span className="diagram-branch__more">…</span>
        </div>
      </div>

      <div className="diagram-note">
        <strong>关键关系</strong>
        <p>
          Snapshot 表示版本；Manifest List 管 Manifest；
          Manifest 再管理 Data / Delete File。
        </p>
      </div>
    </DiagramFrame>
  )
}
