---
theme: oxrse
title: Anatomy of a Chaste Program
layout: cover
highlighter: shiki
drawings:
  persist: false
transition: slide-left
mdc: true
date: "Chaste Workshop, Sheffield, 01-03 July 2026"
email: ""
---

<style>
/* The cover layout renders these, so use :global to escape per-slide scoping. */
:global(.oxrse-cover-group) {
  visibility: hidden;
  position: relative;
}
:global(.oxrse-cover-group)::after {
  content: 'Fergus Cooper';
  visibility: visible;
  position: absolute;
  left: 0;
  white-space: nowrap;
}
:global(.oxrse-cover-email) { display: none; }
</style>

<img src="./img/chaste_logo.png" class="absolute bottom-8 right-8" style="height: 6.5rem;" />

---

# What is Chaste?

**C**ancer, **H**eart **a**nd **S**oft **T**issue **E**nvironment

- An open-source C++ library for **simulating biological tissue and organs**
- Built originally in Oxford, now distributed: Sheffield, Nottingham and further afield
- Used for cardiac electrophysiology, cell-based tissue modelling, lung, and more
- Today we focus on the **cell-based** part: tissue as a population of interacting cells

There are two ways to drive it:

- **C++**: write a test, compile it, and run it. Maximum performance and full API access.
- **PyChaste**: the same engine exposed to Python, with scripting, notebooks, and inline visualisation.

> The goal today is to understand the *shape* of a Chaste program: the handful of objects every
> simulation is built from.

---
layout: section
---

<div class="text-center">
  <div class="text-8xl font-bold" style="color:#002147">Part 1</div>
  <div class="text-3xl mt-6 opacity-70">The Conceptual Picture</div>
</div>

---

# A Cell-Based Model Is Made of Five Components

Whatever the biology, a Chaste cell-based simulation uses five ingredients:

<div class="grid grid-cols-1 gap-1 mt-4 text-sm">
<div><b>1. Space.</b> &nbsp; Where do cells live? &nbsp;→&nbsp; a <b>Mesh</b></div>
<div><b>2. Cells.</b> &nbsp; What is each cell, and how does it grow and divide? &nbsp;→&nbsp; a list of <b>Cells</b> with cell-cycle models</div>
<div><b>3. Tissue.</b> &nbsp; How are cells tied to space? &nbsp;→&nbsp; a <b>CellPopulation</b></div>
<div><b>4. Rules.</b> &nbsp; What physics and biology act on them? &nbsp;→&nbsp; <b>Forces</b>, boundary conditions, killers, modifiers</div>
<div><b>5. Time.</b> &nbsp; How do we step it forward and record it? &nbsp;→&nbsp; a <b>Simulation</b> and output writers</div>
</div>

<div class="mt-6 p-3 rounded" style="background:#eef3fa;border:1px solid #c5d5e8">
Every tutorial has various combinations these five objects, assembled in this order, and then
<code>Solve()</code>.
</div>

---

# The Pipeline

<div class="flex items-stretch gap-2 mt-8 text-center text-sm font-bold">
  <div class="flex-1 rounded-lg py-4 px-1" style="background:#c5d5e8;color:#002147;border:1px solid #8bacc8">Mesh<br><span class="font-normal opacity-70 text-xs">geometry</span></div>
  <div class="self-center text-2xl opacity-40">→</div>
  <div class="flex-1 rounded-lg py-4 px-1" style="background:#a4bcda;color:#002147;border:1px solid #6e9abd">Cells<br><span class="font-normal opacity-70 text-xs">+ cycle models</span></div>
  <div class="self-center text-2xl opacity-40">→</div>
  <div class="flex-1 rounded-lg py-4 px-1" style="background:#7e9ecb;color:white;border:1px solid #5280b0">Cell&nbsp;Population<br><span class="font-normal opacity-80 text-xs">cells ⊕ mesh</span></div>
  <div class="self-center text-2xl opacity-40">→</div>
  <div class="flex-1 rounded-lg py-4 px-1" style="background:#3a63a9;color:white;border:1px solid #1c4089">Simulation<br><span class="font-normal opacity-80 text-xs">+ forces, BCs</span></div>
  <div class="self-center text-2xl opacity-40">→</div>
  <div class="flex-1 rounded-lg py-4 px-1" style="background:#002147;color:white;border:1px solid #002147">Solve()<br><span class="font-normal opacity-80 text-xs">→ VTK output</span></div>
