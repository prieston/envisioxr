uniform vec3 u_radii;
uniform vec3 u_inverseRadii;
uniform float u_sensorRadius;
uniform vec3 u_q;
uniform vec2 u_cosineAndSineOfConeAngle;

in vec3 v_positionWC;
in vec3 v_positionEC;

vec4 getMaterialColor()
{
    czm_materialInput materialInput;
    czm_material material = czm_getMaterial(materialInput);
    return vec4(material.diffuse + material.emission, material.alpha);
}

vec4 getSurfaceColor(infiniteCone cone, vec3 pointMC, vec3 pointWC, vec3 pointEC)
{
    vec3 normalEC = coneNormal(cone, pointEC);
    normalEC = mix(-normalEC, normalEC, step(0.0, normalEC.z));  // Normal facing viewer
    vec3 positionToEyeEC = -pointEC;

    czm_materialInput materialInput;
    materialInput.st = sensorCartesianToNormalizedPolarTextureCoordinates(u_sensorRadius, pointMC);
    materialInput.str = pointMC / u_sensorRadius;
    materialInput.positionToEyeEC = positionToEyeEC;
    materialInput.normalEC = normalEC;

    czm_material material = czm_getMaterial(materialInput);
    return czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);
}

vec4 getColor(float ellipsoidValue, float halfspaceValue, infiniteCone cone, vec3 pointMC, vec3 pointWC, vec3 pointEC)
{
    vec4 color;
#if defined(SHOW_INTERSECTION) && !defined(ABOVE_ELLIPSOID_HORIZON)
    // Notes: Each surface functions should have an associated tolerance based on the floating point error.
    if (isOnBoundary(ellipsoidValue, czm_epsilon3) && (halfspaceValue > 0.0))
    {
        color = getIntersectionColor();
    }
    else
    {
        color = getSurfaceColor(cone, pointMC, pointWC, pointEC);
    }
#else
    color = getSurfaceColor(cone, pointMC, pointWC, pointEC);
#endif
    return color;
}

void main()
{
#ifdef ONLY_WIRE_FRAME
	out_FragColor = getMaterialColor();
	return;
#endif

    vec3 sensorVertexWC = czm_model[3].xyz;
    vec3 sensorVertexEC = czm_modelView[3].xyz;
    vec3 sensorAxisEC = czm_modelView[2].xyz;

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

    infiniteCone cone = infiniteConeNew(sensorVertexEC, sensorAxisEC, u_cosineAndSineOfConeAngle.x, u_cosineAndSineOfConeAngle.y);
    czm_raySegment coneInterval = rayConeIntersectionInterval(ray, cone);
    if (czm_isEmpty(coneInterval))
    {
        discard;
    }

    vec3 startEC = czm_pointAlongRay(ray, coneInterval.start);
    vec3 startWC = (czm_inverseView * vec4(startEC, 1.0)).xyz;
    vec3 stopEC = czm_pointAlongRay(ray, coneInterval.stop);
    vec3 stopWC = (czm_inverseView * vec4(stopEC, 1.0)).xyz;

    vec3 startMC = (czm_inverseModelView * vec4(startEC, 1.0)).xyz;
    vec3 stopMC = (czm_inverseModelView * vec4(stopEC, 1.0)).xyz;

    float startSensorValue = sensorSurfaceFunction(startMC);
    float stopSensorValue = sensorSurfaceFunction(stopMC);

    // PERFORMANCE_IDEA: We can omit this check if the radius is Number.POSITIVE_INFINITY.
    float startSphereValue = distance(startEC, sensorVertexEC) - u_sensorRadius;
    float stopSphereValue = distance(stopEC, sensorVertexEC) - u_sensorRadius;

    float startEllipsoidValue = ellipsoidSurfaceFunction(u_inverseRadii, startWC);
    float stopEllipsoidValue = ellipsoidSurfaceFunction(u_inverseRadii, stopWC);

    float startHalfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, startWC);
    float stopHalfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, stopWC);

    float startHorizonValue = ellipsoidHorizonSurfaceFunction(u_q, u_inverseRadii, startWC);
    float stopHorizonValue = ellipsoidHorizonSurfaceFunction(u_q, u_inverseRadii, stopWC);

    vec3 cameraVertexWC;
    if (!czm_isZeroMatrix(czm_inverseProjection))
    {
        cameraVertexWC = czm_inverseView[3].xyz;
    }
    else
    {
        cameraVertexWC = (czm_inverseView * vec4(v_positionEC.xy, 0.0, 1.0)).xyz;
    }

#if defined(ABOVE_ELLIPSOID_HORIZON)
    bool discardStart = (startHorizonValue < 0.0 || startSensorValue > 0.0 || startSphereValue > 0.0);
    bool discardStop = (stopHorizonValue < 0.0 || stopSensorValue > 0.0 || stopSphereValue > 0.0);
#elif defined(BELOW_ELLIPSOID_HORIZON)
#if !defined(SHOW_THROUGH_ELLIPSOID)
    bool discardStart = (startHorizonValue > 0.0 || startHalfspaceValue < 0.0 || startEllipsoidValue < 0.0 || startSensorValue > 0.0 || startSphereValue > 0.0);
    bool discardStop = (stopHorizonValue > 0.0 || stopHalfspaceValue < 0.0 || stopEllipsoidValue < 0.0 || stopSensorValue > 0.0 || stopSphereValue > 0.0);
#else
    bool discardStart = (startHorizonValue > 0.0 || startSensorValue > 0.0 || startSphereValue > 0.0);
    bool discardStop = (stopHorizonValue > 0.0 || stopSensorValue > 0.0 || stopSphereValue > 0.0);
#endif
#else //defined(COMPLETE)
#if !defined(SHOW_THROUGH_ELLIPSOID)
    bool discardStart = ((startHorizonValue < 0.0 && startHalfspaceValue < 0.0) || startEllipsoidValue < 0.0 || startSensorValue > 0.0 || startSphereValue > 0.0);
    bool discardStop = ((stopHorizonValue < 0.0 && stopHalfspaceValue < 0.0) || stopEllipsoidValue < 0.0 || stopSensorValue > 0.0 || stopSphereValue > 0.0);
#else
    bool discardStart = (startSensorValue > 0.0 || startSphereValue > 0.0);
    bool discardStop = (stopSensorValue > 0.0 || stopSphereValue > 0.0);
#endif
#endif

    vec4 startCC = czm_projection * vec4(startEC, 1.0);
    float startZ = startCC.z / startCC.w;

    vec4 stopCC = czm_projection * vec4(stopEC, 1.0);
    float stopZ = stopCC.z / stopCC.w;

    // Discard in case surface is behind far plane due to depth clamping.
    discardStart = discardStart || (startZ < -1.0) || (startZ > 1.0);
    discardStop = discardStop || (stopZ < -1.0) || (stopZ > 1.0);

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
        out_FragColor = getColor(stopEllipsoidValue, stopHalfspaceValue, cone, stopMC, stopWC, stopEC);
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
        out_FragColor = getColor(startEllipsoidValue, startHalfspaceValue, cone, startMC, startWC, startEC);
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
            startColor = getColor(startEllipsoidValue, startHalfspaceValue, cone, startMC, startWC, startEC);
        }
#else
        vec4 startColor = getColor(startEllipsoidValue, startHalfspaceValue, cone, startMC, startWC, startEC);
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
                stopColor = getColor(stopEllipsoidValue, stopHalfspaceValue, cone, stopMC, stopWC, stopEC);
            }
#else
            vec4 stopColor = getColor(stopEllipsoidValue, stopHalfspaceValue, cone, stopMC, stopWC, stopEC);
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
