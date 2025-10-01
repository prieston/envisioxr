uniform vec3 u_radii;
uniform vec3 u_inverseRadii;
uniform float u_sensorRadius;
uniform vec3 u_q;

in vec3 v_positionWC;
in vec3 v_positionEC;

vec4 getMaterialColor()
{
    czm_materialInput materialInput;
    czm_material material = czm_getMaterial(materialInput);
    return vec4(material.diffuse + material.emission, material.alpha);
}

void main()
{
    vec2 coords = gl_FragCoord.xy / czm_viewport.zw;
    float depth = czm_unpackDepth(texture(czm_globeDepthTexture, coords));

    if (depth == 0.0) // 0.0 is the clear value for the depth texture
    {
        discard;
    }

    vec4 positionEC = czm_windowToEyeCoordinates(gl_FragCoord.xy, depth);
    positionEC /= positionEC.w;

    vec4 positionWC = czm_inverseView * positionEC;
    vec4 positionMC = czm_inverseModelView * positionEC;
    vec3 sensorVertexEC = czm_modelView[3].xyz;

    // PERFORMANCE_IDEA: We can omit this check if the radius is Number.POSITIVE_INFINITY.
    if (distance(positionEC.xyz, sensorVertexEC) > u_sensorRadius)
    {
        discard;
    }

#ifndef SHOW_THROUGH_ELLIPSOID
    float halfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, positionWC.xyz);
    if (halfspaceValue < 0.0)
    {
        discard;
    }
#endif

    float sensorValue = sensorSurfaceFunction(positionMC.xyz);
    if (sensorValue > 0.0)
    {
        discard;
    }

#if defined(VIEWSHED)
    out_FragColor = getViewshedColor(positionEC.xyz, depth);
#else
    out_FragColor = getMaterialColor();
#endif
}
