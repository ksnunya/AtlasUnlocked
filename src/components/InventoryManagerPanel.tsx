import { Backpack } from "lucide-react";
import { PanelModal } from "./PanelModal";
import { InventoryPanel } from "./InventoryPanel";
export function InventoryManagerPanel() { return <PanelModal title="Inventory" subtitle="Physical supplies & in-game equipment" icon={Backpack} wide><InventoryPanel expanded /></PanelModal>; }
