import {
  DiagramArrow,
  DiagramBranch,
  DiagramFrame,
  DiagramNode,
} from './DiagramFrame'

export function IcebergMetadataTree() {
  return (
    <DiagramFrame
      title="Iceberg 元数据结构"
      caption="Snapshot 表示版本；Manifest List 引用多个 Manifest；Manifest 再记录 Data / Delete Files。"
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

        <DiagramBranch
          label="引用多个"
          className="diagram-branch--manifest"
        >
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
        </DiagramBranch>

        <span className="diagram-branch__more">…</span>
      </div>
    </DiagramFrame>
  )
}
