from google import genai
from google.genai import types
from google.genai import *
import json
import os
from templates.json_parser import read_json, write_json
import decimal

def initializeGenai():
    client = genai.Client()


    with open("prompts/ywg_prompt_1.txt", "r") as system_prompt_file:
        system_instruction = system_prompt_file.read()

    with open("prompts/examples.txt") as example_file:
        example_prompt = example_file.read()
    # print(system_instruction)
    return (system_instruction, example_prompt, client)



def convert_decimals(obj):
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, decimal.Decimal):
        return float(obj)
    else:
        return obj
    
def processCustomerJSON(customerJSON, system_instruction, example_prompt, client):

    content = json.dumps(convert_decimals(customerJSON))
    prompt = example_prompt + "\n" + content
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash", contents=prompt,
            config=types.GenerateContentConfig(system_instruction=system_instruction, 
            response_mime_type="application/json")
        )

        return response.text
    except Exception as e:
        print("ai_conenctior.py processCustomerJson() exception:", str(e))
        return "Exception: " + e





