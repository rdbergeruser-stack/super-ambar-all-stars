extends Camera3D
class_name CameraWonder

# ==============================================================================
# SUPER ÁMBAR WONDER - 2.5D DYNAMIC CINEMATIC CAMERA
# Features: Dynamic Lookahead, Smooth Dual-Axis Dampening, Screen Shake
# ==============================================================================

@export var target_node: NodePath
@export var follow_speed: float = 6.5
@export var lookahead_distance: float = 3.5
@export var vertical_offset: float = 2.4
@export var z_distance: float = 11.5
@export var min_y_limit: float = 1.0

var target: Node3D = null
var current_lookahead: float = 0.0
var shake_intensity: float = 0.0
var shake_timer: float = 0.0

func _ready() -> void:
	if has_node(target_node):
		target = get_node(target_node)
	elif get_parent().has_node("PlayerAmbar"):
		target = get_parent().get_node("PlayerAmbar")

func _process(dt: float) -> void:
	if not target:
		return

	# 1. Calculate dynamic horizontal lookahead
	var target_lookahead: float = 0.0
	if "facing_direction" in target:
		target_lookahead = target.facing_direction * lookahead_distance
	current_lookahead = lerp(current_lookahead, target_lookahead, 3.5 * dt)

	# 2. Desired position in 2.5D space
	var target_pos: Vector3 = Vector3(
		target.global_position.x + current_lookahead,
		max(min_y_limit, target.global_position.y + vertical_offset),
		z_distance
	)

	# 3. Smooth Lerp Camera tracking
	global_position.x = lerp(global_position.x, target_pos.x, follow_speed * dt)
	global_position.y = lerp(global_position.y, target_pos.y, (follow_speed * 0.85) * dt)
	global_position.z = z_distance

	# 4. Apply Screen Shake if active
	if shake_timer > 0.0:
		shake_timer -= dt
		var offset_x = (randf() - 0.5) * 2.0 * shake_intensity
		var offset_y = (randf() - 0.5) * 2.0 * shake_intensity
		h_offset = offset_x
		v_offset = offset_y
	else:
		h_offset = 0.0
		v_offset = 0.0

func add_shake(intensity: float, duration: float) -> void:
	shake_intensity = intensity
	shake_timer = duration
