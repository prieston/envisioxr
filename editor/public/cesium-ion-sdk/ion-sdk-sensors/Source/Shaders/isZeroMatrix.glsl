/**
 * Determines if a 4x4 matrix is the zero matrix.
 * <p>
 * This function only exists to fix a bug in Edge which will return the
 * wrong result for <code>matrix !== mat4(0.0)</code>. The result is always <code>false</code>.
 * </p>
 *
 * @name czm_isZeroMatrix
 * @glslFunction
 *
 * @param {mat4} matrix The matrix to test.
 * @returns {bool} <code>true</code> if the matrix is the zero matrix; otherwise, <code>false</code>.
 */
bool czm_isZeroMatrix(mat4 matrix)
{
    return matrix == mat4(0.0);
}
