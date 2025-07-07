import re
import json
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai


# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app_gemini")

# FastAPI app setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini API setup
genai.configure(api_key="AIzaSyBz3H6VnerOtuyUGSUMGMgGwo6NiqDxmBg")
MODEL = "gemini-2.5-flash-preview-04-17"

# Global layout state
current_layout = {
    "type": "page",
    "elements": []
}

# Prompt formatter
def build_prompt(user_prompt: str) -> str:
    return f"""
You are a UI assistant. Convert the user's prompt into a structured JSON layout object ONLY. DO NOT include any explanations or text outside the JSON.
Your response must follow these rules:

- If the prompt is about **adding** elements, return a JSON with:
  - "type": "page"
  - "elements": [ ... ]
- If the prompt is about **removing** elements (e.g., "remove button named Submit"), respond with:
  {{
    "type": "page",
    "remove": ["Submit"]  # or list of {{ "type": "input" }}
  }}
- For each added element, include optional "options" and "position" fields:
  - "position" allows specifying layout relative to another element:
    ```json
    "position": {{
      "relativeTo": "Login",    
      "placement": "above"
    }}
    ```

Examples:
---
Prompt: Add a blue submit button
Response:
{{
  "type": "page",
  "elements": [
    {{
      "type": "button",
      "label": "Submit",
      "options": {{
        "color": "#0000FF",
        "width": 120,
        "height": 40,
        "cornerRadius": 12
      }}
    }}
  ]
}}

Prompt: Remove the Submit and Cancel buttons and all input fields
Response:
{{
  "type": "page",
  "remove": [
    "Submit",
    "Cancel",
    {{ "type": "input" }}
  ]
}}

Prompt: Replace the green button with a red one
Response:
{{
  "type": "page",
  "remove": ["Green Button Label"],
  "elements": [
    {{
      "type": "button",
      "label": "Red Button",
      "options": {{
        "color": "#FF0000",
        "width": 120,
        "height": 40,
        "cornerRadius": 12
      }}
    }}
  ]
}}

Prompt: Add a checkbox for 'I agree to terms' and a dropdown to select a country
Response:
{{
  "type": "page",
  "elements": [
    {{
      "type": "checkbox",
      "label": "I agree to terms",
      "options": {{
        "checked": false
      }}
    }},
    {{
      "type": "dropdown",
      "label": "Country",
      "options": {{
        "items": ["India", "USA", "Germany", "France"],
        "default": "India",
        "width": 200,
        "height": 40
      }}
    }}
  ]
}}

Prompt: Add a bar chart for monthly revenue.
Response:
{{
  "type": "page",
  "elements": [
    {{
      "type": "barchart",
      "label": "Monthly Revenue",
      "options": {{
        "data": [
          {{ "label": "Jan", "value": 100, "color": "#4CAF50" }},
          {{ "label": "Feb", "value": 150, "color": "#2196F3" }},
          {{ "label": "Mar", "value": 200, "color": "#FFC107" }}
        ],
        "barWidth": 30,
        "barSpacing": 15,
        "height": 150
      }}
    }}
  ]
}}

Prompt: Create a button above the input field.
Output:
{{
  "type": "page",
  "elements": [
    {{
      "type": "button",
      "label": "Submit",
      "options": "position": {{
      "relativeTo": "Login",    
      "placement": "above"
    }}
    }},
    {{
      "type": "input",
      "label": "Name",
      "options": {{}}
    }}
  ]
}}

Prompt: Add a password input below username field.
Output:
{{
  "type": "page",
  "elements": [
    {{
      "type": "input",
      "label": "Username",
      "options": {{}}
    }},
    {{
      "type": "input",
      "label": "Password",
      "options": {{
        "inputType": "password"
      }}
    }}
  ]
}}

Now respond with JSON ONLY for this prompt:

Prompt: {user_prompt}
"""


# API route
@app.post("/generate-layout")
async def generate_layout(request: Request):
    global current_layout
    data = await request.json()
    prompt = data.get("prompt", "")
    logger.info(f"Received prompt: {prompt}")

    user_content = build_prompt(prompt)

    try:
        logger.info("Calling Gemini model...")
        model = genai.GenerativeModel(MODEL)
        response = model.generate_content(user_content)
        full_text = response.text
        logger.info("Generation complete. Raw output length: %d", len(full_text))
        logger.info(f"Raw Gemini output:\n{full_text}")

        # Extract clean JSON
        code_fence_pattern = r"```(?:json)?\s*([\s\S]*?)```"
        code_fence_match = re.search(code_fence_pattern, full_text)
        json_str = code_fence_match.group(1).strip() if code_fence_match else full_text.strip()
        json_match = re.search(r'\{.*\}', json_str, re.DOTALL)

        if json_match:
            json_clean = json_match.group(0)
            logger.info(f"Parsed JSON clean: {json_clean}")
        else:
            logger.error("No valid JSON found in the model output.")
            json_clean = "{}"

        layout_data = json.loads(json_clean)

        # Handle remove logic
        labels_to_remove = []
        types_to_remove = []

        remove_items = layout_data.get("remove", [])
        for item in remove_items:
            if isinstance(item, str):
                labels_to_remove.append(item)
            elif isinstance(item, dict):
                t = item.get("type")
                l = item.get("label")
                if t is not None:
                    types_to_remove.append((t, l))

        if labels_to_remove:
            logger.info(f"Removing elements with labels: {labels_to_remove}")
            current_layout["elements"] = [
                el for el in current_layout["elements"]
                if el.get("label") not in labels_to_remove
            ]

        for t, l in types_to_remove:
            logger.info(f"Removing elements with type: {t}, label: {l}")
            if l:
                current_layout["elements"] = [
                    el for el in current_layout["elements"]
                    if not (el.get("type") == t and el.get("label") == l)
                ]
            else:
                current_layout["elements"] = [
                    el for el in current_layout["elements"]
                    if el.get("type") != t
                ]

        # Add new elements
        elements = layout_data.get("elements", [])
        for el in elements:
            if "options" not in el or el["options"] is None:
                el["options"] = {}
            if el.get("type") == "password":
                el["type"] = "input"
                el["options"]["inputType"] = "password"
        current_layout["elements"].extend(elements)

        return current_layout

    except Exception as e:
        logger.error(f"Failed to generate or parse layout: {e}")
        return {"type": "page", "elements": []}
