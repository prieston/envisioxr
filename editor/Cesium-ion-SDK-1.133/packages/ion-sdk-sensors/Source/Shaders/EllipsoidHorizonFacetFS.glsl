uniform vec3 u_radii;
uniform vec3 u_inverseRadii;
uniform float u_sensorRadius;
uniform vec3 u_q;
uniform vec3 u_inverseUnitQ;
uniform vec2 u_cosineAndSineOfHalfAperture;

in vec3 v_positionWC;
in vec3 v_positionEC;

struct ellipsoidHorizonCone
{
    vec3 radii;
    vec3 inverseRadii;
    vec3 pointOutsideEllipsoid;
    infiniteCone coneInScaledSpace;
};

vec3 ellipsoidHorizonConeNormal(ellipsoidHorizonCone cone, vec3 pointOnCone)
{
    vec3 pointOnScaledCone = cone.inverseRadii * pointOnCone;

    vec3 scaledNormal = coneNormal(cone.coneInScaledSpace, pointOnScaledCone);

    return normalize(czm_viewRotation * (cone.radii * scaledNormal));
}

ellipsoidHorizonCone ellipsoidHorizonConeNew(vec3 radii, vec3 inverseRadii, vec3 pointOutsideEllipsoid, vec3 q, vec3 axis, float cosineOfHalfAperture, float sineOfHalfAperture)
{
//    vec3 axis = -normalize(q);

//    float x2 = axis.x * axis.x;
//    float y2 = axis.y * axis.y;
//    float z2 = axis.z * axis.z;
//    float xy = axis.x * axis.y;
//    float yz = axis.y * axis.z;
//    float zx = axis.z * axis.x;

    // This is a symmetric matrix.
//    mat3 intersectionMatrix = mat3(
//        cosineSquaredOfHalfAperture - x2, -xy,                              -zx,
//        -xy,                              cosineSquaredOfHalfAperture - y2, -yz,
//        -zx,                              -yz,                              cosineSquaredOfHalfAperture - z2);

    infiniteCone coneInScaledSpace = infiniteCone(q, axis, cosineOfHalfAperture, sineOfHalfAperture);

    return ellipsoidHorizonCone(radii, inverseRadii, pointOutsideEllipsoid, coneInScaledSpace);
}

czm_raySegment rayEllipsoidHorizonConeIntersectionInterval(czm_ray ray, ellipsoidHorizonCone cone)
{
    // Determine the ray in the scaled space.
    vec3 origin = cone.inverseRadii * (czm_inverseView * vec4(ray.origin, 1.0)).xyz;
    vec3 direction = normalize(cone.inverseRadii * (czm_inverseViewRotation * ray.direction));
    czm_ray rayInScaledSpace = czm_ray(origin, direction);

    // Perform the intersection in the scaled space.
    czm_raySegment interval = rayConeIntersectionInterval(rayInScaledSpace, cone.coneInScaledSpace);

    if (czm_isEmpty(interval)) // No intersection.
    {
        return interval;
    }
    else // Intersection.
    {
        // Honor ray origin case (start == 0.0).
        float start = interval.start;
        if (start != 0.0)
        {
            // Determine start in unscaled space.
            vec3 temp = (czm_view * vec4(cone.radii * czm_pointAlongRay(rayInScaledSpace, start), 1.0)).xyz;
            start = dot(temp, ray.direction);
        }

        // Honor infinite ray (stop == infinity).
        float stop = interval.stop;
        if (stop != czm_infinity)
        {
            // Determine stop in unscaled space.
            vec3 temp = (czm_view * vec4(cone.radii * czm_pointAlongRay(rayInScaledSpace, stop), 1.0)).xyz;
            stop = dot(temp, ray.direction);
        }

        return czm_raySegment(start, stop);
    }
}

vec4 getMaterialColor()
{
    czm_materialInput materialInput;
    czm_material material = czm_getMaterial(materialInput);
    return vec4(material.diffuse + material.emission, material.alpha);
}

vec4 getSurfaceColor(ellipsoidHorizonCone cone, vec3 pointMC, vec3 pointWC, vec3 pointEC)
{
    vec3 normalEC = ellipsoidHorizonConeNormal(cone, pointWC);
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
