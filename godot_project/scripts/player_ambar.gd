extends CharacterBody3D
class_name PlayerAmbar

# ==============================================================================
# SUPER ÁMBAR WONDER - 2.5D PLATFORMER CONTROLLER
# Style: Super Mario Bros. Wonder / Nintendo Switch 2.5D
# Features: Z-Plane Lock, Responsive Wonder Physics, Dynamic Squash & Stretch,
#           Coyote Time, Jump Buffering, Running Lean, Rainbow Power & Flight.
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
@export var squash_jump: Vector3 = Vector3(0.75, 1.35, 0.75)
@export var squash_land: Vector3 = Vector3(1.30, 0.70, 1.30)
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
var flight_timer: float = 0.0
var was_on_floor_last_frame: bool = false

# Node references
@onready var visuals: Node3D = $Visuals
@onready var anim_player: AnimationPlayer = $Visuals/AnimationPlayer
@onready var dust_particles: CPUParticles3D = $Visuals/DustParticles
@onready var rainbow_particles: CPUParticles3D = $Visuals/RainbowParticles

func _ready() -> void:
	emit_signal("coins_changed", coins)
	emit_signal("lives_changed", lives)
	emit_signal("power_changed", "SUPER ÁMBAR (BUZO+LENTES)")

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

	# 4. Handle Flight Mode (Superman / Cape)
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
		# Fall faster when falling downward or releasing jump key (Wonder Variable Jump)
		if velocity.y < 0.0 or not Input.is_action_pressed("jump"):
			applied_gravity *= fall_gravity_multiplier
		velocity.y = max(-max_fall_speed, velocity.y - applied_gravity * dt)

	# Execute Jump via Buffer or Coyote Time
	if jump_buffer_timer > 0.0 and coyote_timer > 0.0:
		velocity.y = jump_impulse
		jump_buffer_timer = 0.0
		coyote_timer = 0.0
		_apply_squash(squash_jump)
		if dust_particles:
			dust_particles.restart()

	# Variable Jump Cutoff
	if Input.is_action_just_released("jump") and velocity.y > 0.0:
		velocity.y *= jump_cut_multiplier

	# 7. Landing Detection (Squash & Sound)
	if not was_on_floor_last_frame and is_on_floor():
		_apply_squash(squash_land)
		if dust_particles:
			dust_particles.restart()

	was_on_floor_last_frame = is_on_floor()

	# 8. Rainbow Light Beam Action
	if Input.is_action_just_pressed("power_action") and has_rainbow_power:
		_cast_rainbow_beam()

	# 9. Perform Character Movement
	move_and_slide()

	# 10. Visual Polish: Squash & Stretch recovery + Turning Tilt + Animation
	_update_visuals(dt, move_input)

func _process_flight(dt: float, move_input: float) -> void:
	var v_input: float = Input.get_axis("ui_down", "ui_up")
	velocity.x = move_toward(velocity.x, move_input * run_speed, acceleration * dt)
	velocity.y = move_toward(velocity.y, v_input * run_speed, acceleration * dt)
	visuals.rotation_degrees.z = -velocity.x * 2.5

func _apply_squash(squash: Vector3) -> void:
	if visuals:
		visuals.scale = squash

func _update_visuals(dt: float, move_input: float) -> void:
	if not visuals:
		return

	# Smoothly recover to standard 3D scale (1, 1, 1)
	visuals.scale = visuals.scale.lerp(Vector3.ONE, squash_recover_speed * dt)

	# Face movement direction smoothly with 3D Y-rotation
	var target_y_rot: float = 90.0 if facing_direction > 0 else -90.0
	visuals.rotation_degrees.y = lerp_angle(deg_to_rad(visuals.rotation_degrees.y), deg_to_rad(target_y_rot), 16.0 * dt)
	visuals.rotation_degrees.y = rad_to_deg(visuals.rotation_degrees.y)

	# Dynamic Running Lean Angle (Mario Wonder athletic posture)
	var target_tilt: float = -velocity.x * 1.8
	visuals.rotation_degrees.z = lerp(visuals.rotation_degrees.z, target_tilt, 12.0 * dt)

	# Animation selection
	if anim_player:
		var target_anim: String = "idle"
		if not is_on_floor():
			if velocity.y > 1.0 and anim_player.has_animation("jump_up"):
				target_anim = "jump_up"
			elif anim_player.has_animation("jump_fall"):
				target_anim = "jump_fall"
			else:
				target_anim = "idle"
		elif abs(velocity.x) > 0.5:
			anim_player.speed_scale = abs(velocity.x) / (walk_speed * 0.8)
			target_anim = "run" if (is_running and anim_player.has_animation("run")) else "walk"
		else:
			anim_player.speed_scale = 1.0
			target_anim = "idle"

		if anim_player.has_animation(target_anim):
			anim_player.play(target_anim)

func _cast_rainbow_beam() -> void:
	# Spawn dynamic 3D Rainbow Projectile beam
	var scene = load("res://scenes/rainbow_beam_3d.tscn")
	if scene:
		var beam = scene.instantiate()
		beam.global_position = global_position + Vector3(facing_direction * 0.8, 0.7, 0.0)
		beam.direction = Vector3(facing_direction, 0.0, 0.0)
		get_parent().add_child(beam)
	if rainbow_particles:
		rainbow_particles.restart()

func collect_coin() -> void:
	coins += 1
	emit_signal("coins_changed", coins)
	if coins % 100 == 0:
		lives += 1
		emit_signal("lives_changed", lives)
