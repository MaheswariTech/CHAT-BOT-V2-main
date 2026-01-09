import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
import time

load_dotenv("backend/.env")

api_key = os.getenv("OPENAI_API_KEY")
print(f"API Key present: {bool(api_key)}")

try:
    print("Testing general internet (google.com)...")
    import requests
    requests.get("https://www.google.com", timeout=5)
    print("Internet OK.")
except Exception as e:
    print(f"Internet check failed: {e}")

try:
    print("Testing OpenAI Chat Completion...")
    llm = ChatOpenAI(model_name="gpt-4o-mini", api_key=api_key, request_timeout=10)
    start = time.time()
    res = llm.invoke("Hello")
    print(f"OpenAI OK. Response in {time.time() - start:.2f}s: {res.content}")
except Exception as e:
    print(f"OpenAI check failed: {e}")
