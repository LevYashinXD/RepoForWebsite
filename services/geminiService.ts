
import { GoogleGenAI } from "@google/genai";
import type { GeminiResponse, UniversalGeminiResponse, UniversalScriptItem } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn(
    "API_KEY environment variable is not set. Gemini API calls will fail. Ensure API_KEY is available in your environment."
  );
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const modelName = 'gemini-2.5-flash-preview-04-17';

const handleGeminiError = (error: unknown): Error => {
  console.error("Error calling Gemini API:", error);
  if (error instanceof Error) {
      if (error.message.toLowerCase().includes("api key not valid") || 
          error.message.toLowerCase().includes("permission denied") ||
          error.message.toLowerCase().includes("api_key_invalid")) {
           return new Error("Gemini API Error: Invalid API Key or permission issue. Please check your API_KEY configuration.");
      }
      return new Error(`Failed to generate script using Gemini API: ${error.message}`);
  }
  return new Error("An unknown error occurred while communicating with the Gemini API.");
};

const parseJsonResponse = <T>(jsonStr: string, rawText: string): T => {
  let cleanedJsonStr = jsonStr.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = cleanedJsonStr.match(fenceRegex);
  if (match && match[1]) {
    cleanedJsonStr = match[1].trim();
  }

  try {
    return JSON.parse(cleanedJsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini:", e, "Raw response text:", rawText);
    
    if (!cleanedJsonStr.startsWith("{") && !cleanedJsonStr.startsWith("[")) {
        throw new Error(`AI response did not start with '{' or '['. The AI may have failed to return valid JSON. Raw AI output (first 300 chars): ${rawText.substring(0, 300)}...`);
    }
    throw new Error(`Failed to parse structured JSON response from AI. Original error: ${(e as Error).message}. Raw AI output (first 300 chars): ${rawText.substring(0, 300)}...`);
  }
};

export const generateLuaScript = async (userRequest: string, targetSectionName: string): Promise<GeminiResponse> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured. Cannot call Gemini API.");
  }

  let systemInstruction = `You are an expert Roblox LuaU script generator.
You assist users by creating LuaU scripts tailored for specific sections within Roblox Studio.
Your output MUST be a valid JSON object. Do not include any text outside of this JSON object.
The JSON object must have two keys: "script" (string containing the LuaU code) and "explanation" (string containing a concise explanation).
Ensure the LuaU code is raw text, without any markdown fences like \`\`\`lua ... \`\`\`. Escape any characters in the LuaU code as needed for it to be a valid JSON string value (e.g., newlines as \\n, quotes as \\").
The explanation should be brief, describe what the script does, and mention any important considerations for its use in the specified Roblox section.`;

  if (targetSectionName === 'StarterGui') {
    systemInstruction += `
If the targetSectionName is "StarterGui", your JSON object MUST additionally include an "htmlPreview" key.
The "htmlPreview" value should be a STRING containing simplified HTML and inline CSS to visually represent the GUI elements created by the LuaU script.
This preview is for visualization only and does not need to be interactive or pixel-perfect.

HTML Preview Guidelines:
- The root element should be a '<div style="width: 300px; height: 200px; border: 1px solid #ccc; background-color: #f0f0f0; position: relative; overflow: auto; margin: 0 auto;">' to simulate a ScreenGui. Adjust size if sensible for content.
- Map Roblox GUI elements to HTML: Frame -> div, TextLabel -> div or p, TextButton -> button or div, ImageLabel -> img, TextBox -> input type="text" or textarea.
- Convert UDim2 to CSS: Use percentages for Scale and pixels for Offset for width, height, top, left. E.g., Size = UDim2.new(0.5, 10, 0.2, 5) -> style="width: calc(50% + 10px); height: calc(20% + 5px);". Position elements absolutely within their parent.
- AnchorPoint: If AnchorPoint is (ax, ay), apply 'transform: translate(-ax*100%, -ay*100%);' in addition to top/left positioning.
- Colors: BackgroundColor3 -> background-color, TextColor3 -> color.
- Text: Text -> innerHTML/value, TextSize -> font-size, Font -> font-family.
- Visibility: If Visible=false, use 'display: none;'. ZIndex -> z-index.
- Hierarchy: Maintain parent-child relationships.
- Keep it simple: Focus on basic visual representation. Use inline styles.
`;
  }
  
  const promptSegments = [
    `The user wants to generate a LuaU script for the "${targetSectionName}" section in Roblox Studio.`,
    `The user's specific request is: "${userRequest}"`,
    `Based on this, provide the LuaU script and its explanation.`,
    `Remember to format your entire response as a single, valid JSON object.`
  ];

  if (targetSectionName === 'StarterGui') {
    promptSegments.push(
      `Include the "htmlPreview" key as per the system instruction guidelines.`,
      `Example for "StarterGui" and prompt "create a button that says Click Me":`,
      JSON.stringify({
        script: "local screenGui = Instance.new(\"ScreenGui\")\nscreenGui.Parent = game.Players.LocalPlayer:WaitForChild(\"PlayerGui\")\nlocal textButton = Instance.new(\"TextButton\")\ntextButton.Name = \"MyButton\"\ntextButton.Size = UDim2.new(0, 100, 0, 50)\ntextButton.Position = UDim2.new(0.5, -50, 0.5, -25)\ntextButton.AnchorPoint = Vector2.new(0.5, 0.5)\ntextButton.Text = \"Click Me\"\ntextButton.BackgroundColor3 = Color3.fromRGB(100, 100, 250)\ntextButton.TextColor3 = Color3.fromRGB(255, 255, 255)\ntextButton.Font = Enum.Font.SourceSans\ntextButton.TextSize = 18\ntextButton.Parent = screenGui",
        explanation: "This LocalScript creates a ScreenGui and a TextButton inside it. The button is named 'MyButton', centered on the screen, says 'Click Me', and has basic styling.",
        "htmlPreview": "<div style=\"width:300px;height:200px;border:1px solid #ccc;background-color:#f0f0f0;position:relative;overflow:auto;margin:0 auto;\"><button style=\"position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:100px;height:50px;background-color:rgb(100,100,250);color:rgb(255,255,255);font-family:Arial, sans-serif;font-size:18px;border:1px solid #666;\">Click Me</button></div>"
      }, null, 2)
    );
  } else {
    promptSegments.push(
      `Example for "ServerScriptService" and prompt "make a part print Hello":`,
      JSON.stringify({
        script: "local part = Instance.new(\"Part\")\npart.Name = \"MyPart\"\npart.Parent = game.Workspace\npart.Anchored = true\npart.BrickColor = BrickColor.Random()\n\nlocal canTouch = true\npart.Touched:Connect(function(hit)\n  if canTouch and hit.Parent:FindFirstChild(\"Humanoid\") then\n    canTouch = false\n    print(\"Hello from the part in ServerScriptService!\")\n    wait(1) -- debounce\n    canTouch = true\n  end\nend)",
        explanation: "This server script creates a new Part in the Workspace, names it 'MyPart', anchors it, and gives it a random color. When a player touches this part, it prints 'Hello from the part in ServerScriptService!' to the server console. It includes a 1-second debounce to prevent spamming."
      }, null, 2)
    );
  }
  const prompt = promptSegments.join('\n\n');


  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const parsedData = parseJsonResponse<GeminiResponse>(response.text, response.text);
    if (parsedData && typeof parsedData.script === 'string' && typeof parsedData.explanation === 'string') {
      // htmlPreview is optional as per type, its presence will be checked by consumer
      return parsedData;
    } else {
      console.error("Parsed JSON from Gemini does not match expected GeminiResponse structure:", parsedData, "Raw text:", response.text);
      throw new Error("AI response was not in the expected format for a single script. The AI might have failed to produce valid JSON with 'script' and 'explanation' keys.");
    }
  } catch (error) {
    throw handleGeminiError(error);
  }
};


