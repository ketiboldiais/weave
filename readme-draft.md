# Weave

This is the monorepo for Weave, a collection of graphics modules. Below are the various packages
contained in this repository.

## @weave/react

This package contains various React components, used primarily for testing. Weave itself doesn’t do
any rendering – it only handles the algorithms and data wrangling necessary for visualization.

## @weave/reed
A parser combinator module, used for API-specific languages in Weave (e.g., Weave’s trigonometric
functions).

## @weave/twill
Weave’s core API, a set of primitive shapes and drawing algorithms.

### Angle
The Angle module is used almost exclusively for development, but the API is made public because of
how useful they can be for debugging vectors.

#### Property: `value`
The angle’s value, a number.

#### Property: `unit`
The angle’s unit, either of the constant strings `deg` or `rad`.

### Force Graph
Draws force-directed graphs. A few things to keep in mind about drawing graphs:

1. Drawing a graph with uniform edge lengths in any dimension is NP-hard (_See_ Johnson 1982).
2. Drawing planar graphs with uniform edge lengths is NP-hard (_See_ Eades & Wormald 1990).
3. Drawing a graph where all edges must either be ${n}$ or ${m}$ units long, where ${n}$ and ${m}$ are constants in ${\reals,}$ is NP-hard. (_See_ Saxe 1980).

This is all to say that we should temper our expectations on drawing graphs of uniform edge lengths. We can’t expect perfectly uniform edge lengths, but we can close approximations. Thus, the key challenge in graph-drawing is finding reasonable estimates: an output that looks good, without being too time- or memory-intensive.

### Layouts
The force-graph currently supports the following layouts.

#### Eades84
The `Eades84` layout uses a variation of Eades’s algorithm.[^1] Briefly, the algorithm works as such (paraphrasing):

> Assume the vertices are masses and the edges springs, comprising a mechanical system. At genesis, place the vertices at random locations (within the viewport, of course). Release all the masses and springs at once, such that the system settles to a minimal energy state.

This is akin to taking a rubber band, pulling and twisting it, then letting go. The band will eventually return to its resting state, some oval-like shape. Eades’s algorithm is an example of a _spring embedder_ - a graph drawing algorithm that approximates graphs of uniform edge lengths by modelling them as mechanical systems.

[^1]: _See_ Peter Eades, _A Heuristic for Graph Drawing_, 42 Congressus Numerantium 149 (1984).

Implementation-wise: We apply attractive forces to adjacent vertices ${u}$ and ${v,}$ 

## @weave/twine
Weave’s scripting language and its transpiler. Certain Weave modules (e.g., function plotting) rely
on Twine to sanitize strings, and to ensure proper syntax and semantics.
