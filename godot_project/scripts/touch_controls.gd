extends CanvasLayer
class_name TouchControls

# ==============================================================================
# SUPER ÁMBAR WONDER - MODERN MOBILE TOUCH CONTROLS
# Translucent Glassmorphism Touch Pad + Action Buttons with ripple feedback
# ==============================================================================

@onready var btn_left: TouchScreenButton = $Control/LeftContainer/BtnLeft
@onready var btn_right: TouchScreenButton = $Control/LeftContainer/BtnRight
@onready var btn_jump: TouchScreenButton = $Control/RightContainer/BtnJump
@onready var btn_run: TouchScreenButton = $Control/RightContainer/BtnRun
@onready var btn_power: TouchScreenButton = $Control/RightContainer/BtnPower

func _ready() -> void:
	# Show on touch-enabled devices or mobile platforms automatically
	if DisplayServer.is_touchscreen_available() or OS.has_feature("mobile") or OS.has_feature("web"):
		visible = true
	else:
		visible = true # Keep visible for testing in browser / mouse

func _input(event: InputEvent) -> void:
	if event is InputEventScreenTouch or event is InputEventScreenDrag:
		visible = true
