---
theme: oxrse
title: The Subcellular Element Method
layout: cover
highlighter: shiki
drawings:
  persist: false
transition: slide-left
mdc: true
date: "02 July 2026"
---

<style>
.oxrse-cover-group { visibility: hidden; position: relative; }
.oxrse-cover-group::after {
  content: 'Chaste Workshop, Sheffield, 01-03 July 2026';
  visibility: visible;
  position: absolute;
  left: 0;
  white-space: nowrap;
}
.oxrse-cover-email { display: none; }
</style>

<img src="./img/chaste_logo.png" class="absolute bottom-8 right-8" style="height: 3.5rem;" />

---
layout: section
---

# Part 1: SEM Theory

---

# Motivation: Modelling Cell Rheology

- Point-particle models treat cells as featureless spheres
  - Only degree of freedom is centre-of-mass position
  - Cannot capture shape change, internal flows, or cortical mechanics
- **Cell rheology** requires spatially-extended representations:
  - Stiffness, deformability, and viscoelasticity
  - Distinct interior (bulk) and cortical (membrane) mechanics
  - Contact area between cells — not just a point force
- Key question: how do individual node interactions produce macroscopic cell mechanics?
- Solution (Sandersius &amp; Newman 2008): each biological cell = **$N$ interacting subcellular nodes**

---

# SEM: One Cell = One Set of Subcellular Nodes

- Each biological cell is represented by a **SemElement**: an unordered cloud of $N$ nodes
- Two classes of pairwise interaction:
  - **Intra-cellular** — nodes within the same cell (cohesion + volume exclusion)
  - **Inter-cellular** — nodes in different cells (adhesion + volume exclusion)
- Node positions evolve under an **overdamped Langevin** equation
- Cell shape, stiffness and deformability **emerge** from node configuration
- Resolution can be increased by raising $N$ without changing macroscopic parameters
- Node subsets carry regional labels:
  - **Interior nodes** — bulk mechanical properties
  - **Boundary/cortex nodes** — surface tension, cell–cell contact

---

# Equation of Motion: Overdamped Langevin

At low Reynolds number, inertia is negligible — the overdamped limit applies.

For node $\alpha$ in cell $i$:

$$
\eta\,\dot{y}_{\alpha i} \;=\; \xi_{\alpha i}
  \;-\; \nabla_{\!\alpha i}\!\sum_{\beta \ne \alpha} V_\text{intra}(|\,y_{\alpha i} - y_{\beta i}|)
  \;-\; \nabla_{\!\alpha i}\!\sum_{j \ne i}\sum_{\beta_j} V_\text{inter}(|\,y_{\alpha i} - y_{\beta_j}|)
$$

<div class="grid grid-cols-2 gap-4 mt-4 text-sm">
<div>

- $\eta$ — viscous damping constant (drag from cytoplasm)
- $\xi_{\alpha i}$ — stochastic thermal noise force

</div>
<div>

- $V_\text{intra}$ — intra-cellular potential (same SemElement)
- $V_\text{inter}$ — inter-cellular potential (different SemElements)

</div>
</div>

Forward-Euler integration: $\Delta y = (F/\eta)\,\Delta t$

<div class="absolute bottom-4 right-6 text-xs opacity-50 italic">
Sandersius &amp; Newman, Phys. Biol. <b>5</b>, 015002 (2008)
</div>

---
layout: two-cols
---

# The Modified Morse Potential

Pairwise potential between nodes at separation $r$:

$$
V(r) = u_0\,e^{2\rho(1-r^2/r_\text{eq}^2)}
      - 2u_0\,e^{\rho(1-r^2/r_\text{eq}^2)}
$$

- $u_0$ — well depth (energy scale)
- $\rho$ — steepness (repulsive wall + attractive range)
- $r_\text{eq}$ — equilibrium separation ($V$ minimum)
- $V(r_\text{eq}) = -u_0$ (minimum energy)
- Separate $(u_0,\,\rho,\,r_\text{eq})$ for intra and inter pairs

::right::

<img src="./img/morse_plot.svg" class="w-full mt-10 rounded shadow-md" />

---

# Force Vector: Morse Gradient

Force on node $A$ from node $B$ — gradient of $V(r)$. Let $s = r^2/r_\text{eq}^2$:

$$
\mathbf{F}_A \;=\; \frac{4\rho\,u_0}{r_\text{eq}^2}
  \!\left[e^{\rho(1-s)} - e^{2\rho(1-s)}\right]\!
  (\mathbf{r}_B - \mathbf{r}_A)
$$

Sign of the bracket determines direction:

