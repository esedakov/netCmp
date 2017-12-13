# netCmp
![alt text](http://www.netcmp.net/b_02/EMB.jpg "Network Compiler")
### Idea: online programming framework for web development and experimentation
### Type: private
### Website: [Netcmp](http://www.netcmp.net)
### Developer: [Eduard Sedakov](mailto:edsedakov@gmail.com)
#### Hint 1: [Github markup](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
___
### Branches: (Some of the earlier branches have been skipped)
___
**b_01** *(2017-11-09)*
---

> re-design visualization unit based on Canvas. Previous work was using JointJS library, which was based on alternatiove technology - SVG. It proved to have certain limitations, one of the serious is its slowness, when drawing medium or large Control Flow Graphs (project 'soko' was usually taking around 15 minutes to fully draw CFG. Hope is to speedup this process.
***
___
**b_02** *(2017-12-13)*
---

> Goal 1: introduce linear quadtree data structure as a replacement for current organization of elements in canvas map (application view, which right now uses array to storing and exhaustive search for finding elements in canvas map). The same approach will be also considered for debugging view, but it needs more examination; currently in debugging view elements are searched via CFG.
> Goal 2: change B-tree library to be used not only inside interpreter as language library, but also to assist its components in efficiently storing and retrieving data. Specifically, linear quadtree will use b-tree for storing z-ordering morton codes.
***
___
