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

    vec3 startEC = czm_pointAlongRay(ray, horizonConeInterval.start);
    vec3 startWC = (czm_inverseView * vec4(startEC, 1.0)).xyz;
    vec3 stopEC = czm_pointAlongRay(ray, horizonConeInterval.stop);
    vec3 stopWC = (czm_inverseView * vec4(stopEC, 1.0)).xyz;

    vec3 startMC = (czm_inverseModel * vec4(startWC, 1.0)).xyz;
    float startSensorValue = sensorSurfaceFunction(startMC);
    vec3 stopMC = (czm_inverseModel * vec4(stopWC, 1.0)).xyz;
    float stopSensorValue = sensorSurfaceFunction(stopMC);

    // PERFORMANCE_IDEA: We can omit this check if the radius is Number.POSITIVE_INFINITY.
    float startSphereValue = distance(startEC, sensorVertexEC) - u_sensorRadius;
    float stopSphereValue = distance(stopEC, sensorVertexEC) - u_sensorRadius;

#if defined(ABOVE_ELLIPSOID_HORIZON)
    bool discardStart = (startSensorValue > 0.0 || startSphereValue > 0.0);
    bool discardStop = (stopSensorValue > 0.0 || stopSphereValue > 0.0);
#elif defined(BELOW_ELLIPSOID_HORIZON)
    float startHalfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, startWC);
    float stopHalfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, stopWC);
#if !defined(SHOW_THROUGH_ELLIPSOID)
    bool discardStart = (startHalfspaceValue < 0.0 || startSensorValue > 0.0 || startSphereValue > 0.0);
    bool discardStop = (stopHalfspaceValue < 0.0 || stopSensorValue > 0.0 || stopSphereValue > 0.0);
#else
    bool discardStart = (startSensorValue > 0.0 || startSphereValue > 0.0);
    bool discardStop = (stopSensorValue > 0.0 || stopSphereValue > 0.0);
#endif
#else //defined(COMPLETE)
    float startHalfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, startWC);
    float stopHalfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, stopWC);

    bool discardStart = (startHalfspaceValue > 0.0 || startSensorValue > 0.0 || startSphereValue > 0.0);
    bool discardStop = (stopHalfspaceValue > 0.0 || stopSensorValue > 0.0 || stopSphereValue > 0.0);
#endif

    vec4 startCC = czm_projection * vec4(startEC, 1.0);
    float startZ = startCC.z / startCC.w;

    vec4 stopCC = czm_projection * vec4(stopEC, 1.0);
    float stopZ = stopCC.z / stopCC.w;

    // Discard in case surface is behind far plane due to depth clamping.
    discardStart = discardStart || (startZ < -1.0) || (startZ > 1.0);
    discardStop = discardStop || (stopZ < -1.0) || (stopZ > 1.0);

    vec3 cameraVertexWC;
    if (!czm_isZeroMatrix(czm_inverseProjection))
    {
        cameraVertexWC = czm_inverseView[3].xyz;
    }
    else
    {
        cameraVertexWC = (czm_inverseView * vec4(v_positionEC.xy, 0.0, 1.0)).xyz;
    }

    if (discardStart && discardStop)
    {
        discard;
    }
    else if (discardStart)
    {
#if !defined(SHOW_THROUGH_ELLIPSOID)
        if (inEllipsoidShadow(u_inverseRadii * cameraVertexWC, u_inverseRadii, stopWC))
        {
            discard;
        }
#endif
#if defined(SHOW_INTERSECTION) && !defined(ABOVE_ELLIPSOID_HORIZON)
        if (isOnBoundary(stopSensorValue, czm_epsilon3) || isOnBoundary(stopHalfspaceValue, czm_epsilon3))
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
    else if (discardStop)
    {
#if !defined(SHOW_THROUGH_ELLIPSOID)
        if (inEllipsoidShadow(u_inverseRadii * cameraVertexWC, u_inverseRadii, startWC))
        {
            discard;
        }
#endif
#if defined(SHOW_INTERSECTION) && !defined(ABOVE_ELLIPSOID_HORIZON)
        if (isOnBoundary(startSensorValue, czm_epsilon3) || isOnBoundary(startHalfspaceValue, czm_epsilon3))
        {
            out_FragColor = getIntersectionColor();
        }
        else
        {
            out_FragColor = getSurfaceColor(horizonCone, startMC, startWC, startEC);
        }
#else
        out_FragColor = getSurfaceColor(horizonCone, startMC, startWC, startEC);
#endif
        setDepth(startEC);
    }
    else
    {
#if defined(SHOW_INTERSECTION) && !defined(ABOVE_ELLIPSOID_HORIZON)
        vec4 startColor;
		if (isOnBoundary(startSensorValue, czm_epsilon3) || isOnBoundary(startHalfspaceValue, czm_epsilon3))
        {
            startColor = getIntersectionColor();
        }
        else
        {
            startColor = getSurfaceColor(horizonCone, startMC, startWC, startEC);
        }
#else
        vec4 startColor = getSurfaceColor(horizonCone, startMC, startWC, startEC);
#endif
#if !defined(SHOW_THROUGH_ELLIPSOID)
        if (inEllipsoidShadow(u_inverseRadii * cameraVertexWC, u_inverseRadii, stopWC))
        {
            out_FragColor = startColor;
        }
        else
#endif
        {
#if defined(SHOW_INTERSECTION) && !defined(ABOVE_ELLIPSOID_HORIZON)
            vec4 stopColor;
            if (isOnBoundary(stopSensorValue, czm_epsilon3) || isOnBoundary(stopHalfspaceValue, czm_epsilon3))
            {
                stopColor = getIntersectionColor();
            }
            else
            {
                stopColor = getSurfaceColor(horizonCone, stopMC, stopWC, stopEC);
            }
#else
            vec4 stopColor = getSurfaceColor(horizonCone, stopMC, stopWC, stopEC);
#endif
            float alpha = 1.0 - (1.0 - stopColor.a) * (1.0 - startColor.a);
            out_FragColor = (alpha == 0.0) ? vec4(0.0) : mix(stopColor.a * stopColor, startColor, startColor.a) / alpha;
            out_FragColor.a = alpha;
        }
        setDepth(startEC);
    }
}
