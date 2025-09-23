//This file is automatically rebuilt by the Cesium build process.
export default "uniform vec3 u_radii;\n\
uniform vec3 u_inverseRadii;\n\
uniform float u_sensorRadius;\n\
uniform vec3 u_q;\n\
\n\
in vec3 v_positionWC;\n\
in vec3 v_positionEC;\n\
in vec3 v_normalEC;\n\
\n\
czm_raySegment raySphereIntersectionInterval(czm_ray ray, vec3 sensorVertexEC, float radius)\n\
{\n\
    vec3 point = ray.origin - sensorVertexEC;\n\
\n\
    float t2 = dot(point, point);\n\
\n\
    float a = 1.0;\n\
    float b = 2.0 * dot(ray.direction, point);\n\
    float c = t2 - radius * radius;\n\
\n\
    if (c > 0.0) // Outside sphere.\n\
    {\n\
        if (b > 0.0) // Looking away from sphere.\n\
        {\n\
            return czm_emptyRaySegment;\n\
        }\n\
        else\n\
        {\n\
            float d = b * b - 4.0 * a * c;\n\
\n\
            if (d < 0.0) // Imaginary roots.  No intersections.\n\
            {\n\
                return czm_emptyRaySegment;\n\
            }\n\
            else if (d > 0.0) // Distinct real roots.  Two intersections.\n\
            {\n\
                float s = (b == 0.0) ? 1.0 : sign(b);\n\
                float q = -(b + s * sqrt(d)) / 2.0;\n\
\n\
                float first = q / a;\n\
                float second = c / q;\n\
\n\
                if (second < first)\n\
                {\n\
                    return czm_raySegment(second, first);\n\
                }\n\
                else\n\
                {\n\
                    return czm_raySegment(first, second);\n\
                }\n\
            }\n\
            else // (d == 0.0)  Repeated real roots.  Two intersections.  Looking tangent.\n\
            {\n\
                return czm_emptyRaySegment;\n\
               }\n\
        }\n\
    }\n\
    else if (c < 0.0) // Inside sphere.\n\
    {\n\
        float d = b * b - 4.0 * a * c;\n\
\n\
        float s = (b == 0.0) ? 1.0 : sign(b);\n\
        float q = -(b + s * sqrt(d)) / 2.0;\n\
\n\
        float first = q / a;\n\
        float second = c / q;\n\
        if (second < first)\n\
        {\n\
            return czm_raySegment(0.0, first);\n\
        }\n\
        else\n\
        {\n\
            return czm_raySegment(0.0, second);\n\
           }\n\
    }\n\
    else // On surface.\n\
    {\n\
        if (b > 0.0) // Looking away from sphere.\n\
        {\n\
            return czm_emptyRaySegment;\n\
        }\n\
        else\n\
        {\n\
            float d = b * b - 4.0 * a * c;\n\
\n\
            if (d > 0.0) // Distinct real roots.  Two intersections.\n\
            {\n\
                float s = (b == 0.0) ? 1.0 : sign(b);\n\
                float q = -(b + s * sqrt(d)) / 2.0;\n\
\n\
                float first = q / a;\n\
                float second = c / q;\n\
\n\
                if (second < first)\n\
                {\n\
                    return czm_raySegment(0.0, first);\n\
                }\n\
                else\n\
                {\n\
                    return czm_raySegment(0.0, second);\n\
                }\n\
            }\n\
            else // (d == 0.0)  Repeated real roots.  Two intersections.  Looking tangent.\n\
            {\n\
                return czm_emptyRaySegment;\n\
               }\n\
        }\n\
    }\n\
}\n\
\n\
vec4 getMaterialColor()\n\
{\n\
    czm_materialInput materialInput;\n\
    czm_material material = czm_getMaterial(materialInput);\n\
    return vec4(material.diffuse + material.emission, material.alpha);\n\
}\n\
\n\
vec4 getSurfaceColor(vec3 pointMC, vec3 pointEC)\n\
{\n\
    vec3 normalEC = normalize(pointEC);\n\
    normalEC = mix(-normalEC, normalEC, step(0.0, normalEC.z));  // Normal facing viewer\n\
    vec3 positionToEyeEC = -pointEC;\n\
\n\
    czm_materialInput materialInput;\n\
    materialInput.st = sensor3dToSphericalTextureCoordinates(pointMC);\n\
    materialInput.str = pointMC / u_sensorRadius;\n\
    materialInput.positionToEyeEC = positionToEyeEC;\n\
    materialInput.normalEC = normalEC;\n\
\n\
    czm_material material = czm_getMaterial(materialInput);\n\
    return czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);\n\
}\n\
";
