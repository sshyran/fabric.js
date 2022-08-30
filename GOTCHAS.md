- **Crazy DOM**\
`new fabric.Canvas('foo')` wraps `<canvas id="foo">` element with a `<div>` one, and adds another (absolutely positioned) canvas element on top of the existing canvas (the one with id="foo"). This only happens for dynamic canvases (`fabric.Canvas`), not static ones (`fabric.StaticCanvas`).\
See [[How fabric canvas layering works]].

- **Crazier fabric**\
Make sure you are not sharing an object (such as a `clipPath`) between render agents. In other words, keep the object tree simple and strict.

- **Object is NOT selectable**: `setCoords()`\
An object has a visual state and an coordinate state. Both can become stale.\
When the visual state is stale it is visible making it simple to catch. This is a bit different.\
When an object or its controls aren't interactive or don't match their visual position, it means the coordinate state is stale. This happens after changing a property that affects position.
Calling `object.setCoords()` should fix it.

- **Visuals NOT updating**: [Object Caching](http://fabricjs.com/fabric-object-caching)\
Consider marking the object as `dirty` before rendering.

- **Wrong position after loading from JSON**: increase `NUM_FRACTION_DIGITS`\
When dealing with serialization, floats can blows up the string size with unnecessary decimals. `NUM_FRACTION_DIGITS` controls the fraction digits in exporting methods (`toObject`, `toSVG`)

- **Mouse/Touch position is off**: `canvas.calcOffset()`\
This usually happens once the canvas' position in the `document` is changed **after** it had been initialized.

- **0.5 pixel position offset**: `strokeWidth`\
Most Objects have a transparent stroke of width 1 that shift them by 0.5 pixel horizontally and vertically.
Take this under consideration when positioning objects at an exact position.
This is to comply with SVG behavior.
You can always set `strokeWidth` to `0`.

- **Blurry visuals**: retina scaling\
Objects need a reference to `Canvas` for proper rendering. 
Without the reference objects can't access the retina scaling value ([device pixel ratio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#correcting_resolution_in_a_canvas)), resulting in bad resolution.
This usually happens when an object is a child of a custom object. Fix it by propagating `canvas` to the object in the parent's `_set` method **OR** better off, use `Group`, it is designed especially for building custom objects.

- **Object position in Group**\
An object in a group will relate to the group's center as (0, 0).
Read more about `Group`

- **Vanishing Object**\
It is likely you are misusing `Group` and the object tree because the vanished objects thinks it is not inside the visible canvas' viewport, indicating a severe **bug**. If you want to hack your way around it use `canvas.skipOffscreen` (recommended for triaging **ONLY**) with a significant performance hit.

- **Text BBOX is off**\
Make sure fonts have loaded before you create the `Text` object. Fabric needs the font to calculate the position and bounding box of the characters. Doing so prior to loading the font will lead to a bad calculation using a fallback font.

- **Editing Textbox on Mobile**: `dblclick`\
 When trying to edit a textbox on mobile, users need to double-tap the same spot to enter edit mode - otherwise it just moves it around.