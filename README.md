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
**[b_01](https://github.com/esedakov/netCmp/tree/b_01)** *(2017-11-09)*
---

#### re-design visualization unit based on Canvas. Previous work was using JointJS library, which was based on alternatiove technology - SVG. It proved to have certain limitations, one of the serious is its slowness, when drawing medium or large Control Flow Graphs (project 'soko' was usually taking around 15 minutes to fully draw CFG. Hope is to speedup this process.
***

**[b_02](https://github.com/esedakov/netCmp/tree/b_02)** *(2017-12-13)*
---

#### Goal 1: add grid data structure as a replacement for current organization of elements in canvas map (application view, which right now uses array to storing and exhaustive search for finding elements in canvas map). 
#### Goal 2: re-design canvas map to dynamically grow, rather than what it is right now, when I need to set its size in terms of number of canvases horizontally and vertically accross entire canvas map. It should grow on demand, i.e. when object that is needed to be drawn is larger than current size of canvas map, it should add as many as needed canvases (both horizontally and vertically) to fit this new object.
+ grid will store only those cells that are not empty, for that reason grid will facilitate hash-collection of cells, indexed by their address string (e.g. 'x123y987' to represent cell that is 123st from the left and 987th from the top)
+ grid will store all objects not only inside each cell that contains them, but also in hash-collection to quickly check whether grid owns this object or not
+ grid has dimensions, determined by its width and height parameters that essentially make up a bounding box around the cells that are non-empty
***

