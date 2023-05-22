 - Add textures to shapes https://github.com/liabru/matter-js/issues/497 https://brm.io/matter-js/demo/#sprites https://github.com/liabru/matter-js/blob/master/examples/sprites.js
 - Clarify Substance / SubstGroup
 - Make Beaker
 - add html-like classList, id, and relevant querySelector to subclass of Matter.Body
 - in query function Wf(), if we find a special character like #.>[] then we switch to querySelectorMode and parse everything within the [] as a Wc query. otherwise Wf searches as if it was a Wc query.


 process aliases for 
1. acids
2. alpha- beta- gamma-
3. ortho meta para
4. (colors)
5. names of minerals
6. common names (ie. water)
7. (constant boiling)
8. (monoclinic, orthorhombic, hexagonal etc)

name:/\([a-zA-HJ-UW-Z].*\)/
