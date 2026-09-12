# Interview Follow-up Search Repair V1.0.9.1

V1.0.9 was successfully applied and deployed.

Root cause: Interview search indexed only the canonical question plus discovery search terms. Curated Follow-up question text was not searchable.

Repair:
- index curated follow-up question text;
- keep canonical evidence/frequency ownership unchanged;
- show `命中追问 · ...` beneath the canonical parent row when a follow-up caused the match;
- reuse the existing question-row footer, with no new visual system.

Expected examples after deployment:
- `Time Travel`
- `Schema Evolution`
- `Manifest`
- `小文件`

These queries should now discover the Lakehouse parent question and show the matched Iceberg follow-up beneath it.
