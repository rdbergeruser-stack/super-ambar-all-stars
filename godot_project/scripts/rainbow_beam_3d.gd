extends Area3D
class_name RainbowBeam3D

# ==============================================================================
# SUPER ÁMBAR WONDER - 3D RAINBOW LIGHT BEAM PROJECTILE
# Moves across the 2.5D plane, emitting colorful glowing light particles
# ==============================================================================

@export var speed: float = 24.0
@export var lifetime: float = 1.4

var direction: Vector3 = Vector3.RIGHT
var timer: float = 0.0

@onready var light: OmniLight3D = $OmniLight3D

func _ready() -> void:
	connect("body_entered", Callable(self, "_on_body_entered"))

func _physics_process(dt: float) -> void:
	global_position += direction * speed * dt
	global_position.z = 0.0 # Maintain 2.5D plane

	timer += dt
	if light:
		var hue = fmod(timer * 4.0, 1.0)
		light.light_color = Color.from_hsv(hue, 0.8, 1.0)

	if timer >= lifetime:
		queue_free()

func _on_body_entered(body: Node3D) -> void:
	if body.has_method("take_damage"):
		body.take_damage(1)
		queue_free()
	elif body is StaticBody3D:
		queue_free()
