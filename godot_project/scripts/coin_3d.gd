extends Area3D
class_name Coin3D

# ==============================================================================
# SUPER ÁMBAR WONDER - ROTATING 3D GOLD COIN
# Floating golden coin with real-time specular highlights and collection sparkle
# ==============================================================================

@export var rotation_speed: float = 190.0
@export var bob_speed: float = 3.5
@export var bob_height: float = 0.15

var base_y: float = 0.0
var time: float = 0.0

func _ready() -> void:
	base_y = position.y
	time = randf() * 10.0
	connect("body_entered", Callable(self, "_on_body_entered"))

func _process(dt: float) -> void:
	time += dt
	rotation_degrees.y += rotation_speed * dt
	position.y = base_y + sin(time * bob_speed) * bob_height

func _on_body_entered(body: Node3D) -> void:
	if body.has_method("collect_coin"):
		body.collect_coin()
		# Spawn sparkle if available, then queue_free
		queue_free()
