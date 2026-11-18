extends CharacterBody3D
class_name PlayerAmbar

# ==============================================================================
# SUPER AMBAR WONDER - 2.5D CONTROLLER WITH HD SPRITES & 3D PHYSICS
# Style: Nintendo 2.5D Wonder / Octopath HD-2D / Paper Mario
# ==============================================================================

signal coins_changed(new_coins: int)
signal lives_changed(new_lives: int)
signal power_changed(power_name: String)

@export_group("Wonder Movement")
@export var walk_speed: float = 8.5
@export var run_speed: float = 13.0
@export var acceleration: float = 38.0
@export var friction: float = 32.0
@export var air_acceleration: float = 24.0

@export_group("Wonder Jump Dynamics")
@export var jump_impulse: float = 14.5
@export var jump_cut_multiplier: float = 0.45
@export var gravity: float = 34.0
@export var fall_gravity_multiplier: float = 1.35
@export var max_fall_speed: float = 22.0

@export_group("Game Feel & Polish")
@export var coyote_time_max: float = 0.12
@export var jump_buffer_max: float = 0.12
@export var squash_jump: Vector3 = Vector3(0.78, 1.28, 0.78)
@export var squash_land: Vector3 = Vector3(1.25, 0.75, 1.25)
@export var squash_recover_speed: float = 12.0

# Gameplay State
var coins: int = 0
var lives: int = 3
var is_running: bool = false
var is_flying: bool = false
var has_rainbow_power: bool = true
var facing_direction: float = 1.0 # 1.0 = Right, -1.0 = Left

# Internal Timers
var coyote_timer: float = 0.0
var jump_buffer_timer: float = 0.0
var was_on_floor_last_frame: bool = false

# Node references
@onready var visuals: Node3D = $Visuals
@onready var sprite: AnimatedSprite3D = $Visuals/Sprite
@onready var drop_shadow: MeshInstance3D = $Visuals/DropShadow

func _ready() -> void:
	emit_signal("coins_changed", coins)
	emit_signal("lives_changed", lives)
	emit_signal("power_changed", "SUPER AMBAR (BUZO + LENTES)")

func _physics_process(dt: float) -> void:
	# 1. Enforce strict 2.5D Movement Plane (Z = 0)
	global_position.z = 0.0
	velocity.z = 0.0

	# 2. Update Timers
	if is_on_floor():
		coyote_timer = coyote_time_max
	else:
		coyote_timer = max(0.0, coyote_timer - dt)

	jump_buffer_timer = max(0.0, jump_buffer_timer - dt)

	# 3. Read Input
	var move_input: float = Input.get_axis("move_left", "move_right")
	is_running = Input.is_action_pressed("run_dash")

	if Input.is_action_just_pressed("jump"):
		jump_buffer_timer = jump_buffer_max

	# 4. Handle Flight Mode
	if is_flying:
		_process_flight(dt, move_input)
		move_and_slide()
		return

	# 5. Horizontal Physics
	var target_speed: float = (run_speed if is_running else walk_speed) * move_input
	var accel: float = acceleration if is_on_floor() else air_acceleration

	if abs(move_input) > 0.05:
		velocity.x = move_toward(velocity.x, target_speed, accel * dt)
		facing_direction = sign(move_input)
	else:
		velocity.x = move_toward(velocity.x, 0.0, friction * dt)

	# 6. Vertical Physics & Jump Logic
	if not is_on_floor():
		var applied_gravity: float = gravity
		if velocity.y < 0.0 or not Input.is_action_pressed("jump"):
			applied_gravity *= fall_gravity_multiplier
		velocity.y = max(-max_fall_speed, velocity.y - applied_gravity * dt)

	# Execute Jump via Buffer or Coyote Time
	if jump_buffer_timer > 0.0 and coyote_timer > 0.0:
		velocity.y = jump_impulse
		jump_buffer_timer = 0.0
		coyote_timer = 0.0
		_apply_squash(squash_jump)

	# Variable Jump Cutoff
	if Input.is_action_just_released("jump") and velocity.y > 0.0:
		velocity.y *= jump_cut_multiplier

	# 7. Landing Detection (Squash)
	if not was_on_floor_last_frame and is_on_floor():
		_apply_squash(squash_land)

	was_on_floor_last_frame = is_on_floor()

	# 8. Rainbow Light Beam Action
	if Input.is_action_just_pressed("power_action") and has_rainbow_power:
		_cast_rainbow_beam()

	# 9. Perform Character Movement
	move_and_slide()

	# 10. Update 2.5D Visuals & Animation
	_update_visuals(dt, move_input)

func _process_flight(dt: float, move_input: float) -> void:
	var v_input: float = Input.get_axis("ui_down", "ui_up")
	velocity.x = move_toward(velocity.x, move_input * run_speed, acceleration * dt)
	velocity.y = move_toward(velocity.y, v_input * run_speed, acceleration * dt)
	visuals.rotation_degrees.z = -velocity.x * 2.5
	if sprite:
		sprite.play("fly")

func _apply_squash(squash: Vector3) -> void:
	if visuals:
		visuals.scale = squash

func _update_visuals(dt: float, move_input: float) -> void:
	if not visuals:
		return

	# Smooth squash recovery
	visuals.scale = visuals.scale.lerp(Vector3.ONE, squash_recover_speed * dt)

	# Dynamic Running Lean Angle
	var target_tilt: float = -velocity.x * 1.5
	visuals.rotation_degrees.z = lerp(visuals.rotation_degrees.z, target_tilt, 12.0 * dt)

	# Sprite Direction Flip & Animation
	if sprite:
		sprite.flip_h = (facing_direction < 0.0)

		if not is_on_floor():
			if velocity.y > 0.0:
				sprite.play("jump")
			else:
				sprite.play("fall")
			sprite.speed_scale = 1.0
		elif abs(velocity.x) > 0.5:
			if is_running:
				sprite.play("run")
				sprite.speed_scale = clamp(abs(velocity.x) / (run_speed * 0.8), 0.8, 1.8)
			else:
				sprite.play("walk")
				sprite.speed_scale = clamp(abs(velocity.x) / (walk_speed * 0.8), 0.8, 1.4)
		else:
			sprite.play("idle")
			sprite.speed_scale = 1.0

func _cast_rainbow_beam() -> void:
	var scene = load("res://scenes/rainbow_beam_3d.tscn")
	if scene:
		var beam = scene.instantiate()
		beam.global_position = global_position + Vector3(facing_direction * 0.8, 0.9, 0.0)
		beam.direction = Vector3(facing_direction, 0.0, 0.0)
		get_parent().add_child(beam)

func collect_coin() -> void:
	coins += 1
	emit_signal("coins_changed", coins)
	if coins % 100 == 0:
		lives += 1
		emit_signal("lives_changed", lives)
