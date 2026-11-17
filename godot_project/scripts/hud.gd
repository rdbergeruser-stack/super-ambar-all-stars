extends CanvasLayer
class_name GameHUD

# ==============================================================================
# SUPER AMBAR WONDER - MODERN RESPONSIVE HUD
# Displays Lives, Coins, and Active Wonder Power with glassmorphism style
# ==============================================================================

@onready var label_coins: Label = $Control/TopBar/CoinBox/LabelCoins
@onready var label_lives: Label = $Control/TopBar/LifeBox/LabelLives
@onready var label_power: Label = $Control/TopBar/PowerBox/LabelPower

func update_coins(new_coins: int) -> void:
	if label_coins:
		label_coins.text = "MONEDAS: %02d" % new_coins

func update_lives(new_lives: int) -> void:
	if label_lives:
		label_lives.text = "VIDAS: %d" % new_lives

func update_power(power_name: String) -> void:
	if label_power:
		label_power.text = power_name
