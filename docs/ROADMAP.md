# Build Roadmap

## V0.1 Foundation
- [x] Product boundary
- [x] Initial content asset model
- [x] Templates
- [x] Design reset

## V0.2 Content Taxonomy
- [x] Top-level learning map
- [x] L1-L5 depth model
- [x] Scale Lab families

## V0.3 Interview Evidence Model
- [x] Evidence / canonical / frequency model
- [x] Interview Answer V1
- [x] First 30 Interview Bank scope
- [x] Close V0.3 model milestone

### Continuing content pipeline
- [ ] Curate remaining selected answers
- [ ] Continue independent evidence intake

## V0.4 Design System
- [x] Design Foundation
- [x] Mobile Product Prototypes
- [x] Component Freeze
- [x] Design System V1 Frozen
- [x] Close V0.4 milestone

## V0.5 Web Foundation
- [x] React + TypeScript + Vite
- [x] GitHub Pages
- [x] Deep links
- [x] Markdown Front Matter
- [x] Evidence Bottom Sheet
- [x] Reading Segment
- [x] Code Collapse
- [x] Detail-page Foundation
- [x] Close V0.5 milestone

## V0.6 First Vertical Slice — Iceberg

### V0.6.0 - V0.6.6 Iceberg Content Loop
- [x] Iceberg Learn V1
- [x] Scale V1
- [x] Interview integration
- [x] Three-tab cross navigation
- [x] Vertical-slice content audit
- [x] Freeze Iceberg V1 content loop

### V0.6.7 UI Review & Polish
- [x] Reading Directory
- [x] One-hand reading interaction
- [x] Contextual relations
- [x] Scale hierarchy correction
- [x] UI conformance
- [x] Freeze Iceberg V1 UI

## V0.7 Second Vertical Slice — Trino

### V0.7.0 Trino Knowledge Spine Freeze
- [x] Keep Trino in Stage 04 / L5 Core
- [x] Freeze 11-node causal knowledge spine
- [x] Freeze responsibilities for every node
- [x] Freeze prerequisites and handoffs
- [x] Freeze explicit must-not-cover boundaries
- [x] Freeze Iceberg / Trino responsibility boundary
- [x] Register current evidence-backed Interview seeds
- [x] Keep UI unchanged
- [x] Keep all article bodies unwritten

### V0.7.1 Trino Core Execution Model
- [x] 01 Trino Overview & System Mental Model
- [x] 02 Coordinator / Worker & Query Lifecycle
- [x] 03 Catalog / Connector / SPI Boundary
- [x] 04 SQL to Logical / Distributed Plan
- [x] 05 Stage / Task / Split / Driver / Operator
- [x] Preserve Iceberg / Trino content boundary
- [x] Keep Join / Memory / Concurrency / FTE out of the early layers
- [x] Use Stage 04 orders 12-16 without changing UI sorting

### V0.7.2 Trino Scan & Optimizer
- [x] 06 Scan / Pushdown / Iceberg Read Boundary
- [x] 07 Statistics / CBO / Join / Dynamic Filtering
- [x] Separate Pruning from Pushdown
- [x] Preserve Iceberg metadata ownership
- [x] Explain Connector-specific pushdown boundary
- [x] Freeze Statistics -> CBO -> Join -> Dynamic Filtering causal chain

### V0.7.3 Trino Runtime Pressure & Reliability
- [x] 08 Memory / Exchange / Large Query Pressure
- [x] 09 Concurrency / Queue / Resource Groups
- [x] 10 Fault-Tolerant Execution & Recovery
- [x] Connect Join Plan decisions to runtime Memory / Network pressure
- [x] Separate Capacity pressure from Data Skew
- [x] Treat Spill as legacy memory-pressure mechanism
- [x] Separate Resource Group scheduling from Query memory limits
- [x] Separate Spill from FTE Exchange Spooling
- [x] Freeze NONE / QUERY / TASK recovery mental model

### V0.7.4 Trino Production Closure
- [x] 11 Observability / Troubleshooting / Capacity
- [x] Query-state-first troubleshooting model
- [x] Query / Cluster / Long-term observability layers
- [x] SLO -> workload -> profile -> concurrency -> saturation capacity model
- [x] Knowledge progression audit
- [x] Technical correctness audit
- [x] Freeze Trino Learn V1 at 11 / 11

