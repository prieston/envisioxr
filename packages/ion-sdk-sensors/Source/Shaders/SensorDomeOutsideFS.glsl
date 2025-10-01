vec4 getColor(float boundaryValue, vec3 pointMC, vec3 pointEC) {
    vec4 color;
#if defined(SHOW_INTERSECTION) && !defined(ABOVE_ELLIPSOID_HORIZON)
    if (isOnBoundary(boundaryValue, czm_epsilon3))
    {
        color = getIntersectionColor();
    }
    else
    {
        color = getSurfaceColor(pointMC, pointEC);
    }
#else
    color = getSurfaceColor(pointMC, pointEC);
#endif
    return color;
}

void main()
{
#ifdef ONLY_WIRE_FRAME
	out_FragColor = getMaterialColor();
	return;
#endif

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

    czm_raySegment sphereInterval = raySphereIntersectionInterval(ray, sensorVertexEC, u_sensorRadius);
    if (czm_isEmpty(sphereInterval))
    {
        discard;
    }

    vec3 startEC = czm_pointAlongRay(ray, sphereInterval.start);
    vec3 startWC = (czm_inverseView * vec4(startEC, 1.0)).xyz;
    vec3 stopEC = czm_pointAlongRay(ray, sphereInterval.stop);
    vec3 stopWC = (czm_inverseView * vec4(stopEC, 1.0)).xyz;

    float startEllipsoidValue = ellipsoidSurfaceFunction(u_inverseRadii, startWC);
    float stopEllipsoidValue = ellipsoidSurfaceFunction(u_inverseRadii, stopWC);
    float startHalfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, startWC);
    float stopHalfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, stopWC);

    vec3 startMC = (czm_inverseModelView * vec4(startEC, 1.0)).xyz;
    vec3 stopMC = (czm_inverseModelView * vec4(stopEC, 1.0)).xyz;

    float startSensorValue = sensorSurfaceFunction(startMC);
    float stopSensorValue = sensorSurfaceFunction(stopMC);

#if defined(ABOVE_ELLIPSOID_HORIZON)
    float startHorizonValue = ellipsoidHorizonSurfaceFunction(u_q, u_inverseRadii, startWC);
    float stopHorizonValue = ellipsoidHorizonSurfaceFunction(u_q, u_inverseRadii, stopWC);

    bool discardStart = (startSensorValue > 0.0 || startHorizonValue < 0.0);
    bool discardStop = (stopSensorValue > 0.0 || stopHorizonValue < 0.0);
#elif defined(BELOW_ELLIPSOID_HORIZON)
    float startHorizonValue = ellipsoidHorizonSurfaceFunction(u_q, u_inverseRadii, startWC);
    float stopHorizonValue = ellipsoidHorizonSurfaceFunction(u_q, u_inverseRadii, stopWC);

#if !defined(SHOW_THROUGH_ELLIPSOID)
    bool discardStart = (startSensorValue > 0.0 || startEllipsoidValue < 0.0 || startHorizonValue > 0.0 || startHalfspaceValue < 0.0);
    bool discardStop = (stopSensorValue > 0.0 || stopEllipsoidValue < 0.0 || stopHorizonValue > 0.0 || stopHalfspaceValue < 0.0);
#else
    bool discardStart = (startSensorValue > 0.0 || startHorizonValue > 0.0);
    bool discardStop = (stopSensorValue > 0.0 || stopHorizonValue > 0.0);
#endif
#else //defined(COMPLETE)
#if !defined(SHOW_THROUGH_ELLIPSOID)
    float startHorizonValue = ellipsoidHorizonSurfaceFunction(u_q, u_inverseRadii, startWC);
    float stopHorizonValue = ellipsoidHorizonSurfaceFunction(u_q, u_inverseRadii, stopWC);

    bool discardStart = (startSensorValue > 0.0 || startEllipsoidValue < 0.0 || (startHorizonValue < 0.0 && startHalfspaceValue < 0.0));
    bool discardStop = (stopSensorValue > 0.0 || stopEllipsoidValue < 0.0 || (stopHorizonValue < 0.0 && stopHalfspaceValue < 0.0));
#else
    bool discardStart = (startSensorValue > 0.0);
    bool discardStop = (stopSensorValue > 0.0);