- $s < 1\;\;(r < r_\text{eq})$: bracket $< 0 \;\rightarrow\;$ **repulsive**
- $s > 1\;\;(r > r_\text{eq})$: bracket $> 0 \;\rightarrow\;$ **attractive**
- $s = 1\;\;(r = r_\text{eq})$: force $= 0$ (equilibrium)

Same formula for intra- and inter-cellular pairs; only $u_0$, $\rho$, $r_\text{eq}$ differ.
Force is zero beyond the cut-off distance (box collection excludes distant pairs).

---

# Harmonic Approximation: SemLinearForce

Near equilibrium ($r \approx r_\text{eq}$) the Morse well is approximately parabolic:

$$
V_\text{lin}(r) \approx \tfrac{1}{2}\kappa\,(r - r_\text{eq})^2
\qquad\text{where}\qquad
\kappa = \frac{8\rho^2 u_0}{r_\text{eq}^2}
$$

$$
\mathbf{F}_A = \kappa\!\left(1 - \frac{r_\text{eq}}{r}\right)(\mathbf{r}_B - \mathbf{r}_A)
$$

- Uses the same $(u_0,\,\rho,\,r_\text{eq})$ parameters as `SemForce`
- Cheaper to evaluate; appropriate for small deviations about equilibrium
- Harmonic self-consistency: $8\rho^2 u_0 / r_\text{eq}^2 = \kappa$ (tested in `TestSemParameterScaling`)

---

# Thermal Noise: Stochastic Langevin Forces

Stochastic force added independently to each node at each time step:

$$
\mathbf{F}_\text{noise} = \eta\sqrt{\frac{2D}{\Delta t}}\,\mathbf{z},
\qquad \mathbf{z} \sim \mathcal{N}(\mathbf{0},\,\mathbf{I})
$$

Fluctuation-dissipation theorem — noise correlations balance the damping:

$$
\langle\xi_i(t)\,\xi_j(t')\rangle = 2D\eta^2\,\delta_{ij}\,\delta(t-t')
$$

- $D$ — diffusion constant; $\Delta t$ — time step; $\eta$ — damping constant
- Two implementations in Chaste:
  - **`SemGaussianRandomForce`** — independent $\mathcal{N}(0,1)$ per node per component per step
  - **`SemSpatiallyCorrelatedRandomForce`** — correlated field (`OffLatticeRandomFieldGenerator`) with length scale $L_\text{corr}$
  - Setting $L_\text{corr} = r_\text{eq}$ correlates nearest neighbours

---

# N-Scaling: Resolution vs. Macroscopic Stiffness

Problem: changing $N$ (nodes per cell) shifts all pairwise distances.
Solution: rescale $r_\text{eq}$ and $\kappa$ so that macroscopic stiffness $\kappa_0$ is preserved.

Sandersius &amp; Newman (2008) Section 2 — generalised to dimension $d$:

$$
r_\text{eq}(N) = 2R\!\left(\frac{p}{N}\right)^{\!1/d},
\qquad
\kappa(N) = \kappa_0\,N^{-1/d}\!\left(1 - \lambda N^{-1/d}\right),
\qquad
\eta(N) = \eta_0\,N
$$

- $R$ — cell radius; $p$ — packing density; $d$ — spatial dimension; $\lambda$ — correction (default 0)
- Default packing densities:
  - 2D: $p = \pi/(2\sqrt{3}) \approx 0.907$ (hexagonal close-packing)
  - 3D: $p = \pi/(3\sqrt{2}) \approx 0.741$ (FCC close-packing)
- Total damping $\eta = \eta_0 N$ — N-invariant at the cell level

---

# Regional Structure: Interior vs. Cortex Nodes

Each node carries a `SemNodeRegion` label, set by the mesh generator:
- **`SEM_INTERIOR_REGION` (= 0)** — interior bulk nodes
- **`SEM_BOUNDARY_REGION` (= 1)** — surface / cortex nodes (on any grid face)

`SemRegionalForce` uses region-dependent spring constants and rest lengths:
- $\kappa_\text{eff} = \tfrac{1}{2}(\kappa_A + \kappa_B)$, $\quad L_{0,\text{eff}} = \tfrac{1}{2}(L_A + L_B)$
- Higher cortex $\kappa$ models surface tension; shorter $L_0$ models membrane thickness

```cpp
enum SemNodeRegion : unsigned {
    SEM_INTERIOR_REGION,   // = 0: interior bulk nodes
    SEM_BOUNDARY_REGION    // = 1: cortex / surface nodes
};
// SemRegionalForce defaults:
//   mSpringConstants = {1.0, 2.0}   (interior, boundary)
//   mRestLengths     = {0.2, 0.15}  (interior, boundary)
//   cut-off = 0.5 (hardcoded mesh units)
```

