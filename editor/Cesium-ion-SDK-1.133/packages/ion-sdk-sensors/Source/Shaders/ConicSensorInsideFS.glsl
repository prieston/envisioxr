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

	float stop = (u_cosineAndSineOfConeAngle.x > 0.0) ? coneInterval.stop : coneInterval.start;
    vec3 stopEC = czm_pointAlongRay(ray, stop);
    vec3 stopWC = (czm_inverseView * vec4(stopEC, 1.0)).xyz;

    vec4 stopCC = czm_projection * vec4(stopEC, 1.0);
    float stopZ = stopCC.z / stopCC.w;

    // Discard in case surface is behind far plane due to depth clamping.
    if ((stopZ < -1.0) || (stopZ > 1.0))
    {
        discard;
    }

    float ellipsoidValue = ellipsoidSurfaceFunction(u_inverseRadii, stopWC);
    float halfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, stopWC);
    float horizonValue = ellipsoidHorizonSurfaceFunction(u_q, u_inverseRadii, stopWC);

#if defined(ABOVE_ELLIPSOID_HORIZON)
    if (horizonValue < 0.0)
    {
        discard;
    }
#elif defined(BELOW_ELLIPSOID_HORIZON)
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
    if (halfspaceValue < 0.0 && horizonValue < 0.0)
    {
        discard;
    }
#endif
#endif
    // PERFORMANCE_IDEA: We can omit this check if the radius is Number.POSITIVE_INFINITY.
    if (distance(stopEC, sensorVertexEC) > u_sensorRadius)
    {
        discard;
    }
    vec3 stopMC = (czm_inverseModelView * vec4(stopEC, 1.0)).xyz;
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
        setDepth(stopEC);
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
        out_FragColor = getSurfaceColor(cone, stopMC, stopWC, stopEC);
    }
#else
    out_FragColor = getSurfaceColor(cone, stopMC, stopWC, stopEC);
#endif
    setDepth(stopEC);
}