#endif
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
#if (defined(ENVIRONMENT_CONSTRAINT) && !defined(SHOW_ENVIRONMENT_OCCLUSION)) || defined(SHOW_ENVIRONMENT_INTERSECTION)
        float depth;
        bool isInShadow = getShadowVisibility(stopEC, depth);
#endif
#if defined(ENVIRONMENT_CONSTRAINT) && !defined(SHOW_ENVIRONMENT_OCCLUSION)
        if (isInShadow)
        {
            discard;
        }
#endif
#if defined(SHOW_ENVIRONMENT_INTERSECTION)
        if (showShadowIntersectionPoint(stopEC, depth, u_environmentIntersectionWidth))
        {
            out_FragColor = getEnvironmentIntersectionColor();
            setDepth(stopEC);
            return;
        }
#endif
        out_FragColor = getColor(stopEllipsoidValue, stopMC, stopEC);
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
#if (defined(ENVIRONMENT_CONSTRAINT) && !defined(SHOW_ENVIRONMENT_OCCLUSION)) || defined(SHOW_ENVIRONMENT_INTERSECTION)
        float depth;
        bool isInShadow = getShadowVisibility(startEC, depth);
#endif
#if defined(ENVIRONMENT_CONSTRAINT) && !defined(SHOW_ENVIRONMENT_OCCLUSION)
        if (isInShadow)
        {
            discard;
        }
#endif
#if defined(SHOW_ENVIRONMENT_INTERSECTION)
        if (showShadowIntersectionPoint(startEC, depth, u_environmentIntersectionWidth))
        {
            out_FragColor = getEnvironmentIntersectionColor();
            setDepth(startEC);
            return;
        }
#endif
        out_FragColor = getColor(startEllipsoidValue, startMC, startEC);
	    setDepth(startEC);
    }
    else
    {
#if (defined(ENVIRONMENT_CONSTRAINT) && !defined(SHOW_ENVIRONMENT_OCCLUSION)) || defined(SHOW_ENVIRONMENT_INTERSECTION)
        float depth0;
        float depth1;
        bool startVisibility = getShadowVisibility(startEC, depth0);
        bool stopVisibility = getShadowVisibility(stopEC, depth1);
#endif
#if defined(SHOW_ENVIRONMENT_INTERSECTION)
        vec4 startColor;
        if (showShadowIntersectionPoint(startEC, depth0, u_environmentIntersectionWidth))
        {
            startColor = getEnvironmentIntersectionColor();
        }
        else
        {
            startColor = getColor(startEllipsoidValue, startMC, startEC);
        }
#else
        vec4 startColor = getColor(startEllipsoidValue, startMC, startEC);
#endif
#if !defined(SHOW_THROUGH_ELLIPSOID)
        if (inEllipsoidShadow(u_inverseRadii * cameraVertexWC, u_inverseRadii, stopWC))
        {
            out_FragColor = startColor;
        }
        else
#endif
        {
#if defined(SHOW_ENVIRONMENT_INTERSECTION)
            vec4 stopColor;
            if (showShadowIntersectionPoint(stopEC, depth1, u_environmentIntersectionWidth))
            {
                stopColor = getEnvironmentIntersectionColor();
            }
            else
            {
                stopColor = getColor(stopEllipsoidValue, stopMC, stopEC);
            }
#else
            vec4 stopColor = getColor(stopEllipsoidValue, stopMC, stopEC);
#endif

#if defined(ENVIRONMENT_CONSTRAINT) && !defined(SHOW_ENVIRONMENT_OCCLUSION)
            if (startVisibility && stopVisibility)
            {
                discard;
            }
            else if (startVisibility)
            {
                out_FragColor = stopColor;
            }
            else if (stopVisibility)
            {
                out_FragColor = startColor;
            }
            else
#endif
            {
                float alpha = 1.0 - (1.0 - stopColor.a) * (1.0 - startColor.a);
                out_FragColor = (alpha == 0.0) ? vec4(0.0) : mix(stopColor.a * stopColor, startColor, startColor.a) / alpha;
                out_FragColor.a = alpha;
            }
        }
        setDepth(startEC);
    }
}