---
layout: section
---

# Part 2: Chaste Implementation

---

# Where SEM Sits: A Spectrum of Cell Models

Models vary in how much sub-cellular detail they resolve:

<div class="flex gap-1 mt-5 text-center">
  <div class="flex-1 rounded-lg py-3 px-1 text-xs font-bold leading-tight" style="background:#c5d5e8;color:#002147;border:1px solid #8bacc8">Cellular<br>Automaton</div>
  <div class="flex-1 rounded-lg py-3 px-1 text-xs font-bold leading-tight" style="background:#a4bcda;color:#002147;border:1px solid #6e9abd">Cellular<br>Potts</div>
  <div class="flex-1 rounded-lg py-3 px-1 text-xs font-bold leading-tight" style="background:#7e9ecb;color:#002147;border:1px solid #5280b0">Centre-<br>based</div>
  <div class="flex-1 rounded-lg py-3 px-1 text-xs font-bold leading-tight" style="background:#5b81bb;color:white;border:1px solid #3a63a9">Node-<br>based</div>
  <div class="flex-1 rounded-lg py-3 px-1 text-xs font-bold leading-tight" style="background:#3a63a9;color:white;border:1px solid #1c4089">Vertex</div>
  <div class="flex-1 rounded-lg py-3 px-1 text-xs font-bold leading-tight" style="background:#1c4089;color:white;border:1px solid #002147">Immersed<br>Boundary</div>
  <div class="flex-1 rounded-lg py-3 px-1 text-xs font-bold leading-tight" style="background:#002147;color:white;border:2px solid #e53e3e">SEM<br><span style="color:#fc8181;font-size:0.65rem">&#9733; this work</span></div>
</div>
<div class="mt-2 text-center text-sm italic opacity-60">
  &larr;&ensp;Increasing biophysical detail&ensp;&rarr;
</div>

<div class="mt-4 grid grid-cols-3 gap-2 text-sm">
<div>

- Each step gains mechanical fidelity at increased computational cost

</div>
<div>

- SEM uniquely captures: cell deformation, cortex/interior distinction, rheology

</div>
<div>

- All of the above are implemented in Chaste

</div>
</div>

---

# Architecture: Chaste SEM Class Hierarchy

| Familiar concept | Chaste class | Base class |
|---|---|---|
| Spatial domain (all nodes) | `SemMesh` | `AbstractMesh` |
| One biological cell | `SemElement` | `AbstractElement` |
| Cell list + mesh + bookkeeping | `SemBasedCellPopulation` | `AbstractOffLatticeCellPopulation` |
| Pairwise interaction law | `SemForce` / `SemLinearForce` / `SemRegionalForce` | `AbstractTwoBodyInteractionForce` |
| Random noise term | `SemGaussianRandomForce` / `SemSpatiallyCorrelatedRandomForce` | `AbstractSemRandomForce` |
| N-scaling utilities | `SemComputeNScaledParameters<DIM>()` | (free function template) |

- Generator utilities: `SemSingleElementMeshGenerator`, `SemMultiElementMeshGenerator`
- VTK writers: `ElementIdNodePointDataWriter`, `NodeRegionPointDataWriter`
- All classes templated on `DIM` (1D, 2D, 3D)

---

# SemMesh: Node Storage and Neighbour Finding

`SemMesh` stores all `Node` and `SemElement` objects for all cells.

A `DistributedBoxCollection` partitions the domain into boxes of size cut-off:
- Only node pairs within the cut-off are evaluated &rarr; $\mathcal{O}(N)$ neighbour finding

Key calls each time step (triggered by `SemBasedCellPopulation::Update()`):
- `UpdateBoxCollection()` &mdash; rehashes node positions into boxes
- `CalculateNodePairs(mNodePairs)` &mdash; fills the interaction pair list

```cpp
// Box collection MUST be set up before constructing the population
const double cutoff = 0.25;
c_vector<double, 4> domain;
domain[0] = -1.0;  domain[1] = 2.0;
domain[2] = -1.0;  domain[3] = 2.0;
p_mesh->SetUpBoxCollection(cutoff, domain);

// 3D: use c_vector<double, 6> with z entries at [4] and [5]
```

---

# SemElement: One Biological Cell

`SemElement` holds a `std::vector<Node<DIM>*>` — its subcellular node set.

Membership is **bidirectional** — critical for force dispatch:
- `SemElement::rGetNodes()` &rarr; node vector
- `Node::rGetContainingElementIndices()` &rarr; which SemElement(s) a node belongs to

