import { IcebergManifestTree } from './diagrams/IcebergManifestTree'
import { IcebergMetadataTree } from './diagrams/IcebergMetadataTree'

interface TechnicalDiagramProps {
  id: string
}

export function TechnicalDiagram({ id }: TechnicalDiagramProps) {
  switch (id) {
    case 'iceberg-metadata-tree':
      return <IcebergMetadataTree />
    case 'iceberg-manifest-tree':
      return <IcebergManifestTree />
    default:
      return null
  }
}