export const generateUniversalScripts = async (userRequest: string): Promise<UniversalGeminiResponse> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not configured. Cannot call Gemini API.");
  }

  const systemInstruction = `You are an expert Roblox LuaU system architect and script generator.
You assist users by breaking down complex game feature requests into multiple LuaU scripts, each tailored for an appropriate Roblox Studio section.
Your output MUST be a valid JSON object. Do not include any text outside of this JSON object.
The JSON object must have a single key: "scripts".
The "scripts" key must contain an array of objects. Each object in this array represents a single script for a specific Roblox section and MUST have three keys:
1.  "sectionName": A string indicating the target Roblox Studio section (e.g., "ServerScriptService", "StarterGui", "ReplicatedStorage", "StarterPlayerScripts", "ModuleScript"). Use precise names.
2.  "script": A string containing the raw LuaU code for that section. Do NOT use markdown fences like \`\`\`lua ... \`\`\`. Ensure all special characters in the LuaU code are properly escaped for JSON string validity (e.g., newlines as \\n, quotes as \\").
3.  "explanation": A string containing a concise explanation of what this specific script does, its role in the overall system, and any setup assumptions.

CRITICAL INSTRUCTIONS FOR INSTANCES (RemoteEvents, Folders, etc.):
- For instances like RemoteEvents, RemoteFunctions, BindableEvents, BindableFunctions, Folders, or other necessary non-script instances that your system design requires (e.g., in ReplicatedStorage, ServerStorage, Workspace):
    - **DO NOT generate a script to create these instances.** Your role is to generate the LOGIC scripts that USE these instances.
    - Your LuaU scripts should directly reference these instances by their expected path (e.g., \`game:GetService('ReplicatedStorage'):WaitForChild('MyRemoteEvent')\`).
    - The \`explanation\` for any script that relies on such an instance **MUST clearly state this assumption**.

Specific instructions for StarterGui HTML Preview:
If you generate a script item for "sectionName": "StarterGui", that item's JSON object MUST also include an "htmlPreview" key.
The "htmlPreview" value should be a STRING containing simplified HTML and inline CSS to visually represent the GUI elements created by the LuaU script.
This preview is for visualization only and does not need to be interactive or pixel-perfect.

HTML Preview Guidelines (apply ONLY to "StarterGui" script items):
- Root element: '<div style="width: 300px; height: 200px; border: 1px solid #ccc; background-color: #f0f0f0; position: relative; overflow: auto; margin: 0 auto;">'. Adjust size if sensible.
- Element Mapping: Frame -> div, TextLabel -> div/p, TextButton -> button/div, ImageLabel -> img, TextBox -> input/textarea.
- UDim2 to CSS: Percentages for Scale, pixels for Offset for width, height, top, left. Position elements absolutely. E.g. Size = UDim2.new(0.5,10,0.2,5) -> style="width:calc(50% + 10px); height:calc(20% + 5px);".
- AnchorPoint (ax, ay): Use 'transform: translate(-ax*100%, -ay*100%);'.
- Colors: BackgroundColor3 -> background-color, TextColor3 -> color.
- Text: Text -> innerHTML/value, TextSize -> font-size, Font -> font-family.
- Visibility: Visible=false -> 'display: none;'. ZIndex -> z-index.
- Hierarchy: Maintain parent-child relationships. Use inline styles.

Analyze the user's request, identify necessary Roblox Studio sections for LOGIC scripts, and generate corresponding scripts, explanations, and "htmlPreview" (for StarterGui items).
Prioritize common placements. If a ModuleScript is generated, its explanation should mention where it might be placed.`;

  const prompt = `
The user wants to create a game feature or system. Their request is: "${userRequest}"

Based on this request, break it down into logical components. For each, provide "sectionName", "script", "explanation", and "htmlPreview" (if "sectionName" is "StarterGui", otherwise omit "htmlPreview").

Format your entire response as a single JSON object with a "scripts" key, where "scripts" is an array of these script items.

Example structure for a request like "a simple part that changes color on touch and shows a GUI message":
${JSON.stringify({
  "scripts": [
    {
      "sectionName": "ServerScriptService",
      "script": "local ReplicatedStorage = game:GetService(\"ReplicatedStorage\")\nlocal Players = game:GetService(\"Players\")\n\nlocal part = game.Workspace:WaitForChild(\"ColorChangePart\")\nlocal showMessageEvent = ReplicatedStorage:WaitForChild(\"ShowTouchMessageEvent\")\n\nlocal debounce = false\npart.Touched:Connect(function(hit)\n  local player = Players:GetPlayerFromCharacter(hit.Parent)\n  if player and not debounce then\n    debounce = true\n    part.Color = Color3.new(math.random(), math.random(), math.random())\n    showMessageEvent:FireClient(player, \"Part touched! Color changed.\")\n    wait(1)\n    debounce = false\n  end\nend)",
      "explanation": "This server script handles color changing for 'ColorChangePart' (assumed in Workspace) and fires 'ShowTouchMessageEvent' (assumed in ReplicatedStorage)."
    },
    {
      "sectionName": "StarterGui",
      "script": "local ReplicatedStorage = game:GetService(\"ReplicatedStorage\")\nlocal Players = game:GetService(\"Players\")\n\nlocal showMessageEvent = ReplicatedStorage:WaitForChild(\"ShowTouchMessageEvent\")\n\nlocal screenGui = Instance.new(\"ScreenGui\")\nscreenGui.Name = \"TouchMessageGui\"\nscreenGui.Parent = Players.LocalPlayer:WaitForChild(\"PlayerGui\")\n\nlocal messageLabel = Instance.new(\"TextLabel\")\nmessageLabel.Name = \"MessageLabel\"\nmessageLabel.Size = UDim2.new(0.5, 0, 0.1, 0)\nmessageLabel.Position = UDim2.new(0.25, 0, 0.1, 0)\nmessageLabel.AnchorPoint = Vector2.new(0,0)\nmessageLabel.BackgroundTransparency = 0.5\nmessageLabel.BackgroundColor3 = Color3.fromRGB(0,0,0)\nmessageLabel.TextColor3 = Color3.fromRGB(255,255,255)\nmessageLabel.TextWrapped = true\nmessageLabel.Visible = false\nmessageLabel.Parent = screenGui\n\nshowMessageEvent.OnClientEvent:Connect(function(message)\n  messageLabel.Text = message\n  messageLabel.Visible = true\n  wait(3)\n  messageLabel.Visible = false\nend)",
      "explanation": "This LocalScript in StarterGui creates a TextLabel and displays messages received via 'ShowTouchMessageEvent' (assumed in ReplicatedStorage).",
      "htmlPreview": "<div style=\"width:300px;height:200px;border:1px solid #ccc;background-color:#f0f0f0;position:relative;overflow:auto;margin:0 auto;\"><div style=\"position:absolute;left:25%;top:10%;width:50%;height:10%;background-color:rgba(0,0,0,0.5);color:rgb(255,255,255);font-family:Arial,sans-serif;font-size:14px;text-align:left;padding:2px;box-sizing:border-box;overflow:hidden;word-wrap:break-word;\"></div></div>"
    }
  ]
}, null, 2)}
Ensure all LuaU code is valid and properly escaped for JSON.
Focus on creating a functional set of LOGIC scripts.
If the request is very simple and only needs one script, still return it within the 'scripts' array with one item.
Remember to explicitly state any assumptions about pre-existing instances. DO NOT generate scripts that solely create these instances.
Only include "htmlPreview" for "StarterGui" items.
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.75, 
      },
    });
    
    const parsedData = parseJsonResponse<UniversalGeminiResponse>(response.text, response.text);

    if (parsedData && Array.isArray(parsedData.scripts) && 
        parsedData.scripts.every(item => 
            typeof item.sectionName === 'string' &&
            typeof item.script === 'string' &&
            typeof item.explanation === 'string' &&
            (item.sectionName !== 'StarterGui' || typeof item.htmlPreview === 'string' || typeof item.htmlPreview === 'undefined') // htmlPreview is optional or string for StarterGui
        )) {
      return parsedData;
    } else {
      console.error("Parsed JSON from Gemini does not match expected UniversalGeminiResponse structure:", parsedData, "Raw text:", response.text);
      throw new Error("AI response was not in the expected format for universal scripts. The AI might have failed to produce valid JSON with a 'scripts' array, where each item has 'sectionName', 'script', and 'explanation', and 'htmlPreview' if applicable.");
    }

  } catch (error) {
    throw handleGeminiError(error);
  }
};