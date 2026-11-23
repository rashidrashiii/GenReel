// Prop registry (docs/VISUAL_UPGRADE.md §7 "Props"): tag -> drawing. Tags, categories and matching keywords live in
// packages/schema/prop-tags.json (prompt + validator); a worker test keeps both lists identical.
import type { PropArt } from "./kit";
import { AutoRickshaw, Bicycle, Boat, Bus, Car, Plane, SolarPanel, Truck } from "./transport";
import { Bread, Cake, CoconutTree, CoffeeCup, Flower, Leaf, OilLamp, PlateFood } from "./food";
import { Book, ChefHat, Dumbbell, GraduationCap, Pencil, Pill, Stethoscope, Tooth } from "./life";
import { CreditCard, GoldRing, Key, Lock, Necklace, PeopleGroup, PercentBadge, Person, PieChart, SaleBurst, Saree, Shield, Shirt, Wallet } from "./more";
import { Gift, Megaphone, MoneyStack, Phone, PriceTag, RupeeCoin, ShoppingBag, ShoppingCart } from "./commerce";
import { ChatBubble, Envelope, Gear, Laptop, Magnifier, Rocket, ThumbsUp, Trophy } from "./tech";
import { BarChart, Cloud, House, ShopFront, Sun, Train, Tree, WaterDrop } from "./world";
import { Calendar, Checkmark, Clock, Cross, Heart, Lightbulb, LocationPin, Star } from "./symbols";

export type PropEntry = { tag: string; category: string; Art: PropArt };

export const REGISTRY: PropEntry[] = [
  { tag: "checkmark", category: "symbols", Art: Checkmark },
  { tag: "cross", category: "symbols", Art: Cross },
  { tag: "star", category: "symbols", Art: Star },
  { tag: "heart", category: "symbols", Art: Heart },
  { tag: "lightbulb", category: "symbols", Art: Lightbulb },
  { tag: "clock", category: "time", Art: Clock },
  { tag: "calendar", category: "time", Art: Calendar },
  { tag: "megaphone", category: "marketing", Art: Megaphone },
  { tag: "gift", category: "shopping", Art: Gift },
  { tag: "shopping_cart", category: "shopping", Art: ShoppingCart },
  { tag: "shopping_bag", category: "shopping", Art: ShoppingBag },
  { tag: "price_tag", category: "money", Art: PriceTag },
  { tag: "rupee_coin", category: "money", Art: RupeeCoin },
  { tag: "money_stack", category: "money", Art: MoneyStack },
  { tag: "phone", category: "tech", Art: Phone },
  { tag: "laptop", category: "tech", Art: Laptop },
  { tag: "envelope", category: "communication", Art: Envelope },
  { tag: "chat_bubble", category: "communication", Art: ChatBubble },
  { tag: "thumbs_up", category: "symbols", Art: ThumbsUp },
  { tag: "trophy", category: "success", Art: Trophy },
  { tag: "rocket", category: "success", Art: Rocket },
  { tag: "magnifier", category: "tech", Art: Magnifier },
  { tag: "gear", category: "tech", Art: Gear },
  { tag: "location_pin", category: "places", Art: LocationPin },
  { tag: "house", category: "places", Art: House },
  { tag: "shop_front", category: "places", Art: ShopFront },
  { tag: "tree", category: "nature", Art: Tree },
  { tag: "sun", category: "nature", Art: Sun },
  { tag: "cloud", category: "nature", Art: Cloud },
  { tag: "water_drop", category: "nature", Art: WaterDrop },
  { tag: "train", category: "transport", Art: Train },
  { tag: "bar_chart", category: "data", Art: BarChart },
  { tag: "bus", category: "transport", Art: Bus },
  { tag: "auto_rickshaw", category: "transport", Art: AutoRickshaw },
  { tag: "car", category: "transport", Art: Car },
  { tag: "boat", category: "transport", Art: Boat },
  { tag: "plane", category: "transport", Art: Plane },
  { tag: "truck", category: "transport", Art: Truck },
  { tag: "bicycle", category: "transport", Art: Bicycle },
  { tag: "solar_panel", category: "nature", Art: SolarPanel },
  { tag: "leaf", category: "nature", Art: Leaf },
  { tag: "flower", category: "nature", Art: Flower },
  { tag: "coconut_tree", category: "nature", Art: CoconutTree },
  { tag: "oil_lamp", category: "festival", Art: OilLamp },
  { tag: "bread", category: "food", Art: Bread },
  { tag: "cake", category: "food", Art: Cake },
  { tag: "coffee_cup", category: "food", Art: CoffeeCup },
  { tag: "plate_food", category: "food", Art: PlateFood },
  { tag: "chef_hat", category: "food", Art: ChefHat },
  { tag: "tooth", category: "health", Art: Tooth },
  { tag: "stethoscope", category: "health", Art: Stethoscope },
  { tag: "pill", category: "health", Art: Pill },
  { tag: "book", category: "learning", Art: Book },
  { tag: "graduation_cap", category: "learning", Art: GraduationCap },
  { tag: "pencil", category: "learning", Art: Pencil },
  { tag: "dumbbell", category: "health", Art: Dumbbell },
  { tag: "gold_ring", category: "jewellery", Art: GoldRing },
  { tag: "necklace", category: "jewellery", Art: Necklace },
  { tag: "key", category: "security", Art: Key },
  { tag: "lock", category: "security", Art: Lock },
  { tag: "shield", category: "security", Art: Shield },
  { tag: "people_group", category: "people", Art: PeopleGroup },
  { tag: "person", category: "people", Art: Person },
  { tag: "percent_badge", category: "money", Art: PercentBadge },
  { tag: "sale_burst", category: "money", Art: SaleBurst },
  { tag: "pie_chart", category: "data", Art: PieChart },
  { tag: "wallet", category: "money", Art: Wallet },
  { tag: "credit_card", category: "money", Art: CreditCard },
  { tag: "saree", category: "clothing", Art: Saree },
  { tag: "shirt", category: "clothing", Art: Shirt },
];

export const BY_TAG = new Map(REGISTRY.map((e) => [e.tag, e]));
export const TAGS = REGISTRY.map((e) => e.tag);

/** Validation already mapped every tag to the registry; anything unknown here still draws something. */
export const resolveTag = (tag: string) => (BY_TAG.has(tag) ? tag : "star");
