uniform vec3 u_radii;
uniform vec3 u_inverseRadii;
uniform float u_sensorRadius;
uniform vec3 u_q;

in vec3 v_positionWC;
in vec3 v_positionEC;
in vec3 v_normalEC;

czm_raySegment raySphereIntersectionInterval(czm_ray ray, vec3 sensorVertexEC, float radius)
{
    vec3 point = ray.origin - sensorVertexEC;

    float t2 = dot(point, point);

    float a = 1.0;
    float b = 2.0 * dot(ray.direction, point);
    float c = t2 - radius * radius;

    if (c > 0.0) // Outside sphere.
    {
        if (b > 0.0) // Looking away from sphere.
        {
            return czm_emptyRaySegment;
        }
        else
        {
            float d = b * b - 4.0 * a * c;

            if (d < 0.0) // Imaginary roots.  No intersections.
            {
                return czm_emptyRaySegment;
            }
            else if (d > 0.0) // Distinct real roots.  Two intersections.
            {
                float s = (b == 0.0) ? 1.0 : sign(b);
                float q = -(b + s * sqrt(d)) / 2.0;

                float first = q / a;
                float second = c / q;

                if (second < first)
                {
                    return czm_raySegment(second, first);
                }
                else
                {
                    return czm_raySegment(first, second);
                }
            }
            else // (d == 0.0)  Repeated real roots.  Two intersections.  Looking tangent.
            {
                return czm_emptyRaySegment;
               }
        }
    }
    else if (c < 0.0) // Inside sphere.
    {
        float d = b * b - 4.0 * a * c;

        float s = (b == 0.0) ? 1.0 : sign(b);
        float q = -(b + s * sqrt(d)) / 2.0;

        float first = q / a;
        float second = c / q;
        if (second < first)
        {
            return czm_raySegment(0.0, first);
        }
        else
        {
            return czm_raySegment(0.0, second);
           }
    }
    else // On surface.
    {
        if (b > 0.0) // Looking away from sphere.
        {
            return czm_emptyRaySegment;
        }
        else
        {
            float d = b * b - 4.0 * a * c;

            if (d > 0.0) // Distinct real roots.  Two intersections.
            {
                float s = (b == 0.0) ? 1.0 : sign(b);
                float q = -(b + s * sqrt(d)) / 2.0;

                float first = q / a;
                float second = c / q;

                if (second < first)
                {
                    return czm_raySegment(0.0, first);
                }
                else
                {
                    return czm_raySegment(0.0, second);
                }
            }
            else // (d == 0.0)  Repeated real roots.  Two intersections.  Looking tangent.
            {
                return czm_emptyRaySegment;
               }
        }
    }
}

vec4 getMaterialColor()
{
    czm_materialInput materialInput;
    czm_material material = czm_getMaterial(materialInput);
    return vec4(material.diffuse + material.emission, material.alpha);
}

vec4 getSurfaceColor(vec3 pointMC, vec3 pointEC)
{
    vec3 normalEC = normalize(pointEC);
    normalEC = mix(-normalEC, normalEC, step(0.0, normalEC.z));  // Normal facing viewer
    vec3 positionToEyeEC = -pointEC;

    czm_materialInput materialInput;
    materialInput.st = sensor3dToSphericalTextureCoordinates(pointMC);
    materialInput.str = pointMC / u_sensorRadius;
    materialInput.positionToEyeEC = positionToEyeEC;
    materialInput.normalEC = normalEC;

    czm_material material = czm_getMaterial(materialInput);
    return czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);
}