</div>

<div class="mt-12 text-center text-base" style="color:#002147">
Build these five objects in order, then call <code>Solve()</code>. That is, essentially, every cell-based.
</div>

<div class="mt-6 text-center text-sm italic opacity-70">
Swap any one box and you get a different kind of model.
</div>

---

# One Skeleton, Many Frameworks

<div class="grid grid-cols-2 gap-6 mt-6 text-sm">
<div>

**The same skeleton, many frameworks**

- Cellular Potts (on-lattice)
- Mesh-based (Voronoi springs)
- Node-based (overlapping spheres)
- Vertex-based (polygonal cells)
- Immersed boundary (emergent cell shapes)
- Subcellular Element (SEM)

</div>
<div>

**On-lattice or off-lattice** decides the *Simulation* type:

- Off-lattice uses `OffLatticeSimulation`, where cells move continuously under forces
- On-lattice uses `OnLatticeSimulation`, where cells update on a grid via update rules

The population class you pick tells you which one you need.

</div>
</div>

<div class="mt-8 p-3 rounded text-sm" style="background:#eef3fa;border:1px solid #c5d5e8">
This is why the rest of the workshop feels familiar: once you know one model, the others are the
same recipe with a different box swapped in.
</div>

---

# How the Pieces Map to Classes

Chaste leans heavily on **abstract base classes**: you choose a concrete subclass, but the
simulation only ever talks to the interface. That is why swapping models is so cheap.

| Idea | Abstract base | Concrete example |
|---|---|---|
| Space | `AbstractMesh<DIM>` | `NodesOnlyMesh`, `MutableMesh`, `MutableVertexMesh` |
| One cell's biology | `AbstractCellCycleModel` | `UniformCellCycleModel`, `NoCellCycleModel` |
| Tissue | `AbstractCellPopulation<DIM>` | `NodeBasedCellPopulation`, `VertexBasedCellPopulation` |
| Physics | `AbstractForce<DIM>` | `GeneralisedLinearSpringForce`, `SemForce` |
| Constraints | `AbstractCellPopulationBoundaryCondition` | `SphereGeometryBoundaryCondition` |
| Time loop | `AbstractCellBasedSimulation` | `OffLatticeSimulation`, `OnLatticeSimulation` |

The cell list itself is a `std::vector<CellPtr>` in C++, and a plain list of cells in Python.

---

# Two Front Doors: C++ and PyChaste

<div class="grid grid-cols-2 gap-6 mt-4 text-sm">
<div class="p-3 rounded" style="background:#eef3fa;border:1px solid #c5d5e8">

### C++

- The native library, where **everything** lives first
- A simulation is written as a **CxxTest** test method, compiled to a binary
- Templated on dimension: `NodeBasedCellPopulation<2>`
- You manage memory (`MAKE_PTR`, `new`/`delete`)
- Fastest, and needed for new model development

</div>
<div class="p-3 rounded" style="background:#f0f7ee;border:1px solid #cfe3c5">

### PyChaste

- Python bindings over the **same compiled engine**
- A simulation is an ordinary script, `unittest`, or Jupyter notebook
- Dimension is a **subscript**: `NodeBasedCellPopulation[2]`
- Memory is automatic, with no `new`/`delete`
- Adds `VtkScene` for **inline 3-D visualisation**
- Ideal for exploration, teaching, and parameter sweeps

</div>
</div>

<div class="mt-4 text-center text-sm italic opacity-70">
Same five objects, same method names, same results files. Only the syntax and the ergonomics differ.
</div>

---
layout: section
---

<div class="text-center">
  <div class="text-8xl font-bold" style="color:#002147">Part 2</div>
  <div class="text-3xl mt-6 opacity-70">Building One, Piece by Piece</div>
  <div class="text-xl mt-3 opacity-50">A node-based monolayer, in both languages</div>
</div>

---

# Ingredient 1: The Mesh (Space)

A **mesh** holds the spatial degrees of freedom. For a node-based model that is a
`NodesOnlyMesh`: cells are points, and a **cut-off length** sets who interacts with whom.

