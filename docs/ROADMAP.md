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

### V0.8.3 Spark Memory & Structured Streaming
- [x] 09 Memory / Cache-Persist / Serialization / Spill / OOM
- [x] 10 Structured Streaming Execution Model
- [x] 11 State / Event Time / Watermark / Checkpoint / Exactly-once
- [x] Connect skew / partition size to task working-set memory
- [x] Separate execution memory from storage / cache memory
- [x] Treat spill as a cost-bearing fallback, not free memory
- [x] Keep micro-batch as the default Structured Streaming execution model
- [x] Separate Real-Time Mode from Continuous Processing
- [x] Separate checkpointing from end-to-end exactly-once guarantees
- [x] Connect watermark to late-data and state-retention trade-offs

### V0.8.4 Spark Production Closure
- [x] 12 Failure / Observability / Backfill / Capacity
- [x] Job -> Stage -> Task first troubleshooting model
- [x] Separate balanced shuffle pressure from data skew
- [x] Separate transient retry from deterministic failure
- [x] Keep speculation as straggler mitigation, not skew repair
- [x] Add batch backfill pressure and saturation capacity model
- [x] Add streaming backlog / state production diagnosis model
- [x] Spark UI -> Event Log / History -> Metrics observability layers
- [x] Knowledge progression audit
- [x] Technical correctness audit
- [x] Freeze Spark Learn V1 at 12 / 12

### V0.8.5 Spark Scale & Interview Integration
- [x] Create 3 hypothetical Spark Scale scenarios
- [x] Add Compute Engines as the second Scale domain
- [x] Add Backfill & Capacity training scenario
- [x] Add Skew / Join runtime-pressure training scenario
- [x] Add Structured Streaming state / backlog reliability scenario
- [x] Map existing evidence-backed Spark Interview questions
- [x] Add direct Interview -> Spark Knowledge mappings
- [x] Add contextual Learn / Scale / Interview section relations
- [x] Preserve every Interview question's existing evidence strength
- [x] Do not invent Spark-specific frequency
- [x] Keep scenarios hypothetical and separate from project facts

### V0.8.6 Spark Vertical Slice Freeze
- [x] Three-tab closure audit
- [x] First real multi-domain Scale implementation audit
- [x] 390px layout / touch-target / safe-area audit
- [x] Validate all Spark contextual relation anchors resolve
- [x] Truth-boundary / evidence / project-boundary audit
- [x] Keep frozen V1.9 UI unchanged
- [x] Freeze Spark V1

## V0.9 Fourth Vertical Slice — dbt

### V0.9.0 dbt Knowledge Spine Freeze
- [x] Keep dbt in Stage 05 / L5 Core
- [x] Freeze a 12-node causal knowledge spine
- [x] Freeze responsibilities, prerequisites and handoffs
- [x] Freeze explicit must-not-cover boundaries
- [x] Freeze dbt / Dimensional Modeling / Semantic Layer / Dagster / DataHub boundaries
- [x] Use dbt Core v1.12.2 as the stable production baseline
- [x] Track dbt Core v2.0 beta as version-sensitive next-generation context
- [x] Register only existing evidence-backed Interview seeds
- [x] Explicitly record that no dbt-specific verified Interview question exists yet
- [x] Keep UI unchanged
- [x] Keep all dbt article bodies unwritten

### V0.9.1 dbt Project & DAG
- [x] 01 dbt Overview & Transformation Mental Model
- [x] 02 Project / Target / Adapter / Command Lifecycle
- [x] 03 Sources / Models / ref / source / Dependency Graph
- [x] 04 Jinja / Macros / Packages / Adapter Abstraction
- [x] Separate dbt resource DAG from database physical execution plan
- [x] Separate Project / Target / Adapter responsibilities
- [x] Treat ref() / source() as dependency declarations, not string helpers
- [x] Treat Jinja / Macros as compile-time SQL generation
- [x] Preserve Dimensional Modeling / Semantic Layer / Dagster boundaries

