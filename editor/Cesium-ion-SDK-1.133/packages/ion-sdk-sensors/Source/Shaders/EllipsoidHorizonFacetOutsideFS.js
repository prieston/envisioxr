//This file is automatically rebuilt by the Cesium build process.
export default "void main()\n\
{\n\
#ifdef ONLY_WIRE_FRAME\n\
	out_FragColor = getMaterialColor();\n\
	return;\n\
#endif\n\
\n\
    vec3 sensorVertexWC = czm_model[3].xyz;\n\
    vec3 sensorVertexEC = czm_modelView[3].xyz;\n\
\n\
    // Ray from eye to fragment in eye coordinates\n\
    czm_ray ray;\n\
    if (!czm_isZeroMatrix(czm_inverseProjection))\n\
    {\n\
        ray = czm_ray(vec3(0.0), normalize(v_positionEC));\n\
    }\n\
    else\n\
    {\n\
        ray = czm_ray(vec3(v_positionEC.xy, 0.0), vec3(0.0, 0.0, -1.0));\n\
    }\n\
\n\
    ellipsoidHorizonCone horizonCone = ellipsoidHorizonConeNew(u_radii, u_inverseRadii, sensorVertexWC, u_q, u_inverseUnitQ, u_cosineAndSineOfHalfAperture.x, u_cosineAndSineOfHalfAperture.y);\n\
    czm_raySegment horizonConeInterval = rayEllipsoidHorizonConeIntersectionInterval(ray, horizonCone);\n\
    if (czm_isEmpty(horizonConeInterval))\n\
    {\n\
        discard;\n\
    }\n\
\n\
    vec3 startEC = czm_pointAlongRay(ray, horizonConeInterval.start);\n\
    vec3 startWC = (czm_inverseView * vec4(startEC, 1.0)).xyz;\n\
    vec3 stopEC = czm_pointAlongRay(ray, horizonConeInterval.stop);\n\
    vec3 stopWC = (czm_inverseView * vec4(stopEC, 1.0)).xyz;\n\
\n\
    vec3 startMC = (czm_inverseModel * vec4(startWC, 1.0)).xyz;\n\
    float startSensorValue = sensorSurfaceFunction(startMC);\n\
    vec3 stopMC = (czm_inverseModel * vec4(stopWC, 1.0)).xyz;\n\
    float stopSensorValue = sensorSurfaceFunction(stopMC);\n\
\n\
    // PERFORMANCE_IDEA: We can omit this check if the radius is Number.POSITIVE_INFINITY.\n\
    float startSphereValue = distance(startEC, sensorVertexEC) - u_sensorRadius;\n\
    float stopSphereValue = distance(stopEC, sensorVertexEC) - u_sensorRadius;\n\
\n\
#if defined(ABOVE_ELLIPSOID_HORIZON)\n\
    bool discardStart = (startSensorValue > 0.0 || startSphereValue > 0.0);\n\
    bool discardStop = (stopSensorValue > 0.0 || stopSphereValue > 0.0);\n\
#elif defined(BELOW_ELLIPSOID_HORIZON)\n\
    float startHalfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, startWC);\n\
    float stopHalfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, stopWC);\n\
#if !defined(SHOW_THROUGH_ELLIPSOID)\n\
    bool discardStart = (startHalfspaceValue < 0.0 || startSensorValue > 0.0 || startSphereValue > 0.0);\n\
    bool discardStop = (stopHalfspaceValue < 0.0 || stopSensorValue > 0.0 || stopSphereValue > 0.0);\n\
#else\n\
    bool discardStart = (startSensorValue > 0.0 || startSphereValue > 0.0);\n\
    bool discardStop = (stopSensorValue > 0.0 || stopSphereValue > 0.0);\n\
#endif\n\
#else //defined(COMPLETE)\n\
    float startHalfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, startWC);\n\
    float stopHalfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, stopWC);\n\
\n\
    bool discardStart = (startHalfspaceValue > 0.0 || startSensorValue > 0.0 || startSphereValue > 0.0);\n\
    bool discardStop = (stopHalfspaceValue > 0.0 || stopSensorValue > 0.0 || stopSphereValue > 0.0);\n\
#endif\n\
\n\
    vec4 startCC = czm_projection * vec4(startEC, 1.0);\n\
    float startZ = startCC.z / startCC.w;\n\
\n\
    vec4 stopCC = czm_projection * vec4(stopEC, 1.0);\n\
    float stopZ = stopCC.z / stopCC.w;\n\
\n\
    // Discard in case surface is behind far plane due to depth clamping.\n\
    discardStart = discardStart || (startZ < -1.0) || (startZ > 1.0);\n\
    discardStop = discardStop || (stopZ < -1.0) || (stopZ > 1.0);\n\
\n\
    vec3 cameraVertexWC;\n\
    if (!czm_isZeroMatrix(czm_inverseProjection))\n\
    {\n\
        cameraVertexWC = czm_inverseView[3].xyz;\n\
    }\n\
    else\n\
    {\n\
        cameraVertexWC = (czm_inverseView * vec4(v_positionEC.xy, 0.0, 1.0)).xyz;\n\
    }\n\
\n\
    if (discardStart && discardStop)\n\
    {\n\
        discard;\n\
    }\n\
    else if (discardStart)\n\
    {\n\
#if !defined(SHOW_THROUGH_ELLIPSOID)\n\
        if (inEllipsoidShadow(u_inverseRadii * cameraVertexWC, u_inverseRadii, stopWC))\n\
        {\n\
            discard;\n\
        }\n\
#endif\n\
#if defined(SHOW_INTERSECTION) && !defined(ABOVE_ELLIPSOID_HORIZON)\n\
        if (isOnBoundary(stopSensorValue, czm_epsilon3) || isOnBoundary(stopHalfspaceValue, czm_epsilon3))\n\
        {\n\
            out_FragColor = getIntersectionColor();\n\
        }\n\
        else\n\
        {\n\
            out_FragColor = getSurfaceColor(horizonCone, stopMC, stopWC, stopEC);\n\
        }\n\
#else\n\
        out_FragColor = getSurfaceColor(horizonCone, stopMC, stopWC, stopEC);\n\
#endif\n\
        setDepth(stopEC);\n\
    }\n\
    else if (discardStop)\n\
    {\n\
#if !defined(SHOW_THROUGH_ELLIPSOID)\n\
        if (inEllipsoidShadow(u_inverseRadii * cameraVertexWC, u_inverseRadii, startWC))\n\
        {\n\
            discard;\n\
        }\n\
#endif\n\
#if defined(SHOW_INTERSECTION) && !defined(ABOVE_ELLIPSOID_HORIZON)\n\
        if (isOnBoundary(startSensorValue, czm_epsilon3) || isOnBoundary(startHalfspaceValue, czm_epsilon3))\n\
        {\n\
            out_FragColor = getIntersectionColor();\n\
        }\n\
        else\n\
        {\n\
            out_FragColor = getSurfaceColor(horizonCone, startMC, startWC, startEC);\n\
        }\n\
#else\n\
        out_FragColor = getSurfaceColor(horizonCone, startMC, startWC, startEC);\n\
#endif\n\
        setDepth(startEC);\n\
    }\n\
    else\n\
    {\n\
#if defined(SHOW_INTERSECTION) && !defined(ABOVE_ELLIPSOID_HORIZON)\n\
        vec4 startColor;\n\
		if (isOnBoundary(startSensorValue, czm_epsilon3) || isOnBoundary(startHalfspaceValue, czm_epsilon3))\n\
        {\n\
            startColor = getIntersectionColor();\n\
        }\n\
        else\n\
        {\n\
            startColor = getSurfaceColor(horizonCone, startMC, startWC, startEC);\n\
        }\n\
#else\n\
        vec4 startColor = getSurfaceColor(horizonCone, startMC, startWC, startEC);\n\
#endif\n\
#if !defined(SHOW_THROUGH_ELLIPSOID)\n\
        if (inEllipsoidShadow(u_inverseRadii * cameraVertexWC, u_inverseRadii, stopWC))\n\
        {\n\
            out_FragColor = startColor;\n\
        }\n\
        else\n\
#endif\n\
        {\n\
#if defined(SHOW_INTERSECTION) && !defined(ABOVE_ELLIPSOID_HORIZON)\n\
            vec4 stopColor;\n\
            if (isOnBoundary(stopSensorValue, czm_epsilon3) || isOnBoundary(stopHalfspaceValue, czm_epsilon3))\n\
            {\n\
                stopColor = getIntersectionColor();\n\
            }\n\
            else\n\
            {\n\
                stopColor = getSurfaceColor(horizonCone, stopMC, stopWC, stopEC);\n\
            }\n\
#else\n\
            vec4 stopColor = getSurfaceColor(horizonCone, stopMC, stopWC, stopEC);\n\
#endif\n\
            float alpha = 1.0 - (1.0 - stopColor.a) * (1.0 - startColor.a);\n\
            out_FragColor = (alpha == 0.0) ? vec4(0.0) : mix(stopColor.a * stopColor, startColor, startColor.a) / alpha;\n\
            out_FragColor.a = alpha;\n\
        }\n\
        setDepth(startEC);\n\
    }\n\
}\n\
";