Constructor calls `RegisterWithNodes()` — binds each node back to this element.
`MarkAsDeleted()` unregisters from all nodes (safe cell removal).

```cpp
// In SemForce: determine intra vs. inter-cellular
const unsigned elem_a =
    *p_node_a->rGetContainingElementIndices().begin();
const unsigned elem_b =
    *p_node_b->rGetContainingElementIndices().begin();
const bool same_cell = (elem_a == elem_b);
const double u0  = same_cell ? mIntraWellDepth      : mInterWellDepth;
const double rho = same_cell ? mIntraScalingFactor   : mInterScalingFactor;
const double rEq = same_cell ? mIntraEquilibriumDist : mInterEquilibriumDist;
```

---

# Mesh Generators: Single Cell and Multi-Cell Lattice

`SemSingleElementMeshGenerator<DIM>({Nx, Ny, ...}, scaleFactor)`:
- Node spacing = `scaleFactor / Nx` (x-direction pitch)
- Nodes on any grid face &rarr; `SEM_BOUNDARY_REGION`; others &rarr; `SEM_INTERIOR_REGION`

`SemMultiElementMeshGenerator<DIM>({Nx,Ny}, {ex,ey}, scaleFactor)`:
- Tiles $e_x \times e_y$ elements; element pitch = node\_spacing $\times N_x$

```cpp
// Single cell, 2D: 3x3 = 9 nodes, 0.5 unit wide
//   node spacing = 0.5/3 = 0.167
SemSingleElementMeshGenerator<2> gen1({3, 3}, 0.5);
auto p_mesh1 = gen1.GetMesh();

// 2x1 lattice of cells, each 3x3 nodes
SemMultiElementMeshGenerator<2> gen2({3,3}, {2,1}, 0.5);
auto p_mesh2 = gen2.GetMesh();  // 2 elements, 18 nodes

// 3D single cell: 3x3x3 = 27 nodes
SemSingleElementMeshGenerator<3> gen3({3,3,3}, 0.5);
auto p_mesh3 = gen3.GetMesh();
```

---

# SemBasedCellPopulation: Cell List + Mesh

**Invariant**: exactly one live `CellPtr` per non-deleted `SemElement`.
`NoCellCycleModel` is used — SEM cells do not divide.

`Update()` per time step (called by `OffLatticeSimulation`):
1. Clear `mNodePairs`
2. `UpdateBoxCollection()` — refresh box occupancy
3. `CalculateNodePairs()` — find all potentially-interacting node pairs

`GetDampingConstant()` averages $\eta$ over all live elements containing the node
(handles nodes shared between two cells at element boundaries).

```cpp
SemBasedCellPopulation<2> cell_pop(*p_mesh, cells);
cell_pop.SetDampingConstantNormal(1.0);   // sets η

// Attach per-node VTK data writers:
cell_pop.AddNodePointDataWriter<ElementIdNodePointDataWriter>();
cell_pop.AddNodePointDataWriter<NodeRegionPointDataWriter>();
```

---

# Force Classes: Deterministic and Stochastic

**Deterministic** (`AbstractTwoBodyInteractionForce`):
- `SemForce` — full modified Morse potential
- `SemLinearForce` — harmonic approximation; same parameter interface
- `SemRegionalForce` — region-dependent $\kappa$ and $r_\text{eq}$; cut-off hardcoded to 0.5

**Stochastic** (`AbstractSemRandomForce`):
- `SemGaussianRandomForce` — independent $\mathcal{N}(0,1)$ per node per step
- `SemSpatiallyCorrelatedRandomForce` — correlated field (`OffLatticeRandomFieldGenerator`)

```cpp
// Gaussian (uncorrelated) noise:
MAKE_PTR(SemGaussianRandomForce<2>, p_noise);
p_noise->SetDiffusionConstant(1e-6);
simulator.AddForce(p_noise);

// Spatially correlated noise:
MAKE_PTR(SemSpatiallyCorrelatedRandomForce<2>, p_corr);
p_corr->SetDiffusionConstant(1e-5);
p_corr->SetCorrelationLength(r_eq);         // corr. length = r_eq
p_corr->SetLowerCorner({{-1.0, -1.0}});
p_corr->SetUpperCorner({{ 2.0,  2.0}});
simulator.AddForce(p_corr);
```

---

# Simulation Setup: 6-Step Recipe