### V0.9.2 dbt Materialization & Stateful Modeling
- [x] 05 Materializations & Physical Persistence
- [x] 06 Incremental Models / Unique Key / Strategies / Backfill
- [x] 07 Snapshots / Source History / SCD2 Implementation
- [x] Cover all 5 current built-in materializations
- [x] Separate model logic from persistence strategy
- [x] Separate incremental current-state maintenance from source-history snapshots
- [x] Treat unique_key as incremental matching semantics, not a database constraint
- [x] Treat microbatch as bounded incremental SQL batches, not a streaming runtime
- [x] Connect late-arriving data to lookback / drift / backfill trade-offs
- [x] Use current snapshot timestamp / check / hard_deletes semantics
- [x] Preserve Stage 03 SCD theory ownership

### V0.9.3 dbt Quality, Contracts & Metadata
- [x] 08 Data Tests / Unit Tests / Freshness / Reconciliation
- [x] 09 Model Contracts / Versions / Change Safety
- [x] 10 Docs / Artifacts / Lineage / Metadata Integration
- [x] Separate Data Test from Unit Test
- [x] Separate Source Freshness from dbt build
- [x] Treat Reconciliation as a business validation pattern, not a built-in test type
- [x] Separate Contract shape guarantees from row-level Data Tests
- [x] Keep platform constraint enforcement adapter-sensitive
- [x] Use Model Versions only for intentional breaking-change migration
- [x] Separate Project Graph / Runtime / Catalog artifact responsibilities
- [x] Keep Artifact schemas version-sensitive
- [x] Preserve DataHub enterprise-governance ownership

### V0.9.4 dbt CI & Production Closure
- [x] 11 Selection / State / Defer / CI
- [x] 12 Production Troubleshooting / Cost / Orchestration Boundary
- [x] Separate node selection from graph expansion
- [x] Teach classic Artifact-based state separately from managed dbt State Preview
- [x] Freeze state:modified as Manifest comparison, not Git-diff shorthand
- [x] Freeze defer as ref-resolution fallback, not data copy
- [x] Preserve idempotence as a State / Defer prerequisite
- [x] Separate Parse / Compile / Database Execute / Materialization / Incremental failure domains
- [x] Treat Full Refresh as a production change, not a generic retry
- [x] Tie dbt concurrency to target-platform capacity
- [x] Preserve dbt Core / dbt Platform / Dagster orchestration boundaries
- [x] Knowledge progression audit
- [x] Technical correctness audit
- [x] Freeze dbt Learn V1 at 12 / 12

### V0.9.5 dbt Scale & Interview Integration
- [x] Create 3 hypothetical dbt Scale scenarios
- [x] Add Modeling Engineering as the third Scale domain
- [x] Add Incremental Drift / Late Data / Backfill scenario
- [x] Add Contract / Model Version / Breaking Change migration scenario
- [x] Add State / Defer / Slim CI cost scenario
- [x] Map only existing evidence-backed Interview questions
- [x] Add direct Interview -> dbt Knowledge mappings
- [x] Add contextual Learn / Scale / Interview section relations
- [x] Preserve every Interview question's existing evidence strength
- [x] Explicitly keep no dbt-specific verified frequency claim
- [x] Keep every Scale scenario hypothetical and separate from project facts

### V0.9.6 dbt Vertical Slice Freeze
- [x] Deployed-main integrity audit
- [x] Three-tab closure audit
- [x] Third Scale domain / Modeling Engineering implementation audit
- [x] 390px static layout / filter / safe-area audit
- [x] Validate all 14 dbt contextual relation anchors
- [x] Truth-boundary / evidence / project-boundary audit
- [x] Keep frozen V1.9 UI unchanged
- [x] Freeze dbt V1

## V0.9.7 UI Theme — Light / Dark

