//@ts-nocheck

import { Color } from '../color';

('use strict');

var fabric = global.fabric || (global.fabric = {}),
  extend = object.extend,
  filters = fabric.Image.filters,
  createClass = createClass;

/**
 * Remove white filter class
 * @class fabric.Image.RemoveColor
 * @memberOf fabric.Image.filters
 * @extends fabric.Image.filters.BaseFilter
 * @see {@link fabric.Image.RemoveColor#initialize} for constructor definition
 * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
 * @example
 * var filter = new fabric.Image.RemoveColor({
 *   threshold: 0.2,
 * });
 * object.filters.push(filter);
 * object.applyFilters();
 * canvas.renderAll();
 */
export class RemoveColor extends filters.BaseFilter {
  /**
   * Filter type
   * @param {String} type
   * @default
   */
  type: string;

  /**
   * Color to remove, in any format understood by fabric.Color.
   * @param {String} type
   * @default
   */
  color: string;

  /**
   * Fragment source for the brightness program
   */
  fragmentSource;

  /**
   * distance to actual color, as value up or down from each r,g,b
   * between 0 and 1
   **/
  distance: number;

  /**
   * For color to remove inside distance, use alpha channel for a smoother deletion
   * NOT IMPLEMENTED YET
   **/
  useAlpha: boolean;

  /**
   * Applies filter to canvas element
   * @param {Object} canvasEl Canvas element to apply filter to
   */
  applyTo2d(options) {
    var imageData = options.imageData,
      data = imageData.data,
      i,
      distance = this.distance * 255,
      r,
      g,
      b,
      source = new Color(this.color).getSource(),
      lowC = [source[0] - distance, source[1] - distance, source[2] - distance],
      highC = [
        source[0] + distance,
        source[1] + distance,
        source[2] + distance,
      ];

    for (i = 0; i < data.length; i += 4) {
      r = data[i];
      g = data[i + 1];
      b = data[i + 2];

      if (
        r > lowC[0] &&
        g > lowC[1] &&
        b > lowC[2] &&
        r < highC[0] &&
        g < highC[1] &&
        b < highC[2]
      ) {
        data[i + 3] = 0;
      }
    }
  }

  /**
   * Return WebGL uniform locations for this filter's shader.
   *
   * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
   * @param {WebGLShaderProgram} program This filter's compiled shader program.
   */
  getUniformLocations(gl, program) {
    return {
      uLow: gl.getUniformLocation(program, 'uLow'),
      uHigh: gl.getUniformLocation(program, 'uHigh'),
    };
  }

  /**
   * Send data from this filter to its shader program's uniforms.
   *
   * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
   * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
   */
  sendUniformData(gl, uniformLocations) {
    var source = new Color(this.color).getSource(),
      distance = parseFloat(this.distance),
      lowC = [
        0 + source[0] / 255 - distance,
        0 + source[1] / 255 - distance,
        0 + source[2] / 255 - distance,
        1,
      ],
      highC = [
        source[0] / 255 + distance,
        source[1] / 255 + distance,
        source[2] / 255 + distance,
        1,
      ];
    gl.uniform4fv(uniformLocations.uLow, lowC);
    gl.uniform4fv(uniformLocations.uHigh, highC);
  }

  /**
   * Returns object representation of an instance
   * @return {Object} Object representation of an instance
   */
  toObject() {
    return extend(super.toObject(), {
      color: this.color,
      distance: this.distance,
    });
  }
}

export const removeColorDefaultValues: Partial<TClassProperties<RemoveColor>> =
  {
    type: 'RemoveColor',
    color: '#FFFFFF',
    fragmentSource:
      'precision highp float;\n' +
      'uniform sampler2D uTexture;\n' +
      'uniform vec4 uLow;\n' +
      'uniform vec4 uHigh;\n' +
      'varying vec2 vTexCoord;\n' +
      'void main() {\n' +
      'gl_FragColor = texture2D(uTexture, vTexCoord);\n' +
      'if(all(greaterThan(gl_FragColor.rgb,uLow.rgb)) && all(greaterThan(uHigh.rgb,gl_FragColor.rgb))) {\n' +
      'gl_FragColor.a = 0.0;\n' +
      '}\n' +
      '}',
    distance: 0.02,
    useAlpha: false,
  };

Object.assign(RemoveColor.prototype, removeColorDefaultValues);

/**
 * Create filter instance from an object representation
 * @static
 * @param {Object} object Object to create an instance from
 * @returns {Promise<fabric.Image.RemoveColor>}
 */
fabric.Image.RemoveColor.fromObject =
  fabric.Image.filters.BaseFilter.fromObject;
