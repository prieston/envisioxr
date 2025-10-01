struct infiniteCone
{
    vec3 vertex;
    vec3 axis;          // Unit-length direction vector
    float cosineOfHalfAperture;
    float sineOfHalfAperture;
};

infiniteCone infiniteConeNew(vec3 vertex, vec3 axis, float cosineOfHalfAperture, float sineOfHalfAperture)
{
    return infiniteCone(vertex, axis, cosineOfHalfAperture, sineOfHalfAperture);
}

vec3 coneNormal(infiniteCone cone, vec3 pointOnCone)
{
    vec3 s = pointOnCone - cone.vertex;     // Vector from the origin is at (vertex + s)
    vec3 sUnit = normalize(s);
    return normalize((cone.cosineOfHalfAperture * sUnit - cone.axis) / cone.sineOfHalfAperture);
}

czm_raySegment rayConeIntersectionInterval(czm_ray ray, infiniteCone cone)
{
    vec3 temp = ray.origin - cone.vertex;

    float t2 = dot(temp, temp);

    float cosineNu = dot(ray.direction, cone.axis);

    if (t2 == 0.0) // At vertex.
    {
        if (cosineNu >= cone.cosineOfHalfAperture) // Looking inward or along surface.
        {
            return czm_fullRaySegment;
        }
        else // Looking outward.
        {
            return czm_emptyRaySegment;
        }
    }
    else // Not at vertex
    {
        vec3 t = normalize(temp);

        float projection = dot(t, cone.axis);

        if (projection == cone.cosineOfHalfAperture) // On surface.
        {
            vec3 u = ray.direction;

            mat3 crossProductMatrix = mat3(0.0, -u.z, u.y,
                                            u.z, 0.0, -u.x,
                                           -u.y, u.x, 0.0);
            if (length(crossProductMatrix * temp) == 0.0) // Looking along surface.
            {
                if (dot(temp, u) > 0.0) // Looking away from vertex.
                {
                    return czm_fullRaySegment;
                }
                else // Looking toward vertex.
                {
                    return czm_raySegment(0.0, length(temp));
                }
            }
            else // Looking tangent at surface.
            {
                return czm_emptyRaySegment;
            }
        }
        else // Not on surface
        {
            float cosineAlpha2 = cone.cosineOfHalfAperture * cone.cosineOfHalfAperture;

            float cosineTau = dot(t, cone.axis);
            float cosineDelta = dot(t, ray.direction);

            float cosineNu2 = cosineNu * cosineNu;
            float cosineTau2 = cosineTau * cosineTau;

            float stuff = cosineTau * cosineNu;

            float positiveTerm = cosineNu2 + cosineTau2;
            float negativeTerm = (cosineDelta * cosineDelta - 1.0) * cosineAlpha2;
            float signedTerm = -2.0 * stuff * cosineDelta;

            if (signedTerm > 0.0)
            {
                positiveTerm = positiveTerm + signedTerm;
            }
            else if (signedTerm < 0.0)
            {
                negativeTerm = negativeTerm + signedTerm;
            }

            float d = 4.0 * cosineAlpha2 * (positiveTerm + negativeTerm);

            if (d < 0.0) // Imaginary roots.  No intersections.
            {
                if (cone.cosineOfHalfAperture < 0.0) // Obtuse cone.
                {
                    return czm_fullRaySegment;
                }
                else // Acute cone.
                {
                    return czm_emptyRaySegment;
                }
            }
            else if (d > 0.0) // Distinct real roots.  Two intersections.
            {
                float a = cosineNu2 - cosineAlpha2;
                float c = cosineTau2 - cosineAlpha2;
                float b = 2.0 * (stuff - cosineDelta * cosineAlpha2);

                float s = (b == 0.0) ? 1.0 : sign(b);
                float q = -(b + s * sqrt(d)) / 2.0;

                float first = q / a;
                float second = c / q;
                if (second < first)
                {
                    float thing = first;
                    first = second;
                    second = thing;
                }

                // Check roots to ensure that they are non-negative and intersect the desired nape of the cone.
                bool isPlane = (abs(cone.cosineOfHalfAperture) < czm_epsilon7);
                bool firstTest = (first >= 0.0) && (isPlane || !(sign(dot(t + first * ray.direction, cone.axis)) == -sign(cone.cosineOfHalfAperture)));
                bool secondTest = (second >= 0.0) && (isPlane || !(sign(dot(t + second * ray.direction, cone.axis)) == -sign(cone.cosineOfHalfAperture)));

                float m = sqrt(t2);

                if (cosineTau > cone.cosineOfHalfAperture) // Inside cone.
                {
                    if (firstTest && secondTest)
                    {
                        // Only for non-convex cone.
                        return czm_raySegment(m * first, m * second);
                    }
                    else if (firstTest)
                    {
                        // Ray starts inside cone and exits.
                        return czm_raySegment(0.0, m * first);
                    }
                    else if (secondTest)
                    {
                        // Ray starts inside cone and exits.
                        return czm_raySegment(0.0, m * second);
                    }
                    else
                    {
                        // Ray starts inside cone and never exits.
                        return czm_fullRaySegment;
                    }
                }
                else
                {
                    if (firstTest && secondTest)
                    {
                        // Ray enters and exits.
                        return czm_raySegment(m * first, m * second);
                    }
                    else if (firstTest)
                    {
                        // Ray enters and never exits.
                        return czm_raySegment(m * first, czm_infinity);
                    }
                    else if (secondTest)
                    {
                        // Ray enters and never exits.
                        return czm_raySegment(m * second, czm_infinity);
                    }
                    else
                    {
                        // Ray never enters.
                        return czm_emptyRaySegment;
                    }
                }
            }
            else // (d == 0.0)  Repeated real roots.  Two intersections.
            {
                if (cone.cosineOfHalfAperture == 0.0) // Planar cone.
                {
                    if (cosineTau >= 0.0) // Inside or on surface.
                    {
                        if (cosineNu >= 0.0) // Looking inward or tangent.
                        {
                            // Ray starts inside cone and never exits.
                            return czm_fullRaySegment;
                        }
                        else
                        {
                            // Ray starts inside cone and intersects.
                            return czm_raySegment(0.0, -sqrt(t2) * cosineTau / cosineNu);
                        }
                    }
                    else // Outside.
                    {
                        if (cosineNu <= 0.0) // Looking outward or tangent.
                        {
                            // Ray starts outside cone and never enters.
                            return czm_emptyRaySegment;
                        }
                        else
                        {
                            // Ray starts outside cone and intersects.
                            return czm_raySegment(-sqrt(t2) * cosineTau / cosineNu, czm_infinity);
                        }
                    }
                }
                else
                {
                    float a = cosineNu2 - cosineAlpha2;
                    float c = cosineTau2 - cosineAlpha2;
                    float b = 2.0 * (stuff - cosineDelta * cosineAlpha2);

                    float root = (a == 0.0) ? -sign(b) * czm_infinity : (-sign(b) / sign(a)) * sqrt(c / a);

                    // Check roots to ensure that they are non-negative and intersect the desired nape of the cone.
	                bool isPlane = (abs(cone.cosineOfHalfAperture) < czm_epsilon7);
                    bool rootTest = (root >= 0.0) && (isPlane || !(sign(dot(t + root * ray.direction, cone.axis)) == -sign(cone.cosineOfHalfAperture)));

                    float m = sqrt(t2);

                    if (cosineTau > cone.cosineOfHalfAperture) // Inside cone.
                    {
                        if (rootTest)
                        {
                            // Ray starts inside cone and exits or becomes tangent.
                            return czm_raySegment(0.0, m * root);
                        }
                        else
                        {
                            // Ray starts inside cone and never exits.
                            return czm_fullRaySegment;
                        }
                    }
                    else
                    {
                        if (rootTest)
                        {
                            if (c < 0.0) // Outside both napes of the cone.
                            {
                                // Ray starts outside cone and becomes tangent.
                                float thing = m * root;
                                return czm_raySegment(thing, thing);
                            }
                            else
                            {
                                // Ray starts outside cone and enters at vertex.
                                float thing = m * root;
                                return czm_raySegment(thing, czm_infinity);
                            }
                        }
                        else
                        {
                            // Ray never enters.
                            return czm_emptyRaySegment;
                        }
                    }
                }
            }
        }
    }
}