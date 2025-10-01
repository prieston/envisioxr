//This file is automatically rebuilt by the Cesium build process.
export default "in vec4 position;\n\
in vec3 normal;\n\
\n\
out vec3 v_positionWC;\n\
out vec3 v_positionEC;\n\
out vec3 v_normalEC;\n\
\n\
void main()\n\
{\n\
    vec4 clip = czm_modelViewProjection * position;\n\
\n\
    // clamp only to far plane, near is clipped\n\
    clip.z = min( clip.z, clip.w );\n\
    gl_Position = clip;\n\
\n\
    v_positionWC = (czm_model * position).xyz;\n\
    v_positionEC = (czm_modelView * position).xyz;\n\
    v_normalEC = czm_normal * normal;\n\
\n\
    czm_vertexLogDepth();\n\
}\n\
";
