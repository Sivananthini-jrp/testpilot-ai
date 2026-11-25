from openai import AsyncOpenAI
from app.config import settings
from app.utils.logger import get_logger

log = get_logger(__name__)

client = AsyncOpenAI(
    api_key=settings.llm_api_key or "dummy-key",
    base_url=settings.llm_base_url
)

async def generate_test_code(function_source: str, context: str) -> str:
    system_prompt = """You are an expert Python QA engineer.
Write a valid, isolated `pytest` unit test for the provided function.

RULES:
1. Output ONLY valid Python code. No markdown blocks (no ```python).
2. The test will be executed in an isolated sandbox. DO NOT import project-specific modules (like `from app import ...`).
3. Assume the function being tested is defined directly above your test in the same file. 
4. If the function uses external dependencies, mock them using `unittest.mock`.
5. Cover edge cases and expected behavior based on the code."""

    user_prompt = (
        "Here is the source code of the function to test:\n\n"
        + function_source 
        + "\n\nContext/Static Findings: " + context 
        + "\n\nGenerate ONLY the pytest test code below:"
    )

    log.info(f"Generating test using model {settings.llm_model}...")
    
    response = await client.chat.completions.create(
        model=settings.llm_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.2,
    )
    
    raw_code = response.choices[0].message.content.strip()
    
    # FIX: Safer markdown stripping
    if "```python" in raw_code:
        raw_code = raw_code.split("```python")[1].split("```")[0]
    elif "```" in raw_code:
        raw_code = raw_code.split("```")[1].split("```")[0]
        
    return raw_code.strip()