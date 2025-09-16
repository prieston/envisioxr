void main()
{
#ifdef ONLY_WIRE_FRAME
	out_FragColor = getMaterialColor();
	return;
#endif

    vec3 sensorVertexWC = czm_model[3].xyz;
    vec3 sensorVertexEC = czm_modelView[3].xyz;

    // Ray from eye to fragment in eye coordinates
    czm_ray ray;
    if (!czm_isZeroMatrix(czm_inverseProjection))
    {
        ray = czm_ray(vec3(0.0), normalize(v_positionEC));
    }
    else
    {
        ray = czm_ray(vec3(v_positionEC.xy, 0.0), vec3(0.0, 0.0, -1.0));
    }

    ellipsoidHorizonCone horizonCone = ellipsoidHorizonConeNew(u_radii, u_inverseRadii, sensorVertexWC, u_q, u_inverseUnitQ, u_cosineAndSineOfHalfAperture.x, u_cosineAndSineOfHalfAperture.y);

    czm_raySegment horizonConeInterval = rayEllipsoidHorizonConeIntersectionInterval(ray, horizonCone);
    if (czm_isEmpty(horizonConeInterval))
    {
        discard;
    }

    vec3 stopEC = czm_pointAlongRay(ray, horizonConeInterval.stop);
    vec3 stopWC = (czm_inverseView * vec4(stopEC, 1.0)).xyz;

    vec4 stopCC = czm_projection * vec4(stopEC, 1.0);
    float stopZ = stopCC.z / stopCC.w;

    // Discard in case surface is behind far plane due to depth clamping.
    if ((stopZ < -1.0) || (stopZ > 1.0))
    {
        discard;
    }

#if defined(ABOVE_ELLIPSOID_HORIZON)
    // Do nothing in this case.
#elif defined(BELOW_ELLIPSOID_HORIZON)
    float halfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, stopWC);
#if !defined(SHOW_THROUGH_ELLIPSOID)
    if (halfspaceValue < 0.0)
    {
        discard;
    }
#endif
#else //defined(COMPLETE)
    float halfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, stopWC);
    if (halfspaceValue > 0.0)
    {
        discard;
    }
#endif
    // PERFORMANCE_IDEA: We can omit this check if the radius is Number.POSITIVE_INFINITY.
    if (distance(stopEC, sensorVertexEC) > u_sensorRadius)
    {
        discard;
    }
    vec3 stopMC = (czm_inverseModel * vec4(stopWC, 1.0)).xyz;
    float sensorValue = sensorSurfaceFunction(stopMC);
    if (sensorValue > 0.0)
    {
        discard;
    }
#if !defined(SHOW_THROUGH_ELLIPSOID)
    vec3 cameraVertexWC;
    if (!czm_isZeroMatrix(czm_inverseProjection))
    {
        cameraVertexWC = czm_inverseView[3].xyz;
    }
    else
    {
        cameraVertexWC = (czm_inverseView * vec4(v_positionEC.xy, 0.0, 1.0)).xyz;
    }
    if (inEllipsoidShadow(u_inverseRadii * cameraVertexWC, u_inverseRadii, stopWC))
    {
        discard;
    }
#endif
#if defined(SHOW_INTERSECTION) && !defined(ABOVE_ELLIPSOID_HORIZON)
    if (isOnBoundary(sensorValue, czm_epsilon3) || isOnBoundary(halfspaceValue, czm_epsilon3))
    {
        out_FragColor = getIntersectionColor();
    }
    else
    {
        out_FragColor = getSurfaceColor(horizonCone, stopMC, stopWC, stopEC);
    }
#else
    out_FragColor = getSurfaceColor(horizonCone, stopMC, stopWC, stopEC);
#endif
    setDepth(stopEC);
}