<div class="grid grid-cols-2 gap-4 mt-2 text-xs">
<div>

**C++**
```cpp
HoneycombMeshGenerator generator(2, 2);
boost::shared_ptr<MutableMesh<2,2> >
    p_generating_mesh = generator.GetMesh();

NodesOnlyMesh<2> mesh;
// 1.5 = interaction radius (cut-off)
mesh.ConstructNodesWithoutMesh(
    *p_generating_mesh, 1.5);
```

</div>
<div>

**PyChaste**
```python
generator = chaste.mesh.HoneycombMeshGenerator(2, 2)
generating_mesh = generator.GetMesh()

mesh = chaste.mesh.NodesOnlyMesh[2]()
# 1.5 = interaction radius (cut-off)
mesh.ConstructNodesWithoutMesh(
    generating_mesh, 1.5)
```

</div>
</div>

<div class="mt-3 text-sm">

- A **generator** (here `HoneycombMeshGenerator`) is a convenience that builds a regular mesh for you
- Notice the interface difference: a `<2>` template parameter versus a `[2]` subscript, and
  `*p_generating_mesh` versus just passing the object

</div>

---

# Ingredient 2: The Cells (Biology)

Each spatial site gets a **Cell**, and each cell owns a **cell-cycle model** that decides
when it divides. `CellsGenerator` is the helper that mass-produces one cell per node.

<div class="grid grid-cols-2 gap-4 mt-1 text-xs">
<div>

**C++**
```cpp
std::vector<CellPtr> cells;
MAKE_PTR(TransitCellProliferativeType, p_type);

CellsGenerator<UniformCellCycleModel, 2> gen;
gen.GenerateBasicRandom(
    cells, mesh.GetNumNodes(), p_type);
```

</div>
<div>

**PyChaste**
```python
transit_type = \
    chaste.cell_based.TransitCellProliferativeType()

gen = chaste.cell_based.CellsGenerator[
    "UniformCellCycleModel", 2]()
cells = gen.GenerateBasicRandom(
    mesh.GetNumNodes(), transit_type)
```

</div>
</div>

<div class="mt-3 text-sm">

- The **cell-cycle model** is a template or subscript argument. Swap `UniformCellCycleModel` for
  `NoCellCycleModel`, `StochasticOxygenBasedCellCycleModel`, and so on.
- The **proliferative type** (`Transit`, `Differentiated`, `Stem`) tags what a cell is allowed to do
- C++ fills a vector passed *in*, while PyChaste *returns* the list. It is a small but typical
  ergonomic difference.

</div>

---

# Ingredient 3: The Cell Population (Tissue)

The **CellPopulation** marries the cell list to the mesh and is the object everything else
queries. The *type* of population is what makes this a "node-based" simulation.

<div class="grid grid-cols-2 gap-4 mt-2 text-xs">
<div>

**C++**
```cpp
NodeBasedCellPopulation<2>
    cell_population(mesh, cells);
```

</div>
<div>

**PyChaste**
```python
cell_population = \
    chaste.cell_based.NodeBasedCellPopulation[2](
        mesh, cells)
```

</div>
</div>

<div class="mt-4 text-sm">

This one line encodes the modelling paradigm. Change just this class and you change the model:

| Population class | Model family | Needs simulation |
|---|---|---|
| `MeshBasedCellPopulation` | Voronoi / spring | `OffLatticeSimulation` |
| `NodeBasedCellPopulation` | overlapping spheres | `OffLatticeSimulation` |
| `VertexBasedCellPopulation` | polygonal cells | `OffLatticeSimulation` |
| `PottsBasedCellPopulation` | cellular Potts | `OnLatticeSimulation` |

</div>

---

# PyChaste Bonus: Peek Before You Run

Because PyChaste runs in notebooks, you can render the population *before* solving. That is a
quick sanity check, whereas the C++ workflow only shows you the result in ParaView after the run.

```python
scene = chaste.visualization.VtkScene[2]()
scene.SetCellPopulation(cell_population)
scene.Start()                       # shows the initial tissue inline
```

<div class="mt-4 text-sm">

- `VtkScene` has **no C++ equivalent in the workflow**. It is a PyChaste convenience built for
  interactive use.
