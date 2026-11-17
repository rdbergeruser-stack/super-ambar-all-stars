shader_type spatial;
render_mode blend_mix, depth_draw_opaque, cull_back, diffuse_toon, specular_toon;

// ==============================================================================
// SUPER ÁMBAR WONDER - NINTENDO SWITCH TOON & RIM LIGHT SHADER
// Replicates the vibrant, clean pop character look of Super Mario Bros. Wonder
// ==============================================================================

uniform vec4 albedo_color : source_color = vec4(1.0, 1.0, 1.0, 1.0);
uniform sampler2D albedo_texture : source_color, filter_linear_mipmap;
uniform vec4 rim_color : source_color = vec4(1.0, 0.95, 0.7, 1.0);
uniform float rim_power : hint_range(0.5, 6.0) = 2.5;
uniform float rim_intensity : hint_range(0.0, 2.5) = 1.2;
uniform float shadow_cut : hint_range(0.0, 1.0) = 0.45;
uniform float shadow_softness : hint_range(0.01, 0.3) = 0.08;

void fragment() {
	vec4 tex = texture(albedo_texture, UV);
	ALBEDO = albedo_color.rgb * tex.rgb;
	ROUGHNESS = 0.35;
	METALLIC = 0.05;

	// Vibrant Rim Light Highlight on Character Silhouette (Fresnel)
	float fresnel = 1.0 - clamp(dot(NORMAL, VIEW), 0.0, 1.0);
	float rim = pow(fresnel, rim_power) * rim_intensity;
	EMISSION = rim_color.rgb * rim;
}

void light() {
	// Quantized Cel / Toon Diffuse Banding
	float n_dot_l = dot(NORMAL, LIGHT);
	float light_intensity = smoothstep(shadow_cut - shadow_softness, shadow_cut + shadow_softness, n_dot_l);
	DIFFUSE_LIGHT += LIGHT_COLOR * ALBEDO * light_intensity * ATTENUATION;
}
