//This file is automatically rebuilt by the Cesium build process.
export default "struct infiniteCone\n\
{\n\
    vec3 vertex;\n\
    vec3 axis;          // Unit-length direction vector\n\
    float cosineOfHalfAperture;\n\
    float sineOfHalfAperture;\n\
};\n\
\n\
infiniteCone infiniteConeNew(vec3 vertex, vec3 axis, float cosineOfHalfAperture, float sineOfHalfAperture)\n\
{\n\
    return infiniteCone(vertex, axis, cosineOfHalfAperture, sineOfHalfAperture);\n\
}\n\
\n\
vec3 coneNormal(infiniteCone cone, vec3 pointOnCone)\n\
{\n\
    vec3 s = pointOnCone - cone.vertex;     // Vector from the origin is at (vertex + s)\n\
    vec3 sUnit = normalize(s);\n\
    return normalize((cone.cosineOfHalfAperture * sUnit - cone.axis) / cone.sineOfHalfAperture);\n\
}\n\
\n\
czm_raySegment rayConeIntersectionInterval(czm_ray ray, infiniteCone cone)\n\
{\n\
    vec3 temp = ray.origin - cone.vertex;\n\
\n\
    float t2 = dot(temp, temp);\n\
\n\
    float cosineNu = dot(ray.direction, cone.axis);\n\
\n\
    if (t2 == 0.0) // At vertex.\n\
    {\n\
        if (cosineNu >= cone.cosineOfHalfAperture) // Looking inward or along surface.\n\
        {\n\
            return czm_fullRaySegment;\n\
        }\n\
        else // Looking outward.\n\
        {\n\
            return czm_emptyRaySegment;\n\
        }\n\
    }\n\
    else // Not at vertex\n\
    {\n\
        vec3 t = normalize(temp);\n\
\n\
        float projection = dot(t, cone.axis);\n\
\n\
        if (projection == cone.cosineOfHalfAperture) // On surface.\n\
        {\n\
            vec3 u = ray.direction;\n\
\n\
            mat3 crossProductMatrix = mat3(0.0, -u.z, u.y,\n\
                                            u.z, 0.0, -u.x,\n\
                                           -u.y, u.x, 0.0);\n\
            if (length(crossProductMatrix * temp) == 0.0) // Looking along surface.\n\
            {\n\
                if (dot(temp, u) > 0.0) // Looking away from vertex.\n\
                {\n\
                    return czm_fullRaySegment;\n\
                }\n\
                else // Looking toward vertex.\n\
                {\n\
                    return czm_raySegment(0.0, length(temp));\n\
                }\n\
            }\n\
            else // Looking tangent at surface.\n\
            {\n\
                return czm_emptyRaySegment;\n\
            }\n\
        }\n\
        else // Not on surface\n\
        {\n\
            float cosineAlpha2 = cone.cosineOfHalfAperture * cone.cosineOfHalfAperture;\n\
\n\
            float cosineTau = dot(t, cone.axis);\n\
            float cosineDelta = dot(t, ray.direction);\n\
\n\
            float cosineNu2 = cosineNu * cosineNu;\n\
            float cosineTau2 = cosineTau * cosineTau;\n\
\n\
            float stuff = cosineTau * cosineNu;\n\
\n\
            float positiveTerm = cosineNu2 + cosineTau2;\n\
            float negativeTerm = (cosineDelta * cosineDelta - 1.0) * cosineAlpha2;\n\
            float signedTerm = -2.0 * stuff * cosineDelta;\n\
\n\
            if (signedTerm > 0.0)\n\
            {\n\
                positiveTerm = positiveTerm + signedTerm;\n\
            }\n\
            else if (signedTerm < 0.0)\n\
            {\n\
                negativeTerm = negativeTerm + signedTerm;\n\
            }\n\
\n\
            float d = 4.0 * cosineAlpha2 * (positiveTerm + negativeTerm);\n\
\n\
            if (d < 0.0) // Imaginary roots.  No intersections.\n\
            {\n\
                if (cone.cosineOfHalfAperture < 0.0) // Obtuse cone.\n\
                {\n\
                    return czm_fullRaySegment;\n\
                }\n\
                else // Acute cone.\n\
                {\n\
                    return czm_emptyRaySegment;\n\
                }\n\
            }\n\
            else if (d > 0.0) // Distinct real roots.  Two intersections.\n\
            {\n\
                float a = cosineNu2 - cosineAlpha2;\n\
                float c = cosineTau2 - cosineAlpha2;\n\
                float b = 2.0 * (stuff - cosineDelta * cosineAlpha2);\n\
\n\
                float s = (b == 0.0) ? 1.0 : sign(b);\n\
                float q = -(b + s * sqrt(d)) / 2.0;\n\
\n\
                float first = q / a;\n\
                float second = c / q;\n\
                if (second < first)\n\
                {\n\
                    float thing = first;\n\
                    first = second;\n\
                    second = thing;\n\
                }\n\
\n\
                // Check roots to ensure that they are non-negative and intersect the desired nape of the cone.\n\
                bool isPlane = (abs(cone.cosineOfHalfAperture) < czm_epsilon7);\n\
                bool firstTest = (first >= 0.0) && (isPlane || !(sign(dot(t + first * ray.direction, cone.axis)) == -sign(cone.cosineOfHalfAperture)));\n\
                bool secondTest = (second >= 0.0) && (isPlane || !(sign(dot(t + second * ray.direction, cone.axis)) == -sign(cone.cosineOfHalfAperture)));\n\
\n\
                float m = sqrt(t2);\n\
\n\
                if (cosineTau > cone.cosineOfHalfAperture) // Inside cone.\n\
                {\n\
                    if (firstTest && secondTest)\n\
                    {\n\
                        // Only for non-convex cone.\n\
                        return czm_raySegment(m * first, m * second);\n\
                    }\n\
                    else if (firstTest)\n\
                    {\n\
                        // Ray starts inside cone and exits.\n\
                        return czm_raySegment(0.0, m * first);\n\
                    }\n\
                    else if (secondTest)\n\
                    {\n\
                        // Ray starts inside cone and exits.\n\
                        return czm_raySegment(0.0, m * second);\n\
                    }\n\
                    else\n\
                    {\n\
                        // Ray starts inside cone and never exits.\n\
                        return czm_fullRaySegment;\n\
                    }\n\
                }\n\
                else\n\
                {\n\
                    if (firstTest && secondTest)\n\
                    {\n\
                        // Ray enters and exits.\n\
                        return czm_raySegment(m * first, m * second);\n\
                    }\n\
                    else if (firstTest)\n\
                    {\n\
                        // Ray enters and never exits.\n\
                        return czm_raySegment(m * first, czm_infinity);\n\
                    }\n\
                    else if (secondTest)\n\
                    {\n\
                        // Ray enters and never exits.\n\
                        return czm_raySegment(m * second, czm_infinity);\n\
                    }\n\
                    else\n\
                    {\n\
                        // Ray never enters.\n\
                        return czm_emptyRaySegment;\n\
                    }\n\
                }\n\
            }\n\
            else // (d == 0.0)  Repeated real roots.  Two intersections.\n\
            {\n\
                if (cone.cosineOfHalfAperture == 0.0) // Planar cone.\n\
                {\n\
                    if (cosineTau >= 0.0) // Inside or on surface.\n\
                    {\n\
                        if (cosineNu >= 0.0) // Looking inward or tangent.\n\
                        {\n\
                            // Ray starts inside cone and never exits.\n\
                            return czm_fullRaySegment;\n\
                        }\n\
                        else\n\
                        {\n\
                            // Ray starts inside cone and intersects.\n\
                            return czm_raySegment(0.0, -sqrt(t2) * cosineTau / cosineNu);\n\
                        }\n\
                    }\n\
                    else // Outside.\n\
                    {\n\
                        if (cosineNu <= 0.0) // Looking outward or tangent.\n\
                        {\n\
                            // Ray starts outside cone and never enters.\n\
                            return czm_emptyRaySegment;\n\
                        }\n\
                        else\n\
                        {\n\
                            // Ray starts outside cone and intersects.\n\
                            return czm_raySegment(-sqrt(t2) * cosineTau / cosineNu, czm_infinity);\n\
                        }\n\
                    }\n\
                }\n\
                else\n\
                {\n\
                    float a = cosineNu2 - cosineAlpha2;\n\
                    float c = cosineTau2 - cosineAlpha2;\n\
                    float b = 2.0 * (stuff - cosineDelta * cosineAlpha2);\n\
\n\
                    float root = (a == 0.0) ? -sign(b) * czm_infinity : (-sign(b) / sign(a)) * sqrt(c / a);\n\
\n\
                    // Check roots to ensure that they are non-negative and intersect the desired nape of the cone.\n\
	                bool isPlane = (abs(cone.cosineOfHalfAperture) < czm_epsilon7);\n\
                    bool rootTest = (root >= 0.0) && (isPlane || !(sign(dot(t + root * ray.direction, cone.axis)) == -sign(cone.cosineOfHalfAperture)));\n\
\n\
                    float m = sqrt(t2);\n\
\n\
                    if (cosineTau > cone.cosineOfHalfAperture) // Inside cone.\n\
                    {\n\
                        if (rootTest)\n\
                        {\n\
                            // Ray starts inside cone and exits or becomes tangent.\n\
                            return czm_raySegment(0.0, m * root);\n\
                        }\n\
                        else\n\
                        {\n\
                            // Ray starts inside cone and never exits.\n\
                            return czm_fullRaySegment;\n\
                        }\n\
                    }\n\
                    else\n\
                    {\n\
                        if (rootTest)\n\
                        {\n\
                            if (c < 0.0) // Outside both napes of the cone.\n\
                            {\n\
                                // Ray starts outside cone and becomes tangent.\n\
                                float thing = m * root;\n\
                                return czm_raySegment(thing, thing);\n\
                            }\n\
                            else\n\
                            {\n\
                                // Ray starts outside cone and enters at vertex.\n\
                                float thing = m * root;\n\
                                return czm_raySegment(thing, czm_infinity);\n\
                            }\n\
                        }\n\
                        else\n\
                        {\n\
                            // Ray never enters.\n\
                            return czm_emptyRaySegment;\n\
                        }\n\
                    }\n\
                }\n\
            }\n\
        }\n\
    }\n\
}";