### V0.7.5 Trino Scale & Interview Integration
- [x] Create 3 hypothetical Trino Scale scenarios
- [x] Add Scale Domain -> Theme -> Scenario navigation entries
- [x] Connect existing evidence-backed Interview questions through scenario ownership
- [x] Add contextual Learn / Scale / Interview section relations
- [x] Preserve every Interview question's existing evidence strength
- [x] Do not claim Trino-specific frequency
- [x] Keep Interview answers pending where no curated answer exists

### V0.7.6 Trino Vertical Slice Freeze
- [x] Three-tab closure audit
- [x] Add direct Interview -> Knowledge Trino mappings
- [x] Generalize Interview / Knowledge registry from Iceberg-only to multi-topic
- [x] Preserve scenario-owned Scale relations
- [x] 390px shared-reading implementation audit
- [x] One-hand directory / safe-area contract audit
- [x] Truth-boundary and evidence audit
- [x] Freeze Trino V1

## V0.8 Third Vertical Slice — Spark

### V0.8.0 Spark Knowledge Spine Freeze
- [x] Select Spark as the third vertical slice
- [x] Keep Spark in Stage 02 / L5 Core
- [x] Freeze a 12-node causal knowledge spine
- [x] Freeze responsibilities, prerequisites and handoffs
- [x] Freeze explicit must-not-cover boundaries
- [x] Freeze Spark / Iceberg / Trino / Flink content boundaries
- [x] Register current evidence-backed Spark Interview seeds
- [x] Validate against current Spark 4.2.0 documentation
- [x] Keep UI unchanged
- [x] Keep all Spark article bodies unwritten

### V0.8.1 Spark Core Execution Model
- [x] 01 Spark Overview & System Mental Model
- [x] 02 Driver / Executor / Cluster Manager & Application Lifecycle
- [x] 03 DataFrame / Dataset / Lazy Evaluation & DAG
- [x] 04 Job / Stage / Task / Narrow-Wide Dependency / Shuffle
- [x] 05 Partition / Parallelism / Repartition / Coalesce
- [x] Keep Catalyst / AQE out of the core runtime layer
- [x] Distinguish Spark Partition from table partition
- [x] Distinguish Task Count from actual concurrent tasks
- [x] Preserve Spark / Iceberg write-side boundary

### V0.8.2 Spark SQL & Adaptive Execution
- [x] 06 Spark SQL / Catalyst / Physical Planning
- [x] 07 Join Strategy / Statistics / AQE
- [x] 08 Data Skew / Shuffle Pressure / Stragglers
- [x] Separate logical optimization from physical planning
- [x] Connect statistics directly to join strategy decisions
- [x] Treat AQE as runtime re-optimization, not a magic tuning switch
- [x] Separate overall shuffle pressure from true data skew
- [x] Treat salting as a targeted hot-key technique, not a default answer
- [x] Preserve memory internals for V0.8.3

### Next: V0.8.3 Spark Memory & Structured Streaming
- [ ] 09 Memory / Cache-Persist / Serialization / Spill / OOM
- [ ] 10 Structured Streaming Execution Model
- [ ] 11 State / Event Time / Watermark / Checkpoint / Exactly-once

### V0.8.4 Spark Production Closure
- [ ] 12 Failure / Observability / Backfill / Capacity
- [ ] Knowledge progression audit
- [ ] Technical correctness audit

### V0.8.5 Spark Scale & Interview Integration
- [ ] Create only justified hypothetical Spark Scale scenarios
- [ ] Map existing evidence-backed Spark Interview questions
- [ ] Do not invent Spark-specific frequency
- [ ] Add contextual cross-tab relations

### V0.8.6 Spark Vertical Slice Freeze
- [ ] Three-tab closure audit
- [ ] Mobile reading audit
- [ ] Freeze Spark V1

### Product Rule
- [x] Keep Iceberg frozen unless a verified bug is found
- [x] Keep Trino frozen unless a verified bug is found
- [x] Reuse frozen Learn / Interview / Scale UI contract
- [x] Do not force every technology into the same node count
