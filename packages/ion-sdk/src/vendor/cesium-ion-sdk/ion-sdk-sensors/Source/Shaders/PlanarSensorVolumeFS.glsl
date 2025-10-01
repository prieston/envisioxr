uniform vec3 u_radii;
uniform vec3 u_inverseRadii;
uniform float u_sensorRadius;
uniform float u_normalDirection;
uniform vec3 u_q;

in vec3 v_positionWC;
in vec3 v_positionEC;
in vec3 v_normalEC;

vec4 getColor(float sensorRadius, vec3 pointEC, vec3 normalEC)
{
    czm_materialInput materialInput;

    vec3 pointMC = (czm_inverseModelView * vec4(pointEC, 1.0)).xyz;
#if defined(CONIC_TEXTURE_COORDINATES)
    materialInput.st = sensorCartesianToNormalizedConicTextureCoordinates(sensorRadius, pointMC);
#else
    materialInput.st = sensorCartesianToNormalizedPolarTextureCoordinates(sensorRadius, pointMC);
#endif
    materialInput.str = pointMC / sensorRadius;

    vec3 positionToEyeEC = -pointEC;
    materialInput.positionToEyeEC = positionToEyeEC;

    vec3 normal = normalize(normalEC);
    materialInput.normalEC = u_normalDirection * normal;

    czm_material material = czm_getMaterial(materialInput);
    return mix(czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC), vec4(material.diffuse, material.alpha), 0.4);
}

void main()
{
    vec3 sensorVertexEC = czm_modelView[3].xyz;

    float ellipsoidValue = ellipsoidSurfaceFunction(u_inverseRadii, v_positionWC);
    float halfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, v_positionWC);

#if defined(ABOVE_ELLIPSOID_HORIZON)
    float horizonValue = ellipsoidHorizonSurfaceFunction(u_q, u_inverseRadii, v_positionWC);
    if (horizonValue < 0.0)
    {
        discard;
    }
#elif defined(BELOW_ELLIPSOID_HORIZON)
    float horizonValue = ellipsoidHorizonSurfaceFunction(u_q, u_inverseRadii, v_positionWC);
    if (horizonValue > 0.0)
    {
        discard;
    }
#if !defined(SHOW_THROUGH_ELLIPSOID)
    if (ellipsoidValue < 0.0)
    {
        discard;
    }
    if (halfspaceValue < 0.0)
    {
        discard;
    }
#endif
#else //defined(COMPLETE)
#if !defined(SHOW_THROUGH_ELLIPSOID)
    if (ellipsoidValue < 0.0)
    {
        discard;
    }
    float horizonValue = ellipsoidHorizonSurfaceFunction(u_q, u_inverseRadii, v_positionWC);
    if (halfspaceValue < 0.0 && horizonValue < 0.0)
    {
        discard;
    }
#endif
#endif
    // PERFORMANCE_IDEA: We can omit this check if the radius is Number.POSITIVE_INFINITY.
    if (distance(v_positionEC, sensorVertexEC) > u_sensorRadius)
    {
        discard;
    }

#if (defined(ENVIRONMENT_CONSTRAINT) && !defined(SHOW_ENVIRONMENT_OCCLUSION)) || defined(SHOW_ENVIRONMENT_INTERSECTION)
    float depth;
    bool isInShadow = getShadowVisibility(v_positionEC, depth);
#endif
#if defined(ENVIRONMENT_CONSTRAINT) && !defined(SHOW_ENVIRONMENT_OCCLUSION)
    if (isInShadow)
    {
        discard;
    }
#endif
#if defined(SHOW_ENVIRONMENT_INTERSECTION)
    if (showShadowIntersectionPoint(v_positionEC, depth, u_environmentIntersectionWidth))
    {
        out_FragColor = getEnvironmentIntersectionColor();
        czm_writeLogDepth();
        return;
    }
#endif

#if defined(SHOW_INTERSECTION) && !defined(ABOVE_ELLIPSOID_HORIZON)
    // Notes: Each surface functions should have an associated tolerance based on the floating point error.
    if (isOnBoundary(ellipsoidValue, czm_epsilon3) && (halfspaceValue > 0.0))
    {
        out_FragColor = getIntersectionColor();
    }
    else
    {
        out_FragColor = getColor(u_sensorRadius, v_positionEC, v_normalEC);
    }
#else
    out_FragColor = getColor(u_sensorRadius, v_positionEC, v_normalEC);
#endif

    czm_writeLogDepth();
}
