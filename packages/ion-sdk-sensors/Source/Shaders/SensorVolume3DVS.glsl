in vec4 position;
in vec3 normal;

out vec3 v_positionWC;
out vec3 v_positionEC;
out vec3 v_normalEC;

void main()
{
    vec4 clip = czm_modelViewProjection * position;

    // clamp only to far plane, near is clipped
    clip.z = min( clip.z, clip.w );
    gl_Position = clip;

    v_positionWC = (czm_model * position).xyz;
    v_positionEC = (czm_modelView * position).xyz;
    v_normalEC = czm_normal * normal;

    czm_vertexLogDepth();
}