### V0.9.7 Light / Dark Theme
- [x] Keep the frozen Light palette unchanged
- [x] Add a warm dark-reading semantic token palette
- [x] Default to system Light / Dark preference on first visit
- [x] Add pre-hydration theme resolution to avoid a bright startup flash
- [x] Add a 44px Sun / Moon toggle to the shared TopBar
- [x] Persist an explicit user Light / Dark override in localStorage
- [x] Continue following system theme while no manual override exists
- [x] Update mobile browser theme-color with the active theme
- [x] Adapt status colors and technical-diagram color families for dark reading
- [x] Correct legacy literal-light selected-control colors in dark mode
- [x] Keep Learn / Interview / Scale layout and navigation unchanged
- [x] Keep Design Contract V1.9 structure unchanged

## V1.0 Fifth Vertical Slice — MetricFlow / Semantic Layer

### V1.0.0 MetricFlow Knowledge Spine Freeze
- [x] Keep MetricFlow / Semantic Layer in Stage 06 / L5 Core
- [x] Validate against current dbt v1.12+ Semantic Layer / MetricFlow specification
- [x] Freeze a 12-node causal Learn spine before writing article bodies
- [x] Correct old Measure-first taxonomy: Measures are deprecated; current spec uses Simple Metrics
- [x] Freeze dbt Model / Semantic Model / Entity / Dimension / Metric boundaries
- [x] Freeze Semantic Graph vs dbt DAG responsibility boundary
- [x] Freeze Entity-based Join / Fan-out / Chasm / Multi-hop boundaries
- [x] Freeze Time Spine / Cumulative / Conversion progression
- [x] Freeze Metric Query / Validation / Saved Query / Serving handoffs
- [x] Preserve dbt / Dimensional Modeling / DataHub / Serving / Agent boundaries
- [x] Add explicit Trino support guardrail; do not infer platform support
- [x] Register only existing evidence-backed Interview seeds
- [x] Explicitly record that no verified MetricFlow-specific Interview question exists yet
- [x] Reuse the frozen Learn / Interview / Scale + Light / Dark UI contract
- [x] Keep all MetricFlow article bodies unwritten
- [x] Keep UI unchanged

### V1.0.1 MetricFlow Semantic Foundation
- [x] 01 Semantic Layer & MetricFlow Mental Model
- [x] 02 dbt Model -> Semantic Model & Current Spec
- [x] 03 Entities / Semantic Grain / Join Keys
- [x] 04 Dimensions / Time Dimensions / Aggregation Time
- [x] Separate dbt DAG from MetricFlow Semantic Graph
- [x] Use current v1.12+ embedded Semantic Model specification
- [x] Treat Entity type as semantic join metadata, not database constraint
- [x] Connect Semantic Grain -> Entity correctness -> Join correctness
- [x] Separate Categorical vs Time Dimension semantics
- [x] Freeze agg_time_dimension as default Metric Time responsibility
- [x] Keep Time Spine out of the foundation layer
- [x] Keep Simple Metric body for V1.0.2
- [x] Enhance Continue Learning border-flow visibility
- [x] Make Dark-mode flow stronger than Light without outer glow / shadow
- [x] Preserve Reduced Motion behavior

### V1.0.2 MetricFlow Metrics & Semantic Graph
- [x] 05 Simple Metrics / Aggregation / Additivity
- [x] 06 Semantic Graph / Join Logic / Fan-out Safety
- [x] 07 Ratio / Derived Metrics
- [x] 08 Time Spine / Cumulative Metrics
- [x] 09 Conversion Metrics
- [x] Use Simple Metric as the current primitive aggregation object
- [x] Keep deprecated Measure syntax as migration context only
- [x] Connect Grain -> Aggregation -> Additivity correctness
- [x] Treat Entity Type as semantic cardinality metadata for safe joins
- [x] Explain Fan-out and Chasm as correctness failures, not SQL syntax failures
- [x] Keep current two-hop multi-hop limit explicitly version-sensitive
- [x] Separate semantic join path from physical join algorithm
- [x] Teach Ratio as aggregation-aligned numerator / denominator composition
- [x] Teach Derived as metric-level expressions with filter / alias / offset
- [x] Freeze Time Dimension vs Time Spine distinction
- [x] Freeze Window vs Grain-to-date distinction
- [x] Teach Conversion as pre-aggregation Entity-Time matching, not ordinary Ratio
- [x] Keep UI / Dark Theme frozen after V1.0.1.2

