#ifdef GL_OES_standard_derivatives
    #extension GL_OES_standard_derivatives : enable
#endif

uniform vec4 u_intersectionColor;
uniform float u_intersectionWidth;

#if defined(VIEWSHED)
uniform vec4 u_viewshedVisibleColor;
uniform vec4 u_viewshedOccludedColor;
#endif

#if defined(SHOW_ENVIRONMENT_INTERSECTION)
uniform float u_environmentIntersectionWidth;
uniform vec4 u_environmentIntersectionColor;

vec4 getEnvironmentIntersectionColor()
{
    return czm_gammaCorrect(u_environmentIntersectionColor);
}
#endif

vec4 getIntersectionColor()
{
    return czm_gammaCorrect(u_intersectionColor);
}

float getIntersectionWidth()
{
    return u_intersectionWidth;
}

vec2 sensorCartesianToNormalizedConicTextureCoordinates(float radius, vec3 point)
{
    // Maps (-90 to 90, 0 to +radius) coordinates to the ranges [0.25, 0.75] and [0.0, 1.0], respectively.
    return vec2(atan(point.z, sqrt(point.x * point.x + point.y * point.y)) * czm_oneOverTwoPi + 0.5, length(point) / radius);
}

vec2 sensorCartesianToNormalizedPolarTextureCoordinates(float radius, vec3 point)
{
    // Maps (-180 to 180, 0 to +radius) coordinates both to the range [0.0, 1.0].
    return vec2(atan(point.y, point.x) * czm_oneOverTwoPi + 0.5, length(point) / radius);
}

vec2 sensor3dToSphericalTextureCoordinates(vec3 point)
{
    // Maps (-180 to 180, -90.0 to 90.0) coordinates both to the range [0.0, 1.0].
    return vec2(atan(point.y, point.x) * czm_oneOverTwoPi + 0.5, atan(point.z, sqrt(point.x * point.x + point.y * point.y)) * czm_oneOverPi + 0.5);
}

///////////////////////////////////////////////////////////////////////////////

float ellipsoidHorizonHalfspaceSurfaceFunction(vec3 q, vec3 inverseRadii, vec3 point)
{
    // Point in the ellipsoid's scaled space
    vec3 temp = inverseRadii * point;

    // Behind ellipsoid horizon plane
    return dot(temp, q) - 1.0;
}

float ellipsoidHorizonSurfaceFunction(vec3 q, vec3 inverseRadii, vec3 point)
{
    // Point in the ellipsoid's scaled space
    vec3 temp = inverseRadii * point - q;

    // Behind ellipsoid horizon plane
    return dot(temp, q) / length(temp) + sqrt(dot(q, q) - 1.0);
}

float ellipsoidSurfaceFunction(vec3 inverseRadii, vec3 point)
{
    vec3 scaled = inverseRadii * point;
    return dot(scaled, scaled) - 1.0;
}

///////////////////////////////////////////////////////////////////////////////

bool inEllipsoidShadow(vec3 q, vec3 inverseRadii, vec3 pointWC)
{
    // Behind ellipsoid horizon plane and inside ellipsoid horizon surface.
    return (ellipsoidHorizonHalfspaceSurfaceFunction(q, inverseRadii, pointWC) < 0.0)
		&& (ellipsoidHorizonSurfaceFunction(q, inverseRadii, pointWC) < 0.0);
}

bool isOnBoundary(float value, float epsilon)
{
    float width = getIntersectionWidth();
    float tolerance = width * epsilon;

#ifdef GL_OES_standard_derivatives
    float delta = max(abs(dFdx(value)), abs(dFdy(value)));
    //float delta = fwidth(value);  TODO: compare this with above.
    float pixels = width * delta * czm_pixelRatio;
    float temp = abs(value);
    // There are a couple things going on here.
    // First we test the value at the current fragment to see if it is within the tolerance.
    // We also want to check if the value of an adjacent pixel is within the tolerance,
    // but we don't want to admit points that are obviously not on the surface.
    // For example, if we are looking for "value" to be close to 0, but value is 1 and the adjacent value is 2,
    // then the delta would be 1 and "temp - delta" would be "1 - 1" which is zero even though neither of
    // the points is close to zero.
    return (temp < tolerance && temp < pixels) || (delta < 10.0 * tolerance && temp - delta < tolerance && temp < pixels);
#else
    return abs(value) < tolerance;
#endif
}

#if defined(ENVIRONMENT_CONSTRAINT) || defined(SHOW_ENVIRONMENT_INTERSECTION) || defined(VIEWSHED)
uniform vec4 u_shadowMapLightPositionEC;
uniform samplerCube u_shadowCubeMap;

const float depthBias = 0.005;
const float shadowOffset = 0.005;

bool getShadowVisibility(vec3 pointEC, out float depth)
{
    vec3 directionEC = pointEC - u_shadowMapLightPositionEC.xyz;
    float distance = length(directionEC);
    directionEC = normalize(directionEC);
    float radius = u_shadowMapLightPositionEC.w;
    vec3 directionWC  = czm_inverseViewRotation * directionEC;
    distance /= radius;
    depth = czm_unpackDepth(czm_textureCube(u_shadowCubeMap, directionWC));

    // Check if point not in shadow
    if (step(distance - depthBias, depth) != 0.0) {
        return false;
    }

    // Get shadow map coordinate space
    vec3 shadowRight = normalize(cross(vec3(0,1,0), directionWC));
    vec3 shadowUp = cross(directionWC, shadowRight);

    vec3 oneStepUp = normalize(directionWC + (shadowUp * shadowOffset));
    if (step(distance - depthBias, czm_unpackDepth(czm_textureCube(u_shadowCubeMap, oneStepUp))) != 0.0) {
        return false;
    }

    vec3 oneStepDown = normalize(directionWC - (shadowUp * shadowOffset));
    return step(distance - depthBias, czm_unpackDepth(czm_textureCube(u_shadowCubeMap, oneStepDown)))  == 0.0;
}
#endif

#if defined(SHOW_ENVIRONMENT_INTERSECTION)
bool showShadowIntersectionPoint(vec3 point, float depth, float width)
{
    vec3 directionEC = point - u_shadowMapLightPositionEC.xyz;
    float distance = length(directionEC);
    float radius = u_shadowMapLightPositionEC.w;
    return abs(distance - depth * radius) < width;
}
#endif

#if defined(VIEWSHED)
vec4 getViewshedColor(vec3 positionEC, float depth)
{
    bool isInShadow = getShadowVisibility(positionEC, depth);
    return czm_gammaCorrect(isInShadow ? u_viewshedOccludedColor : u_viewshedVisibleColor);
}
#endif
