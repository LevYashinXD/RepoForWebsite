import type { RobloxSection } from './types';
import { ScriptIcon, ServerIcon, PlayerIcon, GuiIcon, StorageIcon, ReplicatedIcon, LightingIcon, CubeIcon, SoundIcon, ChatIcon, SettingsIcon, PackIcon, TeamsIcon, PuzzlePieceIcon } from './components/Icons';

export const ROBLOX_SECTIONS: RobloxSection[] = [
  {
    id: 'Universal',
    name: 'Universal System Generator',
    description: 'Describe a complete game feature or system. The AI will attempt to generate scripts for multiple relevant Roblox sections.',
    icon: PuzzlePieceIcon,
    typicalPromptPlaceholder: 'e.g., "A daily reward system for players" or "A basic pet system with equipping and following logic".'
  },
  {
    id: 'ServerScriptService',
    name: 'ServerScriptService',
    description: 'Container for server-side game logic scripts. Scripts here run on the server and are not accessible to clients.',
    icon: ServerIcon,
    typicalPromptPlaceholder: 'Create a script that makes a part named "ColorPart" change color every second.'
  },
  {
    id: 'StarterPlayer.StarterPlayerScripts',
    name: 'StarterPlayerScripts',
    description: 'Scripts placed here are copied to each player\'s PlayerScripts container when they join. Ideal for local client-side logic.',
    icon: PlayerIcon,
    typicalPromptPlaceholder: 'Write a LocalScript that prints a welcome message to the player.'
  },
  {
    id: 'StarterPlayer.StarterCharacterScripts',
    name: 'StarterCharacterScripts',
    description: 'Scripts placed here are copied to each player\'s character model when they spawn. Used for character-specific client-side logic.',
    icon: PlayerIcon,
    typicalPromptPlaceholder: 'Develop a LocalScript that gives the player a speed boost when they press "E".'
  },
  {
    id: 'StarterGui',
    name: 'StarterGui',
    description: 'Contains ScreenGuis, LocalScripts, and other UI elements that are copied to each player\'s PlayerGui when they join.',
    icon: GuiIcon,
    typicalPromptPlaceholder: 'Generate a LocalScript for a TextButton that opens a shop frame when clicked.'
  },
  {
    id: 'ReplicatedStorage',
    name: 'ReplicatedStorage',
    description: 'A container for objects (ModuleScripts, RemoteEvents, RemoteFunctions, assets) that need to be accessible to both the server and clients.',
    icon: ReplicatedIcon,
    typicalPromptPlaceholder: 'Create a ModuleScript with a function that returns a random greeting.'
  },
  {
    id: 'Workspace',
    name: 'Workspace',
    description: 'The 3D world where Parts, Models, and other physical objects exist. Scripts can be parented here to interact directly with these objects, though often ServerScriptService is preferred for organization.',
    icon: CubeIcon,
    typicalPromptPlaceholder: 'Script a part to rotate continuously around its Y-axis.'
  },
  {
    id: 'ServerStorage',
    name: 'ServerStorage',
    description: 'A container for objects that are only accessible by server scripts. Useful for storing maps, tools, or assets that shouldn\'t be replicated to clients until needed.',
    icon: StorageIcon,
    typicalPromptPlaceholder: 'Write a script to clone a model named "MonsterTemplate" from ServerStorage into the Workspace.'
  },
  {
    id: 'Lighting',
    name: 'Lighting',
    description: 'Service that controls environmental lighting effects like time of day, fog, skyboxes, and post-processing effects. Scripts can modify these properties.',
    icon: LightingIcon,
    typicalPromptPlaceholder: 'Develop a script to slowly cycle the game through day and night.'
  },
   {
    id: 'StarterPack',
    name: 'StarterPack',
    description: 'A container for Tools that are copied to a player\'s Backpack when they join the game or respawn.',
    icon: PackIcon,
    typicalPromptPlaceholder: 'Create a script for a Tool that, when activated, creates an explosion effect.'
  },
  {
    id: 'Teams',
    name: 'Teams',
    description: 'Service used to manage player teams in the game. Scripts can create teams, assign players, and manage team properties.',
    icon: TeamsIcon,
    typicalPromptPlaceholder: 'Write a script that creates two teams, "Red" and "Blue", and assigns players to them randomly.'
  },
  {
    id: 'SoundService',
    name: 'SoundService',
    description: 'Manages global sound properties and effects in the game. Scripts can control ambient sounds, music, and sound groups.',
    icon: SoundIcon,
    typicalPromptPlaceholder: 'Script to play a background music track on loop from SoundService.'
  },
  {
    id: 'TextChatService',
    name: 'TextChatService',
    description: 'Service that manages the in-game text chat system. Scripts can customize chat behavior, filter messages, or create custom chat commands.',
    icon: ChatIcon,
    typicalPromptPlaceholder: 'Create a custom chat command "/time" that tells the player the current server time.'
  },
  {
    id: 'ReplicatedFirst',
    name: 'ReplicatedFirst',
    description: 'Container for objects that are replicated to clients before anything else, including the game world. Typically used for loading screens or essential early-client setup.',
    icon: ReplicatedIcon, // Could use a more specific one if available
    typicalPromptPlaceholder: 'Design a LocalScript for a loading screen GUI that fades out when the game is loaded.'
  },
  {
    id: 'ModuleScript',
    name: 'ModuleScript (General)',
    description: 'Reusable scripts that can be required by other scripts (Server, Local, or other ModuleScripts). Store shared functions and data.',
    icon: ScriptIcon,
    typicalPromptPlaceholder: 'Write a ModuleScript with a utility function to calculate the distance between two Vector3 positions.'
  },
];

// For App.tsx main icon, if needed
export const WorkspaceIcon = CubeIcon; // Default icon or a more generic app icon
export const AppIcon = SettingsIcon;