### V1.0.3 MetricFlow Query & Consumption
- [x] 10 Metric Query Generation / Commands / Validation
- [x] 11 Saved Queries / Exports / Cache / Consumption
- [x] Freeze Metric -> Group By -> Filter -> Semantic Graph -> Generated SQL query path
- [x] Separate dbt sl from local mf command entry points
- [x] Treat exact command / flag availability as environment- and version-sensitive
- [x] Freeze Parsing -> Semantic -> Data Platform validation mental model
- [x] Separate semantic validation from business reconciliation
- [x] Use Generated SQL / Dataflow Plan as a primary debugging surface
- [x] Freeze common-dimension intersection for multi-metric queries
- [x] Treat Saved Query as a reusable semantic-query resource, not stored SQL
- [x] Separate Saved Query from Export
- [x] Separate Result Cache from Declarative Cache
- [x] Keep declarative cache behavior explicitly dbt Platform / version-sensitive
- [x] Freeze BI / App / Agent as consumers of the governed semantic query surface
- [x] Keep Agent Planner / Router / Executor in Stage 10
- [x] Keep physical Serving architecture in Stage 09
- [x] Keep green Light / Dark palette frozen

### V1.0.4 MetricFlow Production Closure
- [x] 12 Production Quality / Reconciliation / Semantic Operations
- [x] Freeze upstream dbt -> semantic definition -> join -> time -> SQL -> engine -> cache/export -> consumer -> reconciliation troubleshooting chain
- [x] Separate data error from semantic-definition error
- [x] Separate semantic complexity from target-engine runtime pressure
- [x] Separate Validation from business Reconciliation
- [x] Treat Metric Time as part of the business contract
- [x] Use Generated SQL / Dataflow Plan as the semantic/runtime boundary
- [x] Separate Result Cache / Declarative Cache / Export freshness concerns
- [x] Record current declarative-cache security-context caveat as platform/version-sensitive
- [x] Preserve MetricFlow / DataHub governance boundary
- [x] Preserve MetricFlow / Stage 09 serving boundary
- [x] Preserve MetricFlow / Stage 10 Agent runtime boundary
- [x] Keep current platform-support matrix version-sensitive; do not infer Trino support
- [x] Knowledge progression audit
- [x] Technical correctness audit
- [x] Freeze MetricFlow Learn V1 at 12 / 12
- [x] Keep UI / green Light-Dark palette frozen

### Next: V1.0.5 MetricFlow Scale & Interview Integration
- [ ] Add only justified hypothetical Semantic Layer Scale scenarios
- [ ] Map only existing evidence-backed Interview questions
- [ ] Do not invent MetricFlow-specific frequency
- [ ] Add contextual cross-tab relations

### V1.0.6 MetricFlow Vertical Slice Freeze
- [ ] Three-tab closure audit
- [ ] Light / Dark reading audit for Semantic Layer content
- [ ] Truth / evidence / platform-support audit
- [ ] Freeze MetricFlow V1

### Deferred vertical
- [ ] Flink — resume after MetricFlow unless priorities change

### Product Rule
- [x] Keep Iceberg frozen unless a verified bug is found
- [x] Keep Trino frozen unless a verified bug is found
- [x] Keep Spark frozen unless a verified bug is found
- [x] Keep dbt frozen unless a verified bug is found
- [x] Reuse frozen Learn / Interview / Scale UI contract
- [x] Do not force every technology into the same node count