- Later we attach it as a *modifier* so snapshots are captured *during* the run
- This is the single biggest day-to-day reason biologists reach for PyChaste: a tight, visual,
  iterate-in-seconds loop

</div>

---

# Ingredient 4: The Simulation and Rules

Wrap the population in a **Simulation**, set output and timing, then **add the physics**:
forces, boundary conditions, cell killers, and modifiers.

<div class="grid grid-cols-2 gap-4 mt-1 text-xs">
<div>

**C++**
```cpp
OffLatticeSimulation<2> simulator(cell_population);
simulator.SetOutputDirectory("NodeBasedMonolayer");
simulator.SetSamplingTimestepMultiple(12);
simulator.SetEndTime(10.0);

MAKE_PTR(GeneralisedLinearSpringForce<2>, p_force);
simulator.AddForce(p_force);
```

</div>
<div>

**PyChaste**
```python
simulator = chaste.cell_based.OffLatticeSimulation[2, 2](
    cell_population)
simulator.SetOutputDirectory("Py/NodeBasedMonolayer")
simulator.SetSamplingTimestepMultiple(100)
simulator.SetEndTime(10.0)

force = chaste.cell_based.GeneralisedLinearSpringForce[2, 2]()
simulator.AddForce(force)
```

</div>
</div>

<div class="mt-3 text-sm">

- `AddForce`, `AddCellPopulationBoundaryCondition`, `AddCellKiller`, and `AddSimulationModifier`
  are how you compose behaviour, so **stack as many as you like**
- `SetSamplingTimestepMultiple` controls how often results are written (not the solver `dt`)

</div>

---

# Ingredient 5: Solve and Visualise

`Solve()` runs the time loop. Results are written as **VTK** (`results.pvd` + `.vtu`) for
ParaView. PyChaste can also snapshot inline via a scene modifier.

<div class="grid grid-cols-2 gap-4 mt-1 text-xs">
<div>

**C++**
```cpp
simulator.Solve();

// (test-only sanity checks)
TS_ASSERT_EQUALS(
    cell_population.GetNumRealCells(), 8u);
```
Then open `…/results_from_time_0/results.pvd`
in ParaView and add glyphs.

</div>
<div>

**PyChaste**
```python
modifier = chaste.cell_based.VtkSceneModifier[2]()
modifier.SetVtkScene(scene)
modifier.SetUpdateFrequency(100)
simulator.AddSimulationModifier(modifier)

scene.Start()
simulator.Solve()
scene.End()
```

</div>
</div>

<div class="mt-3 text-sm">

- Both produce identical `.vtu` output on disk, so the science is the same
- C++ embeds `TS_ASSERT_*` because a tutorial *is* a test. In Python those become `self.assertEqual`.

</div>

---

# The Whole Skeleton on One Slide

<div class="grid grid-cols-2 gap-4 text-xs">
<div>

**C++ (a CxxTest method)**
```cpp
void TestMonolayer()
{
    HoneycombMeshGenerator generator(2, 2);
    NodesOnlyMesh<2> mesh;
    mesh.ConstructNodesWithoutMesh(
        *generator.GetMesh(), 1.5);

    std::vector<CellPtr> cells;
    MAKE_PTR(TransitCellProliferativeType, p_type);
    CellsGenerator<UniformCellCycleModel, 2> cg;
    cg.GenerateBasicRandom(
        cells, mesh.GetNumNodes(), p_type);

    NodeBasedCellPopulation<2> pop(mesh, cells);

    OffLatticeSimulation<2> sim(pop);
    sim.SetOutputDirectory("NodeBasedMonolayer");
    sim.SetEndTime(10.0);
    MAKE_PTR(GeneralisedLinearSpringForce<2>, p_f);
    sim.AddForce(p_f);
    sim.Solve();
}
```

</div>
<div>

