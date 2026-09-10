# V0.6.0.8.1 Diagram Hotfix

Deploy V0.6.0.8 failed during `validate:content` because the diagram package
accidentally overlaid an older Iceberg overview body and reintroduced internal
editorial copy (`Project Fact Check` / `当前 DataRoadmap`).

This hotfix:

- keeps `diagram-iceberg-metadata-tree`;
- restores the cleaned `Iceberg 的完整链路` section;
- removes the internal project editorial section from the visible Knowledge body;
- does not change the Technical Diagram components or Design System V1.4.
