//This file is automatically rebuilt by the Cesium build process.
export default "/**\n\
 * Determines if a 4x4 matrix is the zero matrix.\n\
 * <p>\n\
 * This function only exists to fix a bug in Edge which will return the\n\
 * wrong result for <code>matrix !== mat4(0.0)</code>. The result is always <code>false</code>.\n\
 * </p>\n\
 *\n\
 * @name czm_isZeroMatrix\n\
 * @glslFunction\n\
 *\n\
 * @param {mat4} matrix The matrix to test.\n\
 * @returns {bool} <code>true</code> if the matrix is the zero matrix; otherwise, <code>false</code>.\n\
 */\n\
bool czm_isZeroMatrix(mat4 matrix)\n\
{\n\
    return matrix == mat4(0.0);\n\
}\n\
";