```cpp
// 1. Create mesh: 3x3 nodes, 0.5 unit cell width (node spacing = 0.167)
SemSingleElementMeshGenerator<2> gen({3,3}, 0.5);
auto p_mesh = gen.GetMesh();

// 2. Box collection (MUST precede population construction)
p_mesh->SetUpBoxCollection(0.25, {-1.0, 2.0, -1.0, 2.0});

// 3. Cells — NoCellCycleModel for SEM (no division)
std::vector<CellPtr> cells;
CellsGenerator<NoCellCycleModel, 2> cgen;
cgen.GenerateBasicRandom(cells, p_mesh->GetNumElements());

// 4. Population + damping constant η
SemBasedCellPopulation<2> pop(*p_mesh, cells);
pop.SetDampingConstantNormal(1.0);

// 5. Simulator — MANDATORY: ForwardEuler, UseUpdateNodeLocation=false
OffLatticeSimulation<2> sim(pop);
sim.SetDt(0.01);  sim.SetEndTime(1.0);
sim.SetNumericalMethod(boost::make_shared<ForwardEulerNumericalMethod<2>>());
sim.GetNumericalMethod()->SetUseUpdateNodeLocation(false);
MAKE_PTR(SemForce<2>, p_f);
p_f->ApplyNScaledIntraParameters(9, 0.25, 20.0, 0.0, 1.0);
p_f->SetIntraCutOffDistance(0.25);
sim.AddForce(p_f);

// 6. Run
sim.Solve();
```

---

# N-Scaling in Practice: SemComputeNScaledParameters

`SemComputeNScaledParameters<DIM>(N, R, κ₀, ρ, λ, η₀, p)` returns a struct:
- `EquilibriumDistance` $= r_\text{eq} = 2R(p/N)^{1/d}$
- `SpringConstant` $= \kappa = \kappa_0 N^{-1/d}(1-\lambda N^{-1/d})$
- `WellDepth` $= u_0 = \kappa r_\text{eq}^2 / (8\rho^2)$
- `DampingConstant` $= \eta = \eta_0 N$

Setting `packing=1.0` with `R=scaleFactor/2` gives $r_\text{eq}$ equal to the inter-node spacing exactly.

```cpp
const SemNScaledParameters p =
    SemComputeNScaledParameters<3>(
        num_nodes,            // N
        0.25,                 // R_cell
        20.0,                 // κ₀ (macroscopic spring constant)
        5.0,                  // ρ  (must match force's rho)
        0.0,                  // λ  (correction, default 0)
        1.0 / num_nodes,      // η₀ → total η = 1 (N-invariant)
        1.0);                 // packing density (cubic grid)

MAKE_PTR(SemForce<3>, p_force);
p_force->SetIntraScalingFactor(5.0);   // must match ρ above
p_force->ApplyNScaledIntraParameters(num_nodes, 0.25, 20.0);
pop.SetDampingConstantNormal(p.DampingConstant);
```

---

# Output: VTK Files and ParaView Visualisation

Output written to `$CHASTE_TEST_OUTPUT/<dir>/results_from_time_0/`

- `results.pvd` — master file listing all time steps (entry point for ParaView)
- `results_<N>.vtu` — node positions and point data at each sampled step

Per-node point data arrays (enabled via population writers):

| Writer class | Array name | Values |
|---|---|---|
| `ElementIdNodePointDataWriter` | `element_id` | integer cell index per node |
| `NodeRegionPointDataWriter` | `node_region` | 0 = interior, 1 = cortex |

**ParaView workflow:**
1. File &rarr; Open &rarr; `results.pvd`
2. Filters &rarr; Glyph &rarr; Sphere representation
3. Colour by `element_id` to distinguish cells; by `node_region` for cortex structure

3D surface reconstruction: `SetOutputElementSurfacesToVtk(true)` on `SemBasedCellPopulation` (requires VTK — uses alpha-shape Delaunay triangulation)

---

# Current Status and Known Limitations

**Tests passing:**
- `TestSemBasedCellPopulation` — construction, validation, damping, serialisation
- `TestSemBasedSimulation` — 2D/3D single and multi-cell runs, noise forces, checkpointing
- `TestSemParameterScaling` — N-scaling formulas verified against hand-calculated values
- Tutorial — end-to-end single-cell and multi-cell 2D simulations with VTK output

**Current limitations:**
- No cell division: `AddCell()` throws — `SemElement` splitting not yet implemented
- VTK required for 2D/3D surface output (`GetVolumeOfElement`, surface visualisation)
- `SemRegionalForce` cut-off hardcoded to 0.5 mesh units
- `SemMesh::ConstructFromMeshReader` reads only `DIM+1` nodes per element (known bug)

**Planned extensions:**
- SEM element division via node-set splitting
- Parallel box collection for large multi-cell simulations
- Fix mesh round-trip reader/writer for full serialisation support
