void setDepth(vec3 pointEC)
{
    vec4 pointCC = czm_projection * vec4(pointEC, 1.0);
#ifdef LOG_DEPTH
    czm_writeLogDepth(1.0 + pointCC.w);
#else
#ifdef WRITE_DEPTH
#if __VERSION__ == 300 || defined(GL_EXT_frag_depth)
    float z = pointCC.z / pointCC.w;

    float n = czm_depthRange.near;
    float f = czm_depthRange.far;

    gl_FragDepth = (z * (f - n) + f + n) * 0.5;
#endif
#endif
#endif
}
