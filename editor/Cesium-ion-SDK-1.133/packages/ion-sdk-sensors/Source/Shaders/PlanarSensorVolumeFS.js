//This file is automatically rebuilt by the Cesium build process.
export default "uniform vec3 u_radii;\n\
uniform vec3 u_inverseRadii;\n\
uniform float u_sensorRadius;\n\
uniform float u_normalDirection;\n\
uniform vec3 u_q;\n\
\n\
in vec3 v_positionWC;\n\
in vec3 v_positionEC;\n\
in vec3 v_normalEC;\n\
\n\
vec4 getColor(float sensorRadius, vec3 pointEC, vec3 normalEC)\n\
{\n\
    czm_materialInput materialInput;\n\
\n\
    vec3 pointMC = (czm_inverseModelView * vec4(pointEC, 1.0)).xyz;\n\
#if defined(CONIC_TEXTURE_COORDINATES)\n\
    materialInput.st = sensorCartesianToNormalizedConicTextureCoordinates(sensorRadius, pointMC);\n\
#else\n\
    materialInput.st = sensorCartesianToNormalizedPolarTextureCoordinates(sensorRadius, pointMC);\n\
#endif\n\
    materialInput.str = pointMC / sensorRadius;\n\
\n\
    vec3 positionToEyeEC = -pointEC;\n\
    materialInput.positionToEyeEC = positionToEyeEC;\n\
\n\
    vec3 normal = normalize(normalEC);\n\
    materialInput.normalEC = u_normalDirection * normal;\n\
\n\
    czm_material material = czm_getMaterial(materialInput);\n\
    return mix(czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC), vec4(material.diffuse, material.alpha), 0.4);\n\
}\n\
\n\
void main()\n\
{\n\
    vec3 sensorVertexEC = czm_modelView[3].xyz;\n\
\n\
    float ellipsoidValue = ellipsoidSurfaceFunction(u_inverseRadii, v_positionWC);\n\
    float halfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, v_positionWC);\n\
\n\
#if defined(ABOVE_ELLIPSOID_HORIZON)\n\
    float horizonValue = ellipsoidHorizonSurfaceFunction(u_q, u_inverseRadii, v_positionWC);\n\
    if (horizonValue < 0.0)\n\
    {\n\
        discard;\n\
    }\n\
#elif defined(BELOW_ELLIPSOID_HORIZON)\n\
    float horizonValue = ellipsoidHorizonSurfaceFunction(u_q, u_inverseRadii, v_positionWC);\n\
    if (horizonValue > 0.0)\n\
    {\n\
        discard;\n\
    }\n\
#if !defined(SHOW_THROUGH_ELLIPSOID)\n\
    if (ellipsoidValue < 0.0)\n\
    {\n\
        discard;\n\
    }\n\
    if (halfspaceValue < 0.0)\n\
    {\n\
        discard;\n\
    }\n\
#endif\n\
#else //defined(COMPLETE)\n\
#if !defined(SHOW_THROUGH_ELLIPSOID)\n\
    if (ellipsoidValue < 0.0)\n\
    {\n\
        discard;\n\
    }\n\
    float horizonValue = ellipsoidHorizonSurfaceFunction(u_q, u_inverseRadii, v_positionWC);\n\
    if (halfspaceValue < 0.0 && horizonValue < 0.0)\n\
    {\n\
        discard;\n\
    }\n\
#endif\n\
#endif\n\
    // PERFORMANCE_IDEA: We can omit this check if the radius is Number.POSITIVE_INFINITY.\n\
    if (distance(v_positionEC, sensorVertexEC) > u_sensorRadius)\n\
    {\n\
        discard;\n\
    }\n\
\n\
#if (defined(ENVIRONMENT_CONSTRAINT) && !defined(SHOW_ENVIRONMENT_OCCLUSION)) || defined(SHOW_ENVIRONMENT_INTERSECTION)\n\
    float depth;\n\
    bool isInShadow = getShadowVisibility(v_positionEC, depth);\n\
#endif\n\
#if defined(ENVIRONMENT_CONSTRAINT) && !defined(SHOW_ENVIRONMENT_OCCLUSION)\n\
    if (isInShadow)\n\
    {\n\
        discard;\n\
    }\n\
#endif\n\
#if defined(SHOW_ENVIRONMENT_INTERSECTION)\n\
    if (showShadowIntersectionPoint(v_positionEC, depth, u_environmentIntersectionWidth))\n\
    {\n\
        out_FragColor = getEnvironmentIntersectionColor();\n\
        czm_writeLogDepth();\n\
        return;\n\
    }\n\
#endif\n\
\n\
#if defined(SHOW_INTERSECTION) && !defined(ABOVE_ELLIPSOID_HORIZON)\n\
    // Notes: Each surface functions should have an associated tolerance based on the floating point error.\n\
    if (isOnBoundary(ellipsoidValue, czm_epsilon3) && (halfspaceValue > 0.0))\n\
    {\n\
        out_FragColor = getIntersectionColor();\n\
    }\n\
    else\n\
    {\n\
        out_FragColor = getColor(u_sensorRadius, v_positionEC, v_normalEC);\n\
    }\n\
#else\n\
    out_FragColor = getColor(u_sensorRadius, v_positionEC, v_normalEC);\n\
#endif\n\
\n\
    czm_writeLogDepth();\n\
}\n\
";
