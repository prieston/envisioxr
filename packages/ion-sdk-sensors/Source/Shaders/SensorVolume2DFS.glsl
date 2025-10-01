uniform vec3 u_radii;
uniform vec3 u_inverseRadii;
uniform float u_sensorRadius;
uniform float u_normalDirection;
uniform vec3 u_q;
uniform vec3 u_p;
uniform mat3 u_inverseModel;

in vec3 v_positionEC;
in vec2 v_cartographic;

vec4 getColor(float sensorRadius, vec3 pointEC, vec3 normalEC)
{
    czm_materialInput materialInput;

    vec3 pointMC = (czm_inverseModelView * vec4(pointEC, 1.0)).xyz;
    materialInput.st = sensorCartesianToNormalizedPolarTextureCoordinates(sensorRadius, pointMC);
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
    // Retrieve the cartographic coordinates.
    float longitude = v_cartographic.x;
    float latitude = v_cartographic.y;

    vec2 cosineAndSineLongitude = czm_cosineAndSine(longitude);
    vec2 cosineAndSineLatitude = czm_cosineAndSine(latitude);

    vec3 surfaceNormal = vec3(cosineAndSineLatitude.x * cosineAndSineLongitude.x, cosineAndSineLatitude.x * cosineAndSineLongitude.y, cosineAndSineLatitude.y);
    vec3 surfacePoint = u_radii * normalize(u_radii * surfaceNormal);

    float halfspaceValue = ellipsoidHorizonHalfspaceSurfaceFunction(u_q, u_inverseRadii, surfacePoint);
    if (halfspaceValue < 0.0)
    {
        discard;
    }

    // PERFORMANCE_IDEA: We can omit this check if the radius is Number.POSITIVE_INFINITY.
    vec3 displacement = surfacePoint - u_p;
    float domeValue = (length(displacement) - u_sensorRadius) / u_sensorRadius;
    if (domeValue > 0.0)
    {
        discard;
    }
    vec3 positionMC = u_inverseModel * displacement;
    float sensorValue = sensorSurfaceFunction(positionMC);
    if (sensorValue > 0.0)
    {
        discard;
    }
    if (isOnBoundary(sensorValue, czm_epsilon3) || isOnBoundary(halfspaceValue, czm_epsilon3) || isOnBoundary(domeValue, czm_epsilon3))
    {
        out_FragColor = getIntersectionColor();
    }
    else
    {
        out_FragColor = getColor(u_sensorRadius, v_positionEC, surfaceNormal);
    }
}