**PyChaste (a script / notebook)**
```python
import chaste, chaste.cell_based, chaste.mesh

generator = chaste.mesh.HoneycombMeshGenerator(2, 2)
mesh = chaste.mesh.NodesOnlyMesh[2]()
mesh.ConstructNodesWithoutMesh(
    generator.GetMesh(), 1.5)

t = chaste.cell_based.TransitCellProliferativeType()
cg = chaste.cell_based.CellsGenerator[
    "UniformCellCycleModel", 2]()
cells = cg.GenerateBasicRandom(mesh.GetNumNodes(), t)

pop = chaste.cell_based.NodeBasedCellPopulation[2](
    mesh, cells)

sim = chaste.cell_based.OffLatticeSimulation[2, 2](pop)
sim.SetOutputDirectory("Py/NodeBasedMonolayer")
sim.SetEndTime(10.0)
sim.AddForce(
    chaste.cell_based.GeneralisedLinearSpringForce[2, 2]())
sim.Solve()
```

</div>
</div>

<div class="mt-2 text-center text-sm italic opacity-70">
Line for line, the same five ingredients in the same order.
</div>

---
layout: section
---

<div class="text-center">
  <div class="text-8xl font-bold" style="color:#002147">Part 3</div>
  <div class="text-3xl mt-6 opacity-70">The C++ and PyChaste Interfaces</div>
</div>

---

# Translating Between the Two

If you can read one, you can read the other. The mapping is almost mechanical:

| Concept | C++ | PyChaste |
|---|---|---|
| Module / namespace | `#include "NodesOnlyMesh.hpp"` | `import chaste.mesh` |
| Dimension parameter | `Foo<2>` | `Foo[2]` |
| Templated on a *type* | `CellsGenerator<UniformCellCycleModel, 2>` | `CellsGenerator["UniformCellCycleModel", 2]` |
| Heap object / smart ptr | `MAKE_PTR(Force<2>, p_f);` | `f = Force[2]()` |
| Dereference | `*p_generating_mesh` | (just pass the object) |
| Vectors of cells | `std::vector<CellPtr>` (filled by ref) | a Python list (returned) |
| Test framework | CxxTest, `TS_ASSERT_*` | `unittest`, `self.assert*` |
| Build step | compile target, then run binary | none, just run the script |

---

# What Carries Over, What Doesn't

<div class="grid grid-cols-2 gap-6 mt-2 text-sm">
<div class="p-3 rounded" style="background:#f0f7ee;border:1px solid #cfe3c5">

### Carries over 1-to-1

- Class names and method names are **identical**
- The five-object skeleton and call order
- Output files (`.pvd`/`.vtu`) are fully interchangeable
- Forces, boundary conditions, killers, modifiers
- Most cell-cycle and population types are wrapped

</div>
<div class="p-3 rounded" style="background:#fbf0ee;border:1px solid #e3c8c5">

### PyChaste-only / caveats

- `VtkScene` inline visualisation (no C++ analogue)
- Memory management is automatic
- **Not every** C++ class is wrapped. Brand-new
  research classes (say, on a feature branch) may
  be C++-only until bindings are generated.
- Heavy or long runs: C++ is faster, as Python adds call overhead

</div>
</div>

<div class="mt-5 p-3 rounded text-sm" style="background:#eef3fa;border:1px solid #c5d5e8">
<b>Rule of thumb:</b> prototype and explore in <b>PyChaste</b>, then develop new model classes and run
large production simulations in <b>C++</b>. They read the same files, so you can move between them freely.
</div>

---

# Where to Go Next

<div class="grid grid-cols-2 gap-6 mt-2 text-sm">
<div>

**Tutorials to read next (C++)**
- `TestRunningMeshBasedSimulationsTutorial`
- `TestRunningNodeBasedSimulationsTutorial`
- `TestRunningVertexBasedSimulationsTutorial`
- `TestRunningPottsBasedSimulationsTutorial`
- `TestRunningSemBasedSimulationsTutorial`

Each lives in `cell_based/test/tutorial/` and is a single annotated test.

</div>
<div>

**Same tutorials in PyChaste**
- `pychaste/test/tutorial/TestPy*Tutorial.py`
- Notebook versions in `pychaste/src/py/doc/tutorial/*.ipynb`

**Extending the skeleton** (also tutorials):
- A new force, cell-cycle model, killer, boundary
  condition, or writer, each of which is "swap one box"

</div>
</div>

<div class="mt-6 text-center text-base font-bold" style="color:#002147">
Five objects. One order. Then <code>Solve()</code>. Everything else is a substitution.
</div>

<img src="./img/chaste_logo.png" class="absolute bottom-6 right-8" style="height: 2.8rem;" />
