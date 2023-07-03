# Weave

This is the monorepo for Weave, a collection of graphics modules. Below are the various packages
contained in this repository.

## @weave/react

This package contains various React components, used primarily for testing. Weave itself doesn’t do
any rendering – it only handles the algorithms and data wrangling necessary for visualization.

## @weave/reed

A parser combinator module, used for API-specific languages in Weave (e.g., Weave’s trigonometric
functions).

## @weave/loom

Weave’s core API, a set of primitive shapes and drawing algorithms.

### Graph

`Graph` objects implement basic graphs.

| Property    | Description                                                       |
| ----------- | ----------------------------------------------------------------- |
| `adjacency` | An adjacency list, mapping vertex keys to an array of vertex keys |
| `nodes`     | An object mapping vertex keys to vertices.                        |

| Method                  | Description                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `has(𝐾: string\|number)` | Returns true if the graph’s adjacency list contains the given key 𝐾, false otherwise. |

## @weave/twine

Weave’s scripting language and its transpiler. Certain Weave modules (e.g., function plotting) rely
on Twine to sanitize strings, and to ensure proper syntax and semantics.
