shader_type spatial;
render_mode blend_mix, depth_draw_opaque, cull_back, diffuse_toon, specular_toon;

// ==============================================================================
// SUPER ÁMBAR WONDER - VIBRANT TOON & RIM LIGHT SHADER (WEBGL COMPATIBLE)
// Bright, colorful, cartoon pop lighting that works 100% reliably in WebGL2
// ==============================================================================

uniform vec4 albedo_color : source_color = vec4(1.0, 1.0, 1.0, 1.0);
uniform vec4 rim_color : source_color = vec4(1.0, 0.95, 0.8, 1.0);
uniform float rim_power : hint_range(0.5, 6.0) = 2.0;
uniform float rim_intensity : hint_range(0.0, 3.0) = 1.2;

void fragment() {
	ALBEDO = albedo_color.rgb;
	ROUGHNESS = 0.35;
	METALLIC = 0.05;

	// Rim Light highlight on silhouette (Fresnel)
	float fresnel = 1.0 - clamp(dot(NORMAL, VIEW), 0.0, 1.0);
	float rim = pow(fresnel, rim_power) * rim_intensity;
	EMISSION = rim_color.rgb * rim * 0.75;
}
