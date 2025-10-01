in vec4 position;
in vec2 cartographic;

out vec3 v_positionEC;
out vec2 v_cartographic;

void main()
{
    gl_Position = czm_modelViewProjection * position;
    v_positionEC = (czm_modelView * position).xyz;
    v_cartographic = cartographic;
}