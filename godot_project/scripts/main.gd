extends Node3D

# ==============================================================================
# SUPER ÁMBAR WONDER - MAIN SCENE CONTROLLER
# Connects Player signals with HUD and manages level progression
# ==============================================================================

const PlayerAmbarScript = preload("res://scripts/player_ambar.gd")
const GameHUDScript = preload("res://scripts/hud.gd")
const CameraWonderScript = preload("res://scripts/camera_wonder.gd")

@onready var player: Node3D = $PlayerAmbar
@onready var hud: CanvasLayer = $HUD
@onready var camera: Camera3D = $CameraWonder

func _ready() -> void:
	if player and hud:
		player.coins_changed.connect(hud.update_coins)
		player.lives_changed.connect(hud.update_lives)
		player.power_changed.connect(hud.update_power)
		# Initialize HUD with starting values
		hud.update_coins(player.coins)
		hud.update_lives(player.lives)
		hud.update_power("SUPER ÁMBAR (BUZO+LENTES)")

	# Goal Castle trigger
	if has_node("GoalCastle3D/GoalTriggerArea"):
		var goal_area: Area3D = get_node("GoalCastle3D/GoalTriggerArea")
		goal_area.body_entered.connect(_on_goal_reached)

func _on_goal_reached(body: Node3D) -> void:
	if body.has_method("collect_coin"): # Player check
		print("¡NIVEL COMPLETADO! ¡Ámbar llegó al castillo!")
		if camera and camera.has_method("add_shake"):
			camera.add_shake(0.4, 0.8)
